"""
Startup Profile & Settings Endpoints - MongoDB Persisted
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.financial import FinancialRecord
from app.models.startup import StartupProfile as StartupProfileModel, UserSettings as UserSettingsModel

router = APIRouter()


async def create_financial_record_from_profile(user: User, cash_balance: float, monthly_expenses: float, monthly_revenue: float):
    """
    Create or update a FinancialRecord based on startup profile initial data.
    This ensures dashboard displays the imported data.
    
    NOTE: Only creates a record if NO financial records exist yet.
    If CSV data was already imported, we skip to avoid overwriting with averages.
    """
    # Check if user already has any financial records (e.g., from CSV import)
    existing_records = await FinancialRecord.find(
        FinancialRecord.user.id == user.id
    ).count()
    
    if existing_records > 0:
        # User already has imported data, don't overwrite with averages
        return
    
    # Only create a record if no data exists yet (manual entry scenario)
    current_month = datetime.utcnow().strftime("%Y-%m")
    
    record = FinancialRecord(
        user=user,
        month=current_month,
        cash_balance=cash_balance,
        revenue_recurring=monthly_revenue,
        revenue_one_time=0,
        expenses_salaries=monthly_expenses * 0.6,
        expenses_marketing=monthly_expenses * 0.2,
        expenses_infrastructure=monthly_expenses * 0.1,
        expenses_other=monthly_expenses * 0.1,
    )
    await record.create()


# ============== Schemas ==============

class CreateStartupInput(BaseModel):
    name: str
    industry: Optional[str] = "Technology"
    stage: Optional[str] = "mvp"
    description: Optional[str] = None
    team_size: Optional[int] = 1
    initial_cash_balance: Optional[float] = None
    initial_monthly_expenses: Optional[float] = None
    initial_monthly_revenue: Optional[float] = None
    goals: Optional[List[str]] = None


class StartupProfileResponse(BaseModel):
    id: str
    name: str
    industry: str
    stage: str
    description: Optional[str] = None
    team_size: int
    initial_cash_balance: Optional[float] = None
    initial_monthly_expenses: Optional[float] = None
    initial_monthly_revenue: Optional[float] = None
    goals: Optional[List[str]] = None
    created_at: datetime
    updated_at: datetime


class UserSettingsResponse(BaseModel):
    full_name: Optional[str] = None
    theme: str = "light"
    currency: str = "USD"
    notifications_enabled: bool = True
    email_reports: bool = False
    runway_warning_threshold: int = 6
    runway_critical_threshold: int = 3
    llm_provider: str = "groq"


class UpdateSettingsInput(BaseModel):
    full_name: Optional[str] = None
    theme: Optional[str] = None
    currency: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    email_reports: Optional[bool] = None
    runway_warning_threshold: Optional[int] = None
    runway_critical_threshold: Optional[int] = None
    llm_provider: Optional[str] = None


# ============== Startup Profile Endpoints ==============

@router.post("/profile", response_model=StartupProfileResponse)
async def create_startup_profile(
    input: CreateStartupInput,
    current_user: User = Depends(get_current_user)
):
    """Create a startup profile for the current user."""
    # Check if profile already exists
    existing = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    
    if existing:
        raise HTTPException(status_code=400, detail="Startup profile already exists. Use PUT to update.")
    
    now = datetime.utcnow()
    profile = StartupProfileModel(
        user=current_user,
        name=input.name,
        industry=input.industry or "Technology",
        stage=input.stage or "mvp",
        description=input.description,
        team_size=input.team_size or 1,
        initial_cash_balance=input.initial_cash_balance,
        initial_monthly_expenses=input.initial_monthly_expenses,
        initial_monthly_revenue=input.initial_monthly_revenue,
        goals=input.goals,
        created_at=now,
        updated_at=now
    )
    
    await profile.create()
    
    # Create FinancialRecord if financial data is provided
    if input.initial_cash_balance or input.initial_monthly_expenses or input.initial_monthly_revenue:
        await create_financial_record_from_profile(
            user=current_user,
            cash_balance=input.initial_cash_balance or 0,
            monthly_expenses=input.initial_monthly_expenses or 0,
            monthly_revenue=input.initial_monthly_revenue or 0
        )
    
    return StartupProfileResponse(
        id=str(profile.id),
        name=profile.name,
        industry=profile.industry,
        stage=profile.stage,
        description=profile.description,
        team_size=profile.team_size,
        initial_cash_balance=profile.initial_cash_balance,
        initial_monthly_expenses=profile.initial_monthly_expenses,
        initial_monthly_revenue=profile.initial_monthly_revenue,
        goals=profile.goals,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.get("/profile", response_model=StartupProfileResponse)
async def get_startup_profile(
    current_user: User = Depends(get_current_user)
):
    """Get the startup profile for the current user."""
    profile = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    
    if not profile:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    
    return StartupProfileResponse(
        id=str(profile.id),
        name=profile.name,
        industry=profile.industry,
        stage=profile.stage,
        description=profile.description,
        team_size=profile.team_size,
        initial_cash_balance=profile.initial_cash_balance,
        initial_monthly_expenses=profile.initial_monthly_expenses,
        initial_monthly_revenue=profile.initial_monthly_revenue,
        goals=profile.goals,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


@router.put("/profile", response_model=StartupProfileResponse)
async def update_startup_profile(
    input: CreateStartupInput,
    current_user: User = Depends(get_current_user)
):
    """Update the startup profile for the current user. Creates if not exists."""
    profile = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    
    if not profile:
        # Create new profile if doesn't exist (upsert behavior)
        now = datetime.utcnow()
        profile = StartupProfileModel(
            user=current_user,
            name=input.name,
            industry=input.industry or "Technology",
            stage=input.stage or "mvp",
            description=input.description,
            team_size=input.team_size or 1,
            initial_cash_balance=input.initial_cash_balance,
            initial_monthly_expenses=input.initial_monthly_expenses,
            initial_monthly_revenue=input.initial_monthly_revenue,
            goals=input.goals,
            created_at=now,
            updated_at=now
        )
        await profile.create()
    else:
        # Update existing profile
        profile.name = input.name or profile.name
        profile.industry = input.industry or profile.industry
        profile.stage = input.stage or profile.stage
        profile.description = input.description if input.description is not None else profile.description
        profile.team_size = input.team_size or profile.team_size
        profile.initial_cash_balance = input.initial_cash_balance if input.initial_cash_balance is not None else profile.initial_cash_balance
        profile.initial_monthly_expenses = input.initial_monthly_expenses if input.initial_monthly_expenses is not None else profile.initial_monthly_expenses
        profile.initial_monthly_revenue = input.initial_monthly_revenue if input.initial_monthly_revenue is not None else profile.initial_monthly_revenue
        profile.goals = input.goals if input.goals is not None else profile.goals
        profile.updated_at = datetime.utcnow()
        await profile.save()
    
    # Update FinancialRecord if financial data changed
    cash = input.initial_cash_balance if input.initial_cash_balance is not None else profile.initial_cash_balance
    expenses = input.initial_monthly_expenses if input.initial_monthly_expenses is not None else profile.initial_monthly_expenses
    revenue = input.initial_monthly_revenue if input.initial_monthly_revenue is not None else profile.initial_monthly_revenue
    
    if cash or expenses or revenue:
        await create_financial_record_from_profile(
            user=current_user,
            cash_balance=cash or 0,
            monthly_expenses=expenses or 0,
            monthly_revenue=revenue or 0
        )
    
    return StartupProfileResponse(
        id=str(profile.id),
        name=profile.name,
        industry=profile.industry,
        stage=profile.stage,
        description=profile.description,
        team_size=profile.team_size,
        initial_cash_balance=profile.initial_cash_balance,
        initial_monthly_expenses=profile.initial_monthly_expenses,
        initial_monthly_revenue=profile.initial_monthly_revenue,
        goals=profile.goals,
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


# ============== Settings Endpoints ==============

@router.get("/settings", response_model=UserSettingsResponse)
async def get_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user settings."""
    settings = await UserSettingsModel.find_one(
        UserSettingsModel.user.id == current_user.id
    )
    
    if not settings:
        # Return default settings
        return UserSettingsResponse(
            full_name=current_user.full_name
        )
    
    return UserSettingsResponse(
        full_name=settings.full_name or current_user.full_name,
        theme=settings.theme,
        currency=settings.currency,
        notifications_enabled=settings.notifications_enabled,
        email_reports=settings.email_reports,
        runway_warning_threshold=settings.runway_warning_threshold,
        runway_critical_threshold=settings.runway_critical_threshold,
        llm_provider=settings.llm_provider
    )


@router.put("/settings", response_model=UserSettingsResponse)
async def update_settings(
    input: UpdateSettingsInput,
    current_user: User = Depends(get_current_user)
):
    """Update user settings. Creates if not exists."""
    settings = await UserSettingsModel.find_one(
        UserSettingsModel.user.id == current_user.id
    )
    
    if not settings:
        # Create new settings
        settings = UserSettingsModel(
            user=current_user,
            full_name=input.full_name or current_user.full_name,
            theme=input.theme or "light",
            currency=input.currency or "USD",
            notifications_enabled=input.notifications_enabled if input.notifications_enabled is not None else True,
            email_reports=input.email_reports if input.email_reports is not None else False,
            runway_warning_threshold=input.runway_warning_threshold or 6,
            runway_critical_threshold=input.runway_critical_threshold or 3,
            llm_provider=input.llm_provider or "groq"
        )
        await settings.create()
    else:
        # Update existing settings
        if input.full_name is not None:
            settings.full_name = input.full_name
        if input.theme is not None:
            settings.theme = input.theme
        if input.currency is not None:
            settings.currency = input.currency
        if input.notifications_enabled is not None:
            settings.notifications_enabled = input.notifications_enabled
        if input.email_reports is not None:
            settings.email_reports = input.email_reports
        if input.runway_warning_threshold is not None:
            settings.runway_warning_threshold = input.runway_warning_threshold
        if input.runway_critical_threshold is not None:
            settings.runway_critical_threshold = input.runway_critical_threshold
        if input.llm_provider is not None:
            settings.llm_provider = input.llm_provider
        settings.updated_at = datetime.utcnow()
        await settings.save()
    
    return UserSettingsResponse(
        full_name=settings.full_name,
        theme=settings.theme,
        currency=settings.currency,
        notifications_enabled=settings.notifications_enabled,
        email_reports=settings.email_reports,
        runway_warning_threshold=settings.runway_warning_threshold,
        runway_critical_threshold=settings.runway_critical_threshold,
        llm_provider=settings.llm_provider
    )


# ============== User Info Endpoints ==============

@router.get("/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user info including onboarding status."""
    profile = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "onboarding_completed": profile is not None
    }


# ============== Data Export ==============

@router.get("/export")
async def export_all_data(
    current_user: User = Depends(get_current_user)
):
    """Export all user data."""
    profile = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    
    settings = await UserSettingsModel.find_one(
        UserSettingsModel.user.id == current_user.id
    )
    
    profile_data = None
    if profile:
        profile_data = {
            "id": str(profile.id),
            "name": profile.name,
            "industry": profile.industry,
            "stage": profile.stage,
            "description": profile.description,
            "team_size": profile.team_size,
            "initial_cash_balance": profile.initial_cash_balance,
            "initial_monthly_expenses": profile.initial_monthly_expenses,
            "initial_monthly_revenue": profile.initial_monthly_revenue,
            "goals": profile.goals,
            "created_at": profile.created_at.isoformat(),
            "updated_at": profile.updated_at.isoformat()
        }
    
    settings_data = UserSettingsResponse()
    if settings:
        settings_data = UserSettingsResponse(
            full_name=settings.full_name,
            theme=settings.theme,
            currency=settings.currency,
            notifications_enabled=settings.notifications_enabled,
            email_reports=settings.email_reports,
            runway_warning_threshold=settings.runway_warning_threshold,
            runway_critical_threshold=settings.runway_critical_threshold,
            llm_provider=settings.llm_provider
        )
    
    return {
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name
        },
        "startup_profile": profile_data,
        "settings": settings_data.model_dump(),
        "exported_at": datetime.utcnow().isoformat()
    }


@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user)
):
    """Delete user account and all data."""
    # Delete startup profile
    profile = await StartupProfileModel.find_one(
        StartupProfileModel.user.id == current_user.id
    )
    if profile:
        await profile.delete()
    
    # Delete user settings
    settings = await UserSettingsModel.find_one(
        UserSettingsModel.user.id == current_user.id
    )
    if settings:
        await settings.delete()
    
    # Delete financial records
    await FinancialRecord.find(
        FinancialRecord.user.id == current_user.id
    ).delete()
    
    # Delete user
    await current_user.delete()
    
    return {
        "message": "Account deleted successfully",
        "deleted_at": datetime.utcnow().isoformat()
    }

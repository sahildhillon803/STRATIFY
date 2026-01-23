from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.models.user import User
from app.models.financial import FinancialRecord
from app.schemas.financial import FinancialCreate, FinancialResponse
from app.api.v1.deps import get_current_user
from app.services.runway_engine import calculate_burn_rate, calculate_runway_months
from app.services.csv_service import process_csv_upload
from app.services.ml_forecast import forecaster

router = APIRouter()

@router.post("/", response_model=FinancialResponse)
async def create_financial_record(
    record_in: FinancialCreate,
    current_user: User = Depends(get_current_user)
):
    # Check for existing record for this month
    existing = await FinancialRecord.find_one(
        FinancialRecord.user.id == current_user.id,
        FinancialRecord.month == record_in.month
    )
    if existing:
        raise HTTPException(status_code=400, detail="Record for this month already exists")

    record = FinancialRecord(user=current_user, **record_in.model_dump())
    await record.create()
    
    # Calculate derived fields for response
    burn = calculate_burn_rate(record)
    total_rev = record.revenue_recurring + record.revenue_one_time
    total_exp = record.expenses_salaries + record.expenses_marketing + record.expenses_infrastructure + record.expenses_other

    # Exclude 'id' from model_dump to avoid duplicate
    record_data = record.model_dump(exclude={"id"})
    return FinancialResponse(
        **record_data,
        id=str(record.id),
        total_revenue=total_rev,
        total_expenses=total_exp,
        net_burn=burn
    )

@router.get("/runway", response_model=dict)
async def get_current_runway(current_user: User = Depends(get_current_user)):
    # Get latest record
    latest_record = await FinancialRecord.find(
        FinancialRecord.user.id == current_user.id
    ).sort(-FinancialRecord.month).first_or_none()

    if not latest_record:
        # Return default values for new users with no data
        from datetime import datetime
        return {
            "current_month": datetime.utcnow().strftime("%Y-%m"),
            "cash_balance": 0,
            "monthly_burn_rate": 0,
            "runway_months": 0,
            "status": "No Data",
            "has_data": False
        }

    burn_rate = calculate_burn_rate(latest_record)
    runway = calculate_runway_months(latest_record.cash_balance, burn_rate)

    return {
        "current_month": latest_record.month,
        "cash_balance": latest_record.cash_balance,
        "monthly_burn_rate": burn_rate,
        "runway_months": runway,
        "status": "Critical" if runway < 3 else "Healthy" if runway > 12 else "Warning",
        "has_data": True
    }

@router.post("/import", response_model=dict)
async def import_financial_csv(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Import financial data from a CSV file.
    """
    result = await process_csv_upload(file, current_user)
    return result

@router.get("/forecast", response_model=List[dict])
async def get_revenue_forecast(
    months: int = 6,
    current_user: User = Depends(get_current_user)
):
    """
    Predict future revenue using Linear Regression ML.
    """
    # 1. Fetch History
    records = await FinancialRecord.find(
        FinancialRecord.user.id == current_user.id
    ).sort(FinancialRecord.month).to_list()

    if not records:
        return []

    # 2. Transform for ML
    history = [
        {
            "month": r.month,
            "revenue": r.revenue_recurring + r.revenue_one_time
        }
        for r in records
    ]

    # 3. Run Prediction
    forecast = forecaster.predict_next_months(history, months_ahead=months)
    return forecast


@router.get("/export", response_model=List[FinancialResponse])
async def export_financial_data(current_user: User = Depends(get_current_user)):
    """
    Get all financial records for the user (can be saved as JSON/CSV by frontend).
    """
    records = await FinancialRecord.find(
        FinancialRecord.user.id == current_user.id
    ).sort(FinancialRecord.month).to_list()

    # We map to the response schema to hide internal IDs or raw data if needed
    response_data = []
    for r in records:
        burn = calculate_burn_rate(r)
        total_rev = r.revenue_recurring + r.revenue_one_time
        total_exp = r.expenses_salaries + r.expenses_marketing + r.expenses_infrastructure + r.expenses_other

        # Exclude 'id' from model_dump to avoid duplicate
        record_data = r.model_dump(exclude={"id"})
        response_data.append(FinancialResponse(
            **record_data,
            id=str(r.id),
            total_revenue=total_rev,
            total_expenses=total_exp,
            net_burn=burn
        ))

    return response_data
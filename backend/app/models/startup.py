"""
Startup Profile Model - Persisted to MongoDB
"""
from typing import Optional, List
from datetime import datetime
from beanie import Document, Link
from pydantic import Field
from app.models.user import User


class StartupProfile(Document):
    """Startup profile linked to a user."""
    user: Link[User]
    name: str
    industry: str = "Technology"
    stage: str = "mvp"  # idea, mvp, growth, scale
    description: Optional[str] = None
    team_size: int = 1
    
    # Financial initial values (for quick reference)
    initial_cash_balance: Optional[float] = None
    initial_monthly_expenses: Optional[float] = None
    initial_monthly_revenue: Optional[float] = None
    
    # Goals and metadata
    goals: Optional[List[str]] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "startup_profiles"
        indexes = [
            [("user", 1)],  # Index for user lookup
        ]


class UserSettings(Document):
    """User settings persisted to MongoDB."""
    user: Link[User]
    
    # Display preferences
    full_name: Optional[str] = None
    theme: str = "light"
    currency: str = "USD"
    
    # Notification settings
    notifications_enabled: bool = True
    email_reports: bool = False
    
    # Alert thresholds
    runway_warning_threshold: int = 6  # months
    runway_critical_threshold: int = 3  # months
    
    # LLM preferences
    llm_provider: str = "groq"
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "user_settings"
        indexes = [
            [("user", 1)],  # Index for user lookup
        ]

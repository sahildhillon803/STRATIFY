from typing import Optional, List
from datetime import datetime
from beanie import Document, Indexed
from pydantic import EmailStr, Field


class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: Optional[str] = None  # Optional for OAuth users
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    
    # OAuth fields
    oauth_provider: Optional[str] = None  # "google", "github", etc.
    oauth_id: Optional[str] = None  # Provider's user ID
    profile_picture: Optional[str] = None  # URL to profile picture

    class Settings:
        name = "users"  # Collection name
        indexes = [
            [("oauth_provider", 1), ("oauth_id", 1)],  # For OAuth lookups
        ]

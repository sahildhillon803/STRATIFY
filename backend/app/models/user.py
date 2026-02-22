from typing import Optional, List
from datetime import datetime
from beanie import Document, Indexed
from pydantic import EmailStr, Field
from typing import Optional
from pydantic import BaseModel

class User(Document):
    email: Indexed(str, unique=True)  # Email field with unique index
    hashed_password: Optional[str] = None  # Optional for OAuth users
    full_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
    company_name: Optional[str] = "My Startup"
    company_description: Optional[str] = None  # Add this line!
    
    # OAuth fields
    oauth_provider: Optional[str] = None  # "google", "github", etc.
    oauth_id: Optional[str] = None  # Provider's user ID
    profile_picture: Optional[str] = None  # URL to profile picture

    class Settings:
        name = "users"  # Collection name

from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator


# Properties to receive via API on creation
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


# Properties to return via API (no password!)
class UserResponse(BaseModel):
    id: str  # Beanie IDs are Pydantic ObjectIds, we'll serialize to string
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    """Request body for initiating password reset."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Request body for confirming password reset with new password."""
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class PasswordResetResponse(BaseModel):
    """Response after password reset request."""
    message: str
    # In production, you'd send an email. For demo, we return the token.
    reset_token: Optional[str] = None  # Only returned in development mode


class PasswordChangeRequest(BaseModel):
    """Request body for changing password when logged in."""
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


# Google OAuth Schemas
class GoogleAuthRequest(BaseModel):
    """Request body for Google OAuth login."""
    credential: str  # Google ID token from frontend


class GoogleAuthResponse(BaseModel):
    """Response after successful Google OAuth."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"
    is_new_user: bool = False


class UserResponseWithPicture(BaseModel):
    """User response with profile picture for OAuth users."""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool
    profile_picture: Optional[str] = None
    oauth_provider: Optional[str] = None

    class Config:
        from_attributes = True

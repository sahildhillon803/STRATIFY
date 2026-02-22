from datetime import datetime, timedelta
from typing import Any, Union, Optional
from jose import jwt, JWTError
import bcrypt
from app.core.config import settings

# Algorithm used for JWT encoding/decoding
ALGORITHM = "HS256"

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    """
    Create a JWT access token.
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # Default expiration from settings
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    # Convert subject to string to ensure JSON serialization
    to_encode = {"exp": expire, "sub": str(subject)}
    
    # Ensure SECRET_KEY is valid before encoding
    if not settings.SECRET_KEY:
        raise ValueError("SECRET_KEY is not set in environment variables.")

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """
    Create a token for password reset.
    Token expires in 1 hour.
    """
    expire = datetime.utcnow() + timedelta(hours=1)
    to_encode = {
        "exp": expire,
        "sub": email,
        "type": "password_reset"
    }
    
    if not settings.SECRET_KEY:
        raise ValueError("SECRET_KEY is not set in environment variables.")
        
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify password reset token and return email if valid.
    Returns None if token is invalid or expired.
    """
    try:
        if not settings.SECRET_KEY:
            raise ValueError("SECRET_KEY is not set.")

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify this is a password reset token
        if payload.get("type") != "password_reset":
            return None
            
        email: str = payload.get("sub")
        return email
    except (JWTError, ValueError):
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return bcrypt.checkpw(
        plain_password.encode('utf-8'), 
        hashed_password.encode('utf-8')
    )


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
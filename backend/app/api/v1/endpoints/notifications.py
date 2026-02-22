from fastapi import APIRouter, Depends
from typing import List
from app.api.v1.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: User = Depends(get_current_user)):
    """
    Get notifications for the current user.
    Returns empty list for now - can be extended with actual notification logic.
    """
    # Return format expected by frontend: { notifications: [...] }
    return {"notifications": []}
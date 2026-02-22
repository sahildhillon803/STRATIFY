from fastapi import APIRouter, Depends
from typing import Optional

# --- THE FIX: Import BOTH the class (for typing) and the instance (for data) ---
from app.services.investor_matching import InvestorMatchingService, investor_service_instance
from app.schemas.investor import MatchResults, MatchRequest

router = APIRouter()

def get_matching_service():
    # Return the global instance from RAM
    return investor_service_instance

# ... your routes stay exactly the same ...


@router.post("/investors", response_model=MatchResults)
async def match_investors(
    request: MatchRequest, 
    service: InvestorMatchingService = Depends(get_matching_service)
):
    # Pass the JSON body data directly into the AI service
    results = await service.get_matches(
        startup_id=0,
        startup_description=request.startup_description,
        raise_amount=request.raise_amount,
        stage=request.stage
    )
    return {"status": "success", "top_investors": results}

from typing import Optional # <-- Add this import at the top

# ... existing imports ...

# --- ADD THESE NEW ROUTES TO THE BOTTOM ---

@router.get("/filter-options")
async def get_investor_filter_options(
    service: InvestorMatchingService = Depends(get_matching_service)
):
    """Populates the filter dropdowns in the UI"""
    return service.get_filter_options()

@router.get("/all")
async def get_all_investors_filtered(
    stage: Optional[str] = "All",
    hq: Optional[str] = "All",
    sort_by: Optional[str] = "name_asc",
    limit: int = 50,
    skip: int = 0,
    service: InvestorMatchingService = Depends(get_matching_service)
):
    """The classic filter/sort endpoint"""
    results, total = service.filter_investors(stage, hq, sort_by, limit, skip)
    return {"status": "success", "investors": results, "total": total}
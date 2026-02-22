from pydantic import BaseModel
from typing import List

# 1. The blueprint for the incoming request from the React frontend
class MatchRequest(BaseModel):
    startup_description: str
    raise_amount: float
    stage: str

# 2. The blueprint for a single matched investor returning to React
class InvestorMatchResponse(BaseModel):
    investor_id: int
    name: str
    match_score: float
    website: str
    hq: str
    type: str

# 3. The blueprint for the full response payload
class MatchResults(BaseModel):
    status: str
    top_investors: List[InvestorMatchResponse]
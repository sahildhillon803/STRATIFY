import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.services.ai_service import generate_strategy_ideas
from app.models.financial import FinancialRecord
from app.services.runway_engine import calculate_burn_rate, calculate_runway_months
from app.api.v1.endpoints import matching
# ... existing imports ...
from app.api.v1.endpoints import matching

# --- NEW IMPORT FOR RAG INJECTION ---
from app.services.investor_matching import investor_service_instance

# --- NEW IMPORTS FOR CFO AGENT ---
from groq import Groq
from app.core.config import settings

router = APIRouter()
router.include_router(matching.router, prefix="/match", tags=["Matching"])

# ==========================================
# EXISTING CODE (UNCHANGED)
# ==========================================

class StrategyRequest(BaseModel):
    context: Optional[str] = None  # User's description of their situation

@router.post("/suggest-strategy")
async def get_ai_suggestions(
    request: StrategyRequest = None,
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI-powered strategy suggestions based on:
    1. User's description of their situation (from request)
    2. Financial data from the database
    """
    
    # 1. Get user's context from request
    user_situation = ""
    if request and request.context:
        user_situation = f"USER'S CURRENT SITUATION:\n{request.context}\n\n"
    
    # 2. Gather Financial Context from database
    latest_record = await FinancialRecord.find(
        FinancialRecord.user.id == current_user.id
    ).sort(-FinancialRecord.month).first_or_none()

    if not latest_record:
        financial_summary = "No financial data available yet. Assume early-stage startup."
    else:
        burn = calculate_burn_rate(latest_record)
        runway = calculate_runway_months(latest_record.cash_balance, burn)
        
        total_revenue = latest_record.revenue_recurring + (latest_record.revenue_one_time or 0)
        total_expenses = (
            latest_record.expenses_salaries + 
            latest_record.expenses_marketing + 
            latest_record.expenses_infrastructure + 
            latest_record.expenses_other
        )
        
        financial_summary = f"""
Cash Balance: ${latest_record.cash_balance:,.0f}
Monthly Revenue: ${total_revenue:,.0f}
Monthly Expenses: ${total_expenses:,.0f}
Monthly Burn Rate: ${burn:,.0f}
Runway: {runway:.1f} months
"""

    # 3. Gather User Profile Context
    user_context = f"Founder: {current_user.full_name or 'Startup Founder'}."

    # 4. Combine all context
    full_context = f"{user_situation}FINANCIAL DATA:\n{financial_summary}"

    # 5. Call AI Service
    raw_json = await generate_strategy_ideas(full_context, user_context)

    # 6. Parse and Return
    try:
        parsed_response = json.loads(raw_json)
        
        # Check for error in response
        if "error" in parsed_response:
            raise HTTPException(status_code=500, detail=parsed_response["error"])
        
        return parsed_response
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response format.")


# ==========================================
# NEW CFO AGENT CODE
# ==========================================

# Initialize Groq Client
client = Groq(api_key=settings.GROQ_API_KEY)

# --- Schema for Chat Request ---
class ChatRequest(BaseModel):
    message: str
    context_months: Optional[int] = 12  # How many months of data to look at

# --- Helper: Get Financial Context ---
# --- Helper: Get Financial Context ---
async def get_financial_context(user: User, months: int) -> str:
    """
    Fetches financial records and passes pre-calculated profit/burn to the LLM.
    """
    records = await FinancialRecord.find(
        FinancialRecord.user.id == user.id
    ).sort(-FinancialRecord.month).limit(months).to_list()
    
    if not records:
        return "No financial data available."

    data_summary = []
    for r in records:
        total_rev = r.revenue_recurring + (r.revenue_one_time or 0)
        total_exp = r.expenses_salaries + r.expenses_marketing + r.expenses_infrastructure + r.expenses_other
        net_income = total_rev - total_exp
        
        data_summary.append({
            "Month": r.month,
            "Revenue": total_rev,
            "Expenses": total_exp,
            "Net_Income": net_income, # If positive, they are profitable. If negative, it's burn.
            "Cash_Bank": r.cash_balance,
        })
    
    return json.dumps(data_summary, indent=2)


# --- Endpoint 1: Chat with CFO ---
@router.post("/chat")
async def chat_with_cfo(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    """
    RAG-Lite: Injects financial data and Startify AI Matchmaker data into the system prompt.
    """
    try:
        financial_data = await get_financial_context(current_user, request.context_months)
        
        # 1. Pre-calculate Runway so the LLM doesn't have to do math
        latest_record = await FinancialRecord.find(
            FinancialRecord.user.id == current_user.id
        ).sort(-FinancialRecord.month).first_or_none()
        
        current_runway_status = "Unknown"
        raise_amount = 2000000.0 # Default to a $2M raise
        
       # 1. Pre-calculate Runway
        # ... (keep the first part the same) ...
        
        if latest_record:
            total_rev = latest_record.revenue_recurring + (latest_record.revenue_one_time or 0)
            total_exp = latest_record.expenses_salaries + latest_record.expenses_marketing + latest_record.expenses_infrastructure + latest_record.expenses_other
            net_income = total_rev - total_exp
            
            if net_income < 0:
                burn = abs(net_income)
                months_left = latest_record.cash_balance / burn
                current_runway_status = f"{months_left:.1f} months of runway remaining."
                raise_amount = float(burn * 18) 
                target_stage = "Seed" # Startups burning cash usually need Seed
            else:
                current_runway_status = f"Infinite (Company is profitable by ${net_income:,.0f}/month)."
                # THE FIX: Standardize profitable SaaS raise to $5M Series A
                raise_amount = 5000000.0 
                target_stage = "Series A"

        # 2. Intercept Investor Intent & Run Matchmaker
        investor_context = ""
        keywords = ["investor", "raise", "funding", "vc", "pitch", "capital", "match"]
        needs_investors = any(word in request.message.lower() for word in keywords)
        
        if needs_investors:
            print(f"🔍 CFO Agent detected investor intent. Running Matchmaker for ${raise_amount:,.0f} at {target_stage} stage...")
            
            # --- THE DYNAMIC VISION FIX ---
            # Pull the actual description from the user's database profile.
            # If they haven't filled it out yet, fall back to a generic description.
            real_vision = getattr(current_user, 'company_description', None) 
            if not real_vision:
                real_vision = "A fast-growing tech startup looking for strategic venture capital."
            
            # Run the Matchmaker using their actual vision!
            matches = await investor_service_instance.get_matches(
                startup_id=current_user.id or 1,
                startup_description=real_vision, # <-- Injected right here
                raise_amount=raise_amount,
                stage=target_stage
            )
            # ------------------------------
            
            if matches:
                investor_context = "\n\n--- STARTIFY AI MATCHMAKER DATA ---\n"
                investor_context += f"The system calculates the ideal raise amount is ${raise_amount:,.0f} for a {target_stage} round.\n"
                investor_context += "Here are the top real-time VC matches from the Startify Database:\n"
                for i, m in enumerate(matches[:3]):
                    investor_context += f"{i+1}. {m['name']} ({m['hq']}) - Type: {m['type']} - Match Score: {m['match_score']:.2f}\n"
                investor_context += "\nCRITICAL RULE: You MUST explicitly list these specific investors in your response and recommend them to the user."
        # 3. Build the heavily fortified System Prompt
        system_prompt = f"""
        You are an expert Startup CFO for Startify. You are helpful, concise, and data-driven.
        
        FINANCIAL DATA (Last {request.context_months} months):
        {financial_data}
        
        CURRENT RUNWAY STATUS: {current_runway_status}
        {investor_context}
        
        STRICT RULES:
        1. NEVER calculate runway yourself. Use the EXACT "CURRENT RUNWAY STATUS" provided above.
        2. Look at "Net_Income". If it is positive, the company is highly PROFITABLE. Do not tell them they have a burn rate. Congratulate them on profitability.
        3. If Startify Matchmaker Data is provided above, you MUST list the 3 specific investors by name.
        """

        # 4. Call Groq
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1, # Extra low temp to prevent hallucinations
        )
        
        return {"response": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --- Endpoint 2: Generate Executive Summary ---
@router.post("/report")
async def generate_executive_report(
    current_user: User = Depends(get_current_user)
):
    """
    Generates a Board Update Email based on the last 3 months of performance.
    """
    try:
        # 1. Fetch Data (Last 3 months for trends)
        context = await get_financial_context(current_user, 3)
        
        # 2. Prompt for Report
        prompt = f"""
        You are writing a Monthly Investor Update email for the CEO.
        Use this financial data:
        {context}
        
        Structure the email:
        1. Highlights (1-2 bullet points on growth or runway)
        2. Lowlights/Challenges (Where did costs go up? High burn?)
        3. Cash Position (Current bank balance & runway)
        4. Outlook (Brief sentiment for next month)
        
        Tone: Professional, transparent, and concise. No fluff.
        """
        
        completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.5, # Higher temp for better writing flow
        )

        return {"report": completion.choices[0].message.content}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
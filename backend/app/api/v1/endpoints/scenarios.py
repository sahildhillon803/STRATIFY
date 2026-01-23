"""
What-If Scenario Analyzer API endpoints (FR-5).

Provides endpoints to test the financial impact of hypothetical
business decisions before executing them.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.financial import FinancialRecord
from app.schemas.scenario import (
    ScenarioRequest,
    CompareRequest,
    ScenarioResultResponse,
    ScenarioComparisonResponse,
    ScenarioTemplatesResponse,
    FinancialSnapshotResponse,
    ScenarioTypeEnum,
    RiskLevelEnum
)
from app.services.scenario_engine import (
    ScenarioEngine,
    ScenarioInput,
    ScenarioType,
    create_scenario_engine_from_record
)

router = APIRouter()


@router.get("/")
async def get_scenarios(current_user: User = Depends(get_current_user)):
    """
    Get all saved scenarios for the current user.
    Returns empty list for users with no scenarios.
    """
    # For now, return empty list as scenarios are not persisted
    # In future, this could fetch from a scenarios collection
    return []


async def _get_latest_financial_record(user: User) -> dict:
    """Fetch the latest financial record for the user."""
    record = await FinancialRecord.find(
        FinancialRecord.user.id == user.id
    ).sort(-FinancialRecord.month).first_or_none()
    
    if not record:
        raise HTTPException(
            status_code=404,
            detail="No financial data found. Please add financial records first."
        )
    
    return {
        "month": record.month,
        "cash_balance": record.cash_balance,
        "revenue_recurring": record.revenue_recurring,
        "revenue_one_time": record.revenue_one_time,
        "expenses_salaries": record.expenses_salaries,
        "expenses_marketing": record.expenses_marketing,
        "expenses_infrastructure": record.expenses_infrastructure,
        "expenses_other": record.expenses_other,
    }


def _convert_request_to_input(request: ScenarioRequest) -> ScenarioInput:
    """Convert API request schema to engine input."""
    return ScenarioInput(
        scenario_type=ScenarioType(request.scenario_type.value),
        name=request.name,
        new_salary=request.new_salary,
        num_hires=request.num_hires,
        marketing_change=request.marketing_change,
        revenue_change_percent=request.revenue_change_percent,
        revenue_loss=request.revenue_loss,
        investment_amount=request.investment_amount,
        expense_cut=request.expense_cut,
        expense_category=request.expense_category,
        custom_revenue_change=request.custom_revenue_change,
        custom_expense_change=request.custom_expense_change,
        custom_cash_change=request.custom_cash_change,
    )


def _convert_result_to_response(result) -> ScenarioResultResponse:
    """Convert engine result to API response."""
    return ScenarioResultResponse(
        scenario_name=result.scenario_name,
        scenario_type=ScenarioTypeEnum(result.scenario_type.value),
        baseline=FinancialSnapshotResponse(
            cash_balance=result.baseline.cash_balance,
            monthly_revenue=result.baseline.monthly_revenue,
            monthly_expenses=result.baseline.monthly_expenses,
            burn_rate=result.baseline.burn_rate,
            runway_months=result.baseline.runway_months,
            risk_level=RiskLevelEnum(result.baseline.risk_level.value)
        ),
        projected=FinancialSnapshotResponse(
            cash_balance=result.projected.cash_balance,
            monthly_revenue=result.projected.monthly_revenue,
            monthly_expenses=result.projected.monthly_expenses,
            burn_rate=result.projected.burn_rate,
            runway_months=result.projected.runway_months,
            risk_level=RiskLevelEnum(result.projected.risk_level.value)
        ),
        runway_change=result.runway_change,
        burn_rate_change=result.burn_rate_change,
        risk_change=result.risk_change,
        break_even_months=result.break_even_months,
        summary=result.summary,
        recommendation=result.recommendation
    )


@router.post("/simulate", response_model=ScenarioResultResponse)
async def simulate_scenario(
    request: ScenarioRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Simulate a single what-if scenario.
    
    Test the impact of a business decision on your runway, burn rate, and risk level.
    """
    record = await _get_latest_financial_record(current_user)
    engine = create_scenario_engine_from_record(record)
    
    scenario_input = _convert_request_to_input(request)
    result = engine.simulate_scenario(scenario_input)
    
    return _convert_result_to_response(result)


@router.post("/compare", response_model=ScenarioComparisonResponse)
async def compare_scenarios(
    request: CompareRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Compare multiple scenarios side-by-side.
    
    Run multiple what-if scenarios and see which one provides the best outcome.
    """
    record = await _get_latest_financial_record(current_user)
    engine = create_scenario_engine_from_record(record)
    
    scenario_inputs = [_convert_request_to_input(s) for s in request.scenarios]
    comparison = engine.compare_scenarios(scenario_inputs)
    
    return ScenarioComparisonResponse(
        baseline=FinancialSnapshotResponse(
            cash_balance=comparison.baseline.cash_balance,
            monthly_revenue=comparison.baseline.monthly_revenue,
            monthly_expenses=comparison.baseline.monthly_expenses,
            burn_rate=comparison.baseline.burn_rate,
            runway_months=comparison.baseline.runway_months,
            risk_level=RiskLevelEnum(comparison.baseline.risk_level.value)
        ),
        scenarios=[_convert_result_to_response(r) for r in comparison.scenarios],
        best_scenario=comparison.best_scenario,
        comparison_generated_at=comparison.comparison_generated_at
    )


@router.get("/templates", response_model=ScenarioTemplatesResponse)
async def get_scenario_templates():
    """
    Get pre-built scenario templates with example parameters.
    """
    templates = [
        {
            "id": "hire_employee",
            "name": "Hire New Employee",
            "description": "Test the impact of adding team members",
            "parameters": {
                "scenario_type": "hire_employee",
                "name": "Hire 1 Engineer",
                "new_salary": 6000,
                "num_hires": 1
            },
            "example_use": "Planning to hire a developer at $6k/month"
        },
        {
            "id": "increase_marketing",
            "name": "Increase Marketing Spend",
            "description": "Test boosting marketing budget",
            "parameters": {
                "scenario_type": "change_marketing",
                "name": "Boost Marketing",
                "marketing_change": 2000
            },
            "example_use": "Increase ads budget by $2k/month"
        },
        {
            "id": "decrease_marketing",
            "name": "Decrease Marketing Spend",
            "description": "Test reducing marketing to extend runway",
            "parameters": {
                "scenario_type": "change_marketing",
                "name": "Cut Marketing",
                "marketing_change": -1500
            },
            "example_use": "Reduce marketing by $1.5k/month to save cash"
        },
        {
            "id": "price_increase",
            "name": "Raise Prices",
            "description": "Test the impact of increasing prices",
            "parameters": {
                "scenario_type": "change_pricing",
                "name": "10% Price Increase",
                "revenue_change_percent": 10
            },
            "example_use": "Raise prices by 10%, assuming no churn"
        },
        {
            "id": "lose_customer",
            "name": "Lose Major Customer",
            "description": "Prepare for potential customer churn",
            "parameters": {
                "scenario_type": "lose_customer",
                "name": "Lose Key Account",
                "revenue_loss": 3000
            },
            "example_use": "What if we lose a $3k/month customer?"
        },
        {
            "id": "seed_funding",
            "name": "Receive Seed Funding",
            "description": "Model the impact of raising capital",
            "parameters": {
                "scenario_type": "receive_investment",
                "name": "Seed Round",
                "investment_amount": 250000
            },
            "example_use": "Close a $250k seed round"
        },
        {
            "id": "cut_expenses",
            "name": "Cut Operating Expenses",
            "description": "Test expense reduction strategies",
            "parameters": {
                "scenario_type": "cut_expenses",
                "name": "Reduce Overhead",
                "expense_cut": 2000
            },
            "example_use": "Cut $2k/month in operating costs"
        },
        {
            "id": "custom",
            "name": "Custom Scenario",
            "description": "Build your own scenario with custom values",
            "parameters": {
                "scenario_type": "custom",
                "name": "My Custom Scenario",
                "custom_revenue_change": 0,
                "custom_expense_change": 0,
                "custom_cash_change": 0
            },
            "example_use": "Mix and match revenue, expense, and cash changes"
        }
    ]
    
    return ScenarioTemplatesResponse(templates=templates)


@router.get("/baseline", response_model=FinancialSnapshotResponse)
async def get_current_baseline(
    current_user: User = Depends(get_current_user)
):
    """
    Get the current financial baseline (before any scenarios).
    
    Useful for understanding your starting point before running simulations.
    """
    record = await _get_latest_financial_record(current_user)
    engine = create_scenario_engine_from_record(record)
    baseline = engine._get_baseline_snapshot()
    
    return FinancialSnapshotResponse(
        cash_balance=baseline.cash_balance,
        monthly_revenue=baseline.monthly_revenue,
        monthly_expenses=baseline.monthly_expenses,
        burn_rate=baseline.burn_rate,
        runway_months=baseline.runway_months,
        risk_level=RiskLevelEnum(baseline.risk_level.value)
    )

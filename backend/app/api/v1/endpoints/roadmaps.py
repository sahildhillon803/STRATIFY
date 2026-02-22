"""
Smart Execution Roadmap API endpoints (FR-7).

Provides endpoints to generate actionable execution plans
from strategies or pivot ideas using LLM intelligence.
"""

from fastapi import APIRouter, Depends, HTTPException
from app.api.v1.deps import get_current_user
from app.models.user import User
from app.models.financial import FinancialRecord
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapFromStrategyRequest,
    RoadmapResponse,
    RoadmapExportResponse,
    RoadmapPhaseResponse,
    TaskItemResponse,
    PhaseKPIResponse
)
from app.services.roadmap_service import (
    generate_roadmap,
    export_roadmap_to_markdown,
    RoadmapRequest
)
from app.services.runway_engine import calculate_burn_rate, calculate_runway_months

router = APIRouter()


async def _get_user_context(user: User) -> tuple:
    """Get user's financial context for roadmap generation."""
    record = await FinancialRecord.find(
        FinancialRecord.user.id == user.id
    ).sort(-FinancialRecord.month).first_or_none()
    
    if record:
        burn = calculate_burn_rate(record)
        runway = calculate_runway_months(record.cash_balance, burn)
        context = f"Current runway: {runway:.1f} months. Monthly burn: ${burn:.0f}."
        return runway, context
    
    return None, "No financial data available."


def _convert_roadmap_to_response(roadmap) -> RoadmapResponse:
    """Convert internal roadmap model to API response."""
    phases = []
    for phase in roadmap.phases:
        tasks = [
            TaskItemResponse(
                id=t.id,
                title=t.title,
                description=t.description,
                estimated_hours=t.estimated_hours,
                assignee_role=t.assignee_role,
                is_completed=t.is_completed
            )
            for t in phase.tasks
        ]
        
        kpis = [
            PhaseKPIResponse(
                metric=k.metric,
                target=k.target,
                measurement_method=k.measurement_method
            )
            for k in phase.kpis
        ]
        
        phases.append(RoadmapPhaseResponse(
            phase_number=phase.phase_number,
            title=phase.title,
            description=phase.description,
            duration_weeks=phase.duration_weeks,
            tasks=tasks,
            kpis=kpis,
            resources_needed=phase.resources_needed,
            dependencies=phase.dependencies,
            risks=phase.risks
        ))
    
    return RoadmapResponse(
        id=roadmap.id,
        title=roadmap.title,
        strategy_description=roadmap.strategy_description,
        total_duration_weeks=roadmap.total_duration_weeks,
        phases=phases,
        success_criteria=roadmap.success_criteria,
        budget_estimate=roadmap.budget_estimate,
        created_at=roadmap.created_at
    )


@router.get("/", response_model=dict)
async def list_roadmaps(current_user: User = Depends(get_current_user)):
    """
    List saved roadmaps for the current user.
    Returns empty list until roadmap persistence is implemented.
    """
    return {"roadmaps": []}


@router.post("/generate", response_model=RoadmapResponse)
async def generate_execution_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate an execution roadmap for a strategy.
    
    Uses AI to create a detailed, phase-based execution plan with:
    - 3-5 phases with specific tasks
    - Timeline estimates
    - KPIs for each phase
    - Resource requirements
    - Dependencies and risks
    """
    # Get user context
    runway, user_context = await _get_user_context(current_user)
    
    # Use provided runway or detected runway
    available_runway = request.available_runway_months or runway
    
    # Build roadmap request
    roadmap_request = RoadmapRequest(
        strategy_title=request.strategy_title,
        strategy_description=request.strategy_description,
        available_runway_months=available_runway,
        team_size=request.team_size,
        budget_constraint=request.budget_constraint,
        priority=request.priority
    )
    
    try:
        roadmap = await generate_roadmap(roadmap_request, user_context)
        return _convert_roadmap_to_response(roadmap)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap: {str(e)}")


@router.post("/export", response_model=RoadmapExportResponse)
async def export_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate and export a roadmap in Markdown format.
    
    The exported markdown can be:
    - Saved as a .md file
    - Imported into project management tools
    - Shared with team members
    - Converted to PDF
    """
    # Get user context
    runway, user_context = await _get_user_context(current_user)
    
    roadmap_request = RoadmapRequest(
        strategy_title=request.strategy_title,
        strategy_description=request.strategy_description,
        available_runway_months=request.available_runway_months or runway,
        team_size=request.team_size,
        budget_constraint=request.budget_constraint,
        priority=request.priority
    )
    
    try:
        roadmap = await generate_roadmap(roadmap_request, user_context)
        markdown = export_roadmap_to_markdown(roadmap)
        
        return RoadmapExportResponse(
            roadmap_id=roadmap.id,
            title=roadmap.title,
            markdown_content=markdown,
            export_format="markdown"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export roadmap: {str(e)}")


@router.get("/templates", response_model=dict)
async def get_roadmap_templates():
    """
    Get example strategy templates that can be used to generate roadmaps.
    """
    return {
        "templates": [
            {
                "id": "pivot_b2b",
                "title": "Pivot to B2B Model",
                "description": "Transform consumer product into a B2B SaaS offering targeting enterprises",
                "suggested_team_size": 3,
                "typical_duration_weeks": 12
            },
            {
                "id": "launch_mvp",
                "title": "MVP Launch Strategy",
                "description": "Plan and execute the launch of a minimum viable product to validate market fit",
                "suggested_team_size": 2,
                "typical_duration_weeks": 8
            },
            {
                "id": "expand_market",
                "title": "Market Expansion",
                "description": "Expand into a new geographic market or customer segment",
                "suggested_team_size": 4,
                "typical_duration_weeks": 16
            },
            {
                "id": "product_led_growth",
                "title": "Product-Led Growth Initiative",
                "description": "Implement PLG strategies including freemium model, viral loops, and self-serve onboarding",
                "suggested_team_size": 3,
                "typical_duration_weeks": 10
            },
            {
                "id": "cost_optimization",
                "title": "Cost Optimization Program",
                "description": "Systematically reduce burn rate while maintaining growth trajectory",
                "suggested_team_size": 2,
                "typical_duration_weeks": 6
            },
            {
                "id": "fundraising_prep",
                "title": "Fundraising Preparation",
                "description": "Prepare for seed/series round including metrics, pitch deck, and investor outreach",
                "suggested_team_size": 2,
                "typical_duration_weeks": 8
            }
        ],
        "usage_tip": "Use these templates as starting points. Customize the strategy_description with your specific context for better roadmaps."
    }

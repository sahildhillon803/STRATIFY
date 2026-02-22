"""
Smart Execution Roadmap Generator for STRATA-AI (FR-7)

This module generates actionable, milestone-based execution plans
from selected strategies or pivot ideas using LLM intelligence.

Features:
- Phase-wise breakdown (3-5 phases)
- Specific tasks within each phase
- Timeline and KPIs per phase
- Resource requirements
- Dependencies and risks
- Export capability (Markdown format)
"""

import json
from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field
from groq import AsyncGroq
from app.core.config import settings


class TaskItem(BaseModel):
    """A single task within a phase."""
    id: str
    title: str
    description: str
    estimated_hours: Optional[int] = None
    assignee_role: Optional[str] = None
    is_completed: bool = False


class PhaseKPI(BaseModel):
    """Key Performance Indicator for a phase."""
    metric: str
    target: str
    measurement_method: str


class RoadmapPhase(BaseModel):
    """A single phase in the execution roadmap."""
    phase_number: int
    title: str
    description: str
    duration_weeks: int
    tasks: List[TaskItem]
    kpis: List[PhaseKPI]
    resources_needed: List[str]
    dependencies: List[str]
    risks: List[str]


class ExecutionRoadmap(BaseModel):
    """Complete execution roadmap."""
    id: str
    title: str
    strategy_description: str
    total_duration_weeks: int
    phases: List[RoadmapPhase]
    success_criteria: List[str]
    budget_estimate: Optional[str] = None
    created_at: str
    

class RoadmapRequest(BaseModel):
    """Request for generating a roadmap."""
    strategy_title: str = Field(..., description="Title of the strategy/pivot to execute")
    strategy_description: str = Field(..., description="Detailed description of the strategy")
    available_runway_months: Optional[float] = Field(None, description="Current runway in months")
    team_size: Optional[int] = Field(None, description="Current team size")
    budget_constraint: Optional[str] = Field(None, description="Budget constraints or notes")
    priority: Optional[str] = Field(None, description="Priority level: low, medium, high")


# Initialize Groq client
client = AsyncGroq(api_key=settings.GROQ_API_KEY)


ROADMAP_SYSTEM_PROMPT = """
### ROLE
You are an elite Technical Program Manager and Product Lead. Your goal is to translate high-level business strategies into a rigorous, operational execution roadmap. You do not deal in fluff; you deal in tickets, deliverables, and critical paths.

### INPUT DATA
You will be provided with a STRATEGY and STARTUP CONTEXT.

### EXECUTION GUIDELINES
1. **Logical Sequencing:** Phases must adhere to dependencies. (e.g., Do not schedule "Analyze User Data" before "Implement Analytics SDK").
2. **Resource Reality:** Assume a lean startup environment unless specified otherwise. Timelines must account for QA, iteration, and unexpected bugs.
3. **Measurable Outcomes:** Every phase must end with a clear "Go/No-Go" milestone.

### TASK GENERATION RULES (CRITICAL)
Every task object must be granular enough to be a Jira/Linear ticket.
- **Description:** Must follow the structure: [ACTION] -> [TARGET] -> [PURPOSE].
- **Success Criteria:** Must be binary (True/False) or numeric. "Better UX" is invalid; "Reduce click-depth to 2" is valid.
- **Tools:** Explicitly name the tools or stacks required (e.g., "Use Figma for prototyping," "Use Python/Pandas for analysis").

### OUTPUT FORMAT
Return ONLY raw, valid JSON. Do not include markdown formatting (like ```json), distinct introductions, or conclusions. 

JSON STRUCTURE:
{
    "title": "Roadmap Name (Action Oriented)",
    "total_duration_weeks": Integer,
    "risk_level": "Low" | "Medium" | "High",
    "phases": [
        {
            "phase_number": Integer,
            "title": "Phase Name",
            "objective": "One sentence summary of the goal",
            "duration_weeks": Integer,
            "tasks": [
                {
                    "id": "String (e.g., '1.1')",
                    "title": "Task Name (Start with Verb)",
                    "description": "Detailed execution steps. Include: WHAT to do, HOW to do it (tools/methods), and OUTPUT (link, doc, code, etc.)",
                    "estimated_hours": Integer,
                    "assignee_role": "String (e.g., 'Backend Eng', 'Growth Marketer')",
                    "priority": "High" | "Medium" | "Low"
                }
            ],
            "kpis": [
                {
                    "metric": "String",
                    "target": "String (Must include number)",
                    "tracking_method": "String"
                }
            ],
            "resources_needed": ["String"],
            "dependencies": ["String (Task IDs or External Events)"],
            "risks": ["String"]
        }
    ],
    "success_criteria": ["String"],
    "budget_estimate": "String (e.g., '$5,000 - $8,000')"
}
"""


async def generate_roadmap(request: RoadmapRequest, user_context: str = "") -> ExecutionRoadmap:
    """
    Generate an execution roadmap using LLM.
    
    Args:
        request: RoadmapRequest with strategy details
        user_context: Additional context about the user/startup
    
    Returns:
        ExecutionRoadmap with phases, tasks, and KPIs
    """
    if not settings.GROQ_API_KEY:
        raise ValueError("No AI API Key configured")
    
    # Build context prompt
    context_parts = [
        f"Strategy to Execute: {request.strategy_title}",
        f"Description: {request.strategy_description}",
    ]
    
    if request.available_runway_months:
        context_parts.append(f"Available Runway: {request.available_runway_months} months")
    if request.team_size:
        context_parts.append(f"Team Size: {request.team_size} people")
    if request.budget_constraint:
        context_parts.append(f"Budget Constraint: {request.budget_constraint}")
    if request.priority:
        context_parts.append(f"Priority: {request.priority}")
    if user_context:
        context_parts.append(f"Additional Context: {user_context}")
    
    user_prompt = "\n".join(context_parts)
    user_prompt += "\n\nGenerate a detailed execution roadmap for this strategy."
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": ROADMAP_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model=settings.LLM_MODEL,
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=4000,
        )
        
        response_text = chat_completion.choices[0].message.content
        roadmap_data = json.loads(response_text)
        
        # Parse and validate the response
        phases = []
        for phase_data in roadmap_data.get("phases", []):
            tasks = [
                TaskItem(
                    id=t.get("id", f"{phase_data.get('phase_number', 0)}.{i}"),
                    title=t.get("title", ""),
                    description=t.get("description", ""),
                    estimated_hours=t.get("estimated_hours"),
                    assignee_role=t.get("assignee_role"),
                    is_completed=False
                )
                for i, t in enumerate(phase_data.get("tasks", []), 1)
            ]
            
            kpis = [
                PhaseKPI(
                    metric=k.get("metric", ""),
                    target=k.get("target", ""),
                    measurement_method=k.get("measurement_method", "")
                )
                for k in phase_data.get("kpis", [])
            ]
            
            phases.append(RoadmapPhase(
                phase_number=phase_data.get("phase_number", len(phases) + 1),
                title=phase_data.get("title", f"Phase {len(phases) + 1}"),
                description=phase_data.get("description", ""),
                duration_weeks=phase_data.get("duration_weeks", 2),
                tasks=tasks,
                kpis=kpis,
                resources_needed=phase_data.get("resources_needed", []),
                dependencies=phase_data.get("dependencies", []),
                risks=phase_data.get("risks", [])
            ))
        
        roadmap = ExecutionRoadmap(
            id=f"roadmap_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
            title=roadmap_data.get("title", request.strategy_title),
            strategy_description=request.strategy_description,
            total_duration_weeks=roadmap_data.get("total_duration_weeks", sum(p.duration_weeks for p in phases)),
            phases=phases,
            success_criteria=roadmap_data.get("success_criteria", []),
            budget_estimate=roadmap_data.get("budget_estimate"),
            created_at=datetime.utcnow().isoformat()
        )
        
        return roadmap
        
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse AI response: {str(e)}")
    except Exception as e:
        raise ValueError(f"Roadmap generation failed: {str(e)}")


def export_roadmap_to_markdown(roadmap: ExecutionRoadmap) -> str:
    """
    Export a roadmap to Markdown format for documentation/sharing.
    """
    lines = [
        f"# {roadmap.title}",
        "",
        f"**Strategy:** {roadmap.strategy_description}",
        f"**Total Duration:** {roadmap.total_duration_weeks} weeks",
        f"**Generated:** {roadmap.created_at}",
        "",
    ]
    
    if roadmap.budget_estimate:
        lines.append(f"**Budget Estimate:** {roadmap.budget_estimate}")
        lines.append("")
    
    lines.append("---")
    lines.append("")
    
    for phase in roadmap.phases:
        lines.append(f"## Phase {phase.phase_number}: {phase.title}")
        lines.append("")
        lines.append(f"**Duration:** {phase.duration_weeks} weeks")
        lines.append("")
        lines.append(phase.description)
        lines.append("")
        
        # Tasks
        lines.append("### Tasks")
        lines.append("")
        for task in phase.tasks:
            checkbox = "- [ ]" if not task.is_completed else "- [x]"
            hours = f" ({task.estimated_hours}h)" if task.estimated_hours else ""
            role = f" - *{task.assignee_role}*" if task.assignee_role else ""
            lines.append(f"{checkbox} **{task.id}** {task.title}{hours}{role}")
            if task.description:
                lines.append(f"  - {task.description}")
        lines.append("")
        
        # KPIs
        if phase.kpis:
            lines.append("### KPIs")
            lines.append("")
            lines.append("| Metric | Target | Measurement |")
            lines.append("|--------|--------|-------------|")
            for kpi in phase.kpis:
                lines.append(f"| {kpi.metric} | {kpi.target} | {kpi.measurement_method} |")
            lines.append("")
        
        # Resources
        if phase.resources_needed:
            lines.append("### Resources Needed")
            lines.append("")
            for resource in phase.resources_needed:
                lines.append(f"- {resource}")
            lines.append("")
        
        # Risks
        if phase.risks:
            lines.append("### Risks")
            lines.append("")
            for risk in phase.risks:
                lines.append(f"- ⚠️ {risk}")
            lines.append("")
        
        lines.append("---")
        lines.append("")
    
    # Success Criteria
    if roadmap.success_criteria:
        lines.append("## Success Criteria")
        lines.append("")
        for criterion in roadmap.success_criteria:
            lines.append(f"- ✅ {criterion}")
        lines.append("")
    
    return "\n".join(lines)

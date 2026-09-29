from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, PlanningHistory
from backend.schemas import PartyPlannerInput, PartyPlannerResponse
from backend.dependencies import get_current_user
from backend.services.ai_service import AIService
from backend.utils.validators import validate_budget_bounds

router = APIRouter(prefix="/api", tags=["Party & Event Planner"])

@router.post("/generate-party", response_model=PartyPlannerResponse)
def generate_party_plan(
    plan_in: PartyPlannerInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an intelligent Party / Event Plan and save to history."""
    validate_budget_bounds(plan_in.total_budget, min_budget=100.0, max_budget=50_000_000.0)

    # Generate plan via AIService
    plan_response = AIService.generate_party_plan(plan_in)

    # Automatically save to planning history
    history_record = PlanningHistory(
        user_id=current_user.id,
        planner_type="party",
        input_data=plan_in.model_dump(),
        result_data=plan_response.model_dump()
    )
    db.add(history_record)
    db.commit()

    return plan_response

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, PlanningHistory
from backend.schemas import HomePlannerInput, HomePlannerResponse
from backend.dependencies import get_current_user
from backend.services.ai_service import AIService
from backend.utils.validators import validate_budget_bounds

router = APIRouter(prefix="/api", tags=["Home Interior Planner"])

@router.post("/generate-home", response_model=HomePlannerResponse)
def generate_home_plan(
    plan_in: HomePlannerInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an intelligent Home Interior Plan and save to history."""
    validate_budget_bounds(plan_in.total_budget, min_budget=500.0, max_budget=100_000_000.0)

    # Generate plan via AIService
    plan_response = AIService.generate_home_plan(plan_in)

    # Automatically save to planning history
    history_record = PlanningHistory(
        user_id=current_user.id,
        planner_type="home",
        input_data=plan_in.model_dump(),
        result_data=plan_response.model_dump()
    )
    db.add(history_record)
    db.commit()

    return plan_response

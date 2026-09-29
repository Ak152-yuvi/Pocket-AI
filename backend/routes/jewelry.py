from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, PlanningHistory
from backend.schemas import JewelryPlannerInput, JewelryPlannerResponse, OutfitAnalysisResponse
from backend.dependencies import get_current_user
from backend.services.ai_service import AIService
from backend.utils.validators import validate_budget_bounds, validate_image_file, MAX_IMAGE_SIZE_BYTES

router = APIRouter(prefix="/api", tags=["Jewelry Planner & Outfit Analysis"])

@router.post("/generate-jewelry", response_model=JewelryPlannerResponse)
def generate_jewelry_plan(
    plan_in: JewelryPlannerInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate an intelligent Jewelry Plan and save to history."""
    validate_budget_bounds(plan_in.total_budget, min_budget=100.0, max_budget=100_000_000.0)

    # Generate plan via AIService
    plan_response = AIService.generate_jewelry_plan(plan_in)

    # Automatically save to planning history
    history_record = PlanningHistory(
        user_id=current_user.id,
        planner_type="jewelry",
        input_data=plan_in.model_dump(),
        result_data=plan_response.model_dump()
    )
    db.add(history_record)
    db.commit()

    return plan_response


@router.post("/analyze-outfit", response_model=OutfitAnalysisResponse)
async def analyze_outfit_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Analyze an uploaded outfit image to extract colors, styling, and jewelry recommendations."""
    validate_image_file(file)

    # Read image contents safely
    contents = await file.read()
    if len(contents) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of 10MB (file size: {round(len(contents)/(1024*1024), 2)}MB)."
        )

    # Process via AIService
    mime_type = file.content_type or "image/jpeg"
    analysis_result = AIService.analyze_outfit(contents, file.filename or "outfit.jpg", mime_type)
    return analysis_result

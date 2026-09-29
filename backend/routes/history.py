from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, PlanningHistory
from backend.schemas import HistorySummaryItem, HistoryDetailResponse
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/history", tags=["Planning History"])

@router.get("", response_model=List[HistorySummaryItem])
def get_user_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve planning history for the authenticated user only."""
    records = (
        db.query(PlanningHistory)
        .filter(PlanningHistory.user_id == current_user.id)
        .order_by(PlanningHistory.created_at.desc())
        .all()
    )

    summaries = []
    for r in records:
        res = r.result_data or {}
        inp = r.input_data or {}
        budget = res.get("total_budget") or inp.get("total_budget") or 0.0
        summary = res.get("summary") or f"{r.planner_type.capitalize()} plan"
        summaries.append({
            "id": r.id,
            "planner_type": r.planner_type,
            "created_at": r.created_at,
            "total_budget": float(budget),
            "summary": summary
        })

    return summaries


@router.get("/{history_id}", response_model=HistoryDetailResponse)
def get_history_detail(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve a specific plan by ID, verifying user authorization."""
    record = (
        db.query(PlanningHistory)
        .filter(PlanningHistory.id == history_id, PlanningHistory.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planning history item not found or you do not have permission to view it."
        )

    return record


@router.delete("/{history_id}")
def delete_history_item(
    history_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific plan by ID, verifying user authorization."""
    record = (
        db.query(PlanningHistory)
        .filter(PlanningHistory.id == history_id, PlanningHistory.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Planning history item not found or you do not have permission to delete it."
        )

    db.delete(record)
    db.commit()

    return {"message": "Plan successfully removed from history.", "id": history_id}

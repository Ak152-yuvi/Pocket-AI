from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import User, UserPreference
from backend.schemas import UserProfileResponse, UserProfileUpdate
from backend.dependencies import get_current_user

router = APIRouter(prefix="/api/user", tags=["User Profile"])

@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve full profile and preferences for the logged-in user."""
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    
    currency = pref.preferred_currency if pref else "₹"
    style = pref.preferred_style if pref else "Modern"
    lang = pref.preferred_language if pref else "English"

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "preferred_currency": currency,
        "preferred_style": style,
        "preferred_language": lang,
        "created_at": current_user.created_at
    }


@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    profile_in: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile name or personal preferences (users cannot alter ID/email)."""
    if profile_in.name is not None and profile_in.name.strip():
        current_user.name = profile_in.name.strip()

    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    if profile_in.preferred_currency is not None:
        pref.preferred_currency = profile_in.preferred_currency.strip()
    if profile_in.preferred_style is not None:
        pref.preferred_style = profile_in.preferred_style.strip()
    if profile_in.preferred_language is not None:
        pref.preferred_language = profile_in.preferred_language.strip()

    db.commit()
    db.refresh(current_user)
    db.refresh(pref)

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "preferred_currency": pref.preferred_currency,
        "preferred_style": pref.preferred_style,
        "preferred_language": pref.preferred_language,
        "created_at": current_user.created_at
    }

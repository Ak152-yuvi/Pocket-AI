from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict

# ----------------------------------------------------
# AUTH SCHEMAS
# ----------------------------------------------------

class UserRegister(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    confirm_password: str

    @field_validator("confirm_password")
    @classmethod
    def passwords_match(cls, v, info):
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None


# ----------------------------------------------------
# USER PROFILE SCHEMAS
# ----------------------------------------------------

class UserProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    preferred_currency: str = "₹"
    preferred_style: str = "Modern"
    preferred_language: str = "English"
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    preferred_currency: Optional[str] = Field(None, max_length=10)
    preferred_style: Optional[str] = Field(None, max_length=50)
    preferred_language: Optional[str] = Field(None, max_length=50)


# ----------------------------------------------------
# PLANNER COMMON SCHEMAS
# ----------------------------------------------------

class CategoryAllocation(BaseModel):
    name: str
    allocated_amount: float
    percentage: float
    description: Optional[str] = None


class RoomAllocation(BaseModel):
    room_name: str
    allocated_amount: float
    breakdown: Optional[Dict[str, float]] = None
    description: Optional[str] = None


class RecommendationItem(BaseModel):
    item_name: str
    estimated_price_min: float
    estimated_price_max: float
    priority: str = "Medium"  # High, Medium, Low
    reason: str
    alternative: Optional[str] = None
    premium_option: Optional[str] = None


# ----------------------------------------------------
# HOME INTERIOR PLANNER SCHEMAS
# ----------------------------------------------------

class HomePlannerInput(BaseModel):
    total_budget: float = Field(..., gt=0, description="Total budget in chosen currency")
    number_of_rooms: int = Field(..., ge=1, le=20)
    room_types: List[str] = Field(..., min_length=1)
    interior_style: str = Field(default="Modern")
    preferred_colors: List[str] = Field(default_factory=list)
    furniture_requirements: Optional[str] = None
    lighting_requirements: Optional[str] = None
    storage_requirements: Optional[str] = None
    decoration_requirements: Optional[str] = None
    additional_requirements: Optional[str] = None


class HomePlannerResponse(BaseModel):
    planner_type: str = "home"
    summary: str
    total_budget: float
    allocated_budget: float
    remaining_budget: float
    categories: List[CategoryAllocation]
    rooms: List[RoomAllocation]
    recommendations: List[RecommendationItem]
    saving_tips: List[str]
    premium_upgrades: List[str]
    explanation: str
    is_fallback: bool = False
    ai_model: Optional[str] = None


# ----------------------------------------------------
# PARTY PLANNER SCHEMAS
# ----------------------------------------------------

class PartyPlannerInput(BaseModel):
    total_budget: float = Field(..., gt=0)
    number_of_guests: int = Field(..., ge=1)
    event_type: str = Field(default="Birthday")
    venue_type: str = Field(default="Home")
    food_preference: str = Field(default="Mixed")
    decoration_preference: Optional[str] = "Standard"
    entertainment_preference: Optional[str] = "Music & Sound"
    event_duration: Optional[str] = "4 Hours"
    additional_requirements: Optional[str] = None


class PartyPlannerResponse(BaseModel):
    planner_type: str = "party"
    summary: str
    total_budget: float
    allocated_budget: float
    remaining_budget: float
    per_person_cost: float
    categories: List[CategoryAllocation]
    recommendations: List[RecommendationItem]
    saving_tips: List[str]
    premium_upgrades: List[str]
    complete_event_plan: Optional[str] = None
    explanation: str
    is_fallback: bool = False
    ai_model: Optional[str] = None


# ----------------------------------------------------
# JEWELRY PLANNER SCHEMAS
# ----------------------------------------------------

class JewelryPlannerInput(BaseModel):
    total_budget: float = Field(..., gt=0)
    occasion: str = Field(default="Wedding")
    jewelry_style: str = Field(default="Traditional")
    preferred_metal: str = Field(default="Gold")
    preferred_color: Optional[str] = "Gold / Red"
    jewelry_types: List[str] = Field(default_factory=lambda: ["Necklace", "Earrings", "Bangles / Bracelet", "Ring"])
    outfit_description: Optional[str] = None
    additional_requirements: Optional[str] = None


class JewelryPlannerResponse(BaseModel):
    planner_type: str = "jewelry"
    summary: str
    total_budget: float
    allocated_budget: float
    remaining_budget: float
    categories: List[CategoryAllocation]
    recommendations: List[RecommendationItem]
    necklace_recommendation: Optional[str] = None
    earrings_recommendation: Optional[str] = None
    bracelet_recommendation: Optional[str] = None
    ring_recommendation: Optional[str] = None
    matching_explanation: str
    style_explanation: str
    color_matching: str
    occasion_matching: str
    saving_tips: List[str]
    premium_upgrades: List[str]
    explanation: str
    is_fallback: bool = False
    ai_model: Optional[str] = None


# ----------------------------------------------------
# OUTFIT ANALYSIS SCHEMAS
# ----------------------------------------------------

class OutfitAnalysisResponse(BaseModel):
    primary_color: str
    secondary_colors: List[str] = Field(default_factory=list)
    pattern: str = "Solid / Minimal"
    style: str = "Contemporary"
    appearance: str = "Modern"
    neckline: Optional[str] = "Round / V-Neck"
    sleeve_style: Optional[str] = "Standard"
    overall_style: Optional[str] = None
    suitable_jewelry_colors: List[str] = Field(default_factory=list)
    suitable_jewelry_types: List[str] = Field(default_factory=list)
    suggested_necklace: str
    suggested_earrings: str
    suggested_bracelet: str
    suggested_ring: str
    explanation: str
    is_fallback: bool = False


# ----------------------------------------------------
# HISTORY SCHEMAS
# ----------------------------------------------------

class HistorySummaryItem(BaseModel):
    id: int
    planner_type: str
    created_at: datetime
    total_budget: float
    summary: str

    model_config = ConfigDict(from_attributes=True)


class HistoryDetailResponse(BaseModel):
    id: int
    user_id: int
    planner_type: str
    input_data: Dict[str, Any]
    result_data: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
    gemini_configured: bool
    version: str = "1.0.0"


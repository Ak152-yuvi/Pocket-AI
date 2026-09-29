export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  preferred_currency: string;
  preferred_style: string;
  preferred_language: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CategoryAllocation {
  name: string;
  allocated_amount: number;
  percentage: number;
  description?: string;
}

export interface RoomAllocation {
  room_name: string;
  allocated_amount: number;
  breakdown?: Record<string, number>;
  description?: string;
}

export interface RecommendationItem {
  item_name: string;
  estimated_price_min: number;
  estimated_price_max: number;
  priority: 'High' | 'Medium' | 'Low' | string;
  reason: string;
  alternative?: string;
  premium_option?: string;
}

export interface HomePlannerInput {
  total_budget: number;
  number_of_rooms: number;
  room_types: string[];
  interior_style: string;
  preferred_colors: string[];
  furniture_requirements?: string;
  lighting_requirements?: string;
  storage_requirements?: string;
  decoration_requirements?: string;
  additional_requirements?: string;
}

export interface HomePlannerResponse {
  planner_type: 'home';
  summary: string;
  total_budget: number;
  allocated_budget: number;
  remaining_budget: number;
  categories: CategoryAllocation[];
  rooms: RoomAllocation[];
  recommendations: RecommendationItem[];
  saving_tips: string[];
  premium_upgrades: string[];
  explanation: string;
  is_fallback: boolean;
  ai_model?: string;
}

export interface PartyPlannerInput {
  total_budget: number;
  number_of_guests: number;
  event_type: string;
  venue_type: string;
  food_preference: string;
  decoration_preference?: string;
  entertainment_preference?: string;
  event_duration?: string;
  additional_requirements?: string;
}

export interface PartyPlannerResponse {
  planner_type: 'party';
  summary: string;
  total_budget: number;
  allocated_budget: number;
  remaining_budget: number;
  per_person_cost: number;
  categories: CategoryAllocation[];
  recommendations: RecommendationItem[];
  saving_tips: string[];
  premium_upgrades: string[];
  complete_event_plan?: string;
  explanation: string;
  is_fallback: boolean;
  ai_model?: string;
}

export interface JewelryPlannerInput {
  total_budget: number;
  occasion: string;
  jewelry_style: string;
  preferred_metal: string;
  preferred_color?: string;
  jewelry_types: string[];
  outfit_description?: string;
  additional_requirements?: string;
}

export interface JewelryPlannerResponse {
  planner_type: 'jewelry';
  summary: string;
  total_budget: number;
  allocated_budget: number;
  remaining_budget: number;
  categories: CategoryAllocation[];
  recommendations: RecommendationItem[];
  necklace_recommendation?: string;
  earrings_recommendation?: string;
  bracelet_recommendation?: string;
  ring_recommendation?: string;
  matching_explanation: string;
  style_explanation: string;
  color_matching: string;
  occasion_matching: string;
  saving_tips: string[];
  premium_upgrades: string[];
  explanation: string;
  is_fallback: boolean;
  ai_model?: string;
}

export interface OutfitAnalysisResponse {
  primary_color: string;
  secondary_colors: string[];
  pattern: string;
  style: string;
  appearance: string;
  neckline?: string;
  sleeve_style?: string;
  overall_style?: string;
  suitable_jewelry_colors: string[];
  suitable_jewelry_types: string[];
  suggested_necklace: string;
  suggested_earrings: string;
  suggested_bracelet: string;
  suggested_ring: string;
  explanation: string;
  is_fallback: boolean;
}

export interface HistorySummaryItem {
  id: number;
  planner_type: 'home' | 'party' | 'jewelry' | string;
  created_at: string;
  total_budget: number;
  summary: string;
}

export interface HistoryDetailResponse {
  id: number;
  user_id: number;
  planner_type: 'home' | 'party' | 'jewelry';
  input_data: any;
  result_data: HomePlannerResponse | PartyPlannerResponse | JewelryPlannerResponse;
  created_at: string;
}

export interface HealthStatus {
  status: string;
  gemini_configured: boolean;
  version: string;
}

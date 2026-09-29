import os
import json
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

from backend.schemas import (
    HomePlannerInput, HomePlannerResponse,
    PartyPlannerInput, PartyPlannerResponse,
    JewelryPlannerInput, JewelryPlannerResponse,
    OutfitAnalysisResponse
)
from backend.services.budget_service import BudgetEngine
from backend.services.recommendation_service import RecommendationEngine
from backend.services.outfit_service import OutfitAnalyzer

load_dotenv()
logger = logging.getLogger("pocketsmart.ai_service")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

def is_gemini_available() -> bool:
    """Check if Gemini API key is configured and non-empty."""
    return bool(GEMINI_API_KEY and len(GEMINI_API_KEY) > 8)

class AIService:
    @staticmethod
    def _call_gemini(prompt: str, system_instruction: str = "") -> Optional[str]:
        """
        Call Gemini API using google-genai or google-generativeai.
        Returns raw text response or None on failure.
        """
        if not is_gemini_available():
            return None

        # Try google.genai SDK
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)
            config = types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
            if system_instruction:
                config.system_instruction = system_instruction

            # Try gemini-2.5-flash then gemini-1.5-flash
            for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt,
                        config=config
                    )
                    if response and response.text:
                        return response.text
                except Exception as model_err:
                    logger.warning(f"Error calling {model_name}: {model_err}")
                    continue
        except Exception as e:
            logger.warning(f"google.genai SDK attempt failed: {e}")

        # Fallback to google.generativeai if available
        try:
            import google.generativeai as legacy_genai
            legacy_genai.configure(api_key=GEMINI_API_KEY)
            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json", "temperature": 0.2},
                system_instruction=system_instruction if system_instruction else None
            )
            resp = model.generate_content(prompt)
            if resp and resp.text:
                return resp.text
        except Exception as legacy_err:
            logger.warning(f"google.generativeai SDK attempt failed: {legacy_err}")

        return None

    @staticmethod
    def _call_gemini_vision(image_bytes: bytes, mime_type: str, prompt: str) -> Optional[str]:
        """Call Gemini API with an image payload."""
        if not is_gemini_available():
            return None

        # Try google.genai
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=GEMINI_API_KEY)
            config = types.GenerateContentConfig(
                temperature=0.2,
                response_mime_type="application/json"
            )
            image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            
            for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=[image_part, prompt],
                        config=config
                    )
                    if response and response.text:
                        return response.text
                except Exception as model_err:
                    logger.warning(f"Error calling {model_name} vision: {model_err}")
                    continue
        except Exception as e:
            logger.warning(f"google.genai vision attempt failed: {e}")

        # Fallback to legacy SDK for vision
        try:
            import google.generativeai as legacy_genai
            from PIL import Image
            import io

            legacy_genai.configure(api_key=GEMINI_API_KEY)
            pil_img = Image.open(io.BytesIO(image_bytes))
            model = legacy_genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json", "temperature": 0.2}
            )
            resp = model.generate_content([prompt, pil_img])
            if resp and resp.text:
                return resp.text
        except Exception as legacy_err:
            logger.warning(f"google.generativeai vision attempt failed: {legacy_err}")

        return None

    @classmethod
    def generate_home_plan(cls, data: HomePlannerInput) -> HomePlannerResponse:
        """Generate Home Interior Plan using Gemini or Smart Fallback Engine."""
        # 1. Base mathematical budget allocation
        base_budget = BudgetEngine.calculate_home_budget(
            total_budget=data.total_budget,
            number_of_rooms=data.number_of_rooms,
            room_types=data.room_types,
            interior_style=data.interior_style,
            furniture_req=data.furniture_requirements or "",
            lighting_req=data.lighting_requirements or "",
            storage_req=data.storage_requirements or "",
            decor_req=data.decoration_requirements or ""
        )

        # 2. Try Gemini AI if available
        if is_gemini_available():
            system_instruction = (
                "You are PocketSmart AI — an elite interior budget planning assistant. "
                "Output valid JSON strictly following the schema. Never exceed the user's budget. "
                "Ensure sum of categories <= total_budget and sum of room allocations <= total_budget."
            )
            prompt = f"""
Create a comprehensive Home Interior Plan in JSON format.
Total Budget: {data.total_budget}
Number of Rooms: {data.number_of_rooms}
Room Types: {', '.join(data.room_types)}
Interior Style: {data.interior_style}
Preferred Colors: {', '.join(data.preferred_colors) if data.preferred_colors else 'Neutral'}
Furniture Requirements: {data.furniture_requirements or 'Standard'}
Lighting Requirements: {data.lighting_requirements or 'Standard'}
Storage Requirements: {data.storage_requirements or 'Standard'}
Decoration Requirements: {data.decoration_requirements or 'Standard'}
Additional Requirements: {data.additional_requirements or 'None'}

Calculated baseline allocations to guide you:
Allocated: {base_budget['allocated_budget']}, Remaining: {base_budget['remaining_budget']}

Return JSON strictly matching this structure:
{{
  "planner_type": "home",
  "summary": "Short 1-2 sentence overview",
  "total_budget": {data.total_budget},
  "allocated_budget": {base_budget['allocated_budget']},
  "remaining_budget": {base_budget['remaining_budget']},
  "categories": [
    {{"name": "Furniture", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Lighting & Electricals", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Curtains, Rugs & Decor", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Modular Storage & Wardrobes", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Essentials & Hardware", "allocated_amount": 0, "percentage": 0, "description": ""}}
  ],
  "rooms": [
    {{"room_name": "Living Room", "allocated_amount": 0, "description": "", "breakdown": {{"Furniture": 0, "Lighting": 0, "Storage": 0, "Decor": 0}}}}
  ],
  "recommendations": [
    {{
      "item_name": "...",
      "estimated_price_min": 0,
      "estimated_price_max": 0,
      "priority": "High",
      "reason": "...",
      "alternative": "...",
      "premium_option": "..."
    }}
  ],
  "saving_tips": ["...", "..."],
  "premium_upgrades": ["...", "..."],
  "explanation": "Detailed explanation of the budget allocation"
}}
"""
            raw_json = cls._call_gemini(prompt, system_instruction)
            if raw_json:
                try:
                    parsed = json.loads(raw_json)
                    # Enforce budget sanity checks
                    if parsed.get("allocated_budget", 0) <= data.total_budget:
                        parsed["is_fallback"] = False
                        parsed["ai_model"] = "Google Gemini AI"
                        parsed["total_budget"] = data.total_budget
                        parsed["remaining_budget"] = max(0.0, round(data.total_budget - parsed["allocated_budget"], 2))
                        return HomePlannerResponse(**parsed)
                except Exception as parse_err:
                    logger.warning(f"Failed to parse Gemini response for home planner: {parse_err}")

        # 3. Deterministic Smart Fallback Engine
        fallback_plan = RecommendationEngine.get_home_recommendations(
            budget_data=base_budget,
            interior_style=data.interior_style,
            room_types=data.room_types,
            preferred_colors=data.preferred_colors
        )
        return HomePlannerResponse(**fallback_plan)

    @classmethod
    def generate_party_plan(cls, data: PartyPlannerInput) -> PartyPlannerResponse:
        """Generate Party / Event Plan using Gemini or Smart Fallback Engine."""
        base_budget = BudgetEngine.calculate_party_budget(
            total_budget=data.total_budget,
            number_of_guests=data.number_of_guests,
            event_type=data.event_type,
            venue_type=data.venue_type,
            food_preference=data.food_preference
        )

        if is_gemini_available():
            system_instruction = (
                "You are PocketSmart AI — an expert event and party budget planner. "
                "Output valid JSON strictly following the schema. Never exceed the user's budget. "
                "Ensure sum of categories <= total_budget and calculate realistic per-person metrics."
            )
            prompt = f"""
Create a complete Party and Event Plan in JSON format.
Total Budget: {data.total_budget}
Number of Guests: {data.number_of_guests}
Event Type: {data.event_type}
Venue Type: {data.venue_type}
Food Preference: {data.food_preference}
Decoration Preference: {data.decoration_preference or 'Standard'}
Entertainment Preference: {data.entertainment_preference or 'Standard'}
Event Duration: {data.event_duration or '4 Hours'}
Additional Requirements: {data.additional_requirements or 'None'}

Baseline allocations:
Allocated: {base_budget['allocated_budget']}, Remaining: {base_budget['remaining_budget']}, Per Person: {base_budget['per_person_cost']}

Return JSON matching this structure:
{{
  "planner_type": "party",
  "summary": "Short 1-2 sentence overview",
  "total_budget": {data.total_budget},
  "allocated_budget": {base_budget['allocated_budget']},
  "remaining_budget": {base_budget['remaining_budget']},
  "per_person_cost": {base_budget['per_person_cost']},
  "categories": [
    {{"name": "Food & Catering", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Venue & Facility", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Decor & Ambience", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Entertainment & Sound", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Photography & Media", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Contingency Reserve", "allocated_amount": 0, "percentage": 0, "description": ""}}
  ],
  "recommendations": [
    {{
      "item_name": "...",
      "estimated_price_min": 0,
      "estimated_price_max": 0,
      "priority": "High",
      "reason": "...",
      "alternative": "...",
      "premium_option": "..."
    }}
  ],
  "saving_tips": ["...", "..."],
  "premium_upgrades": ["...", "..."],
  "complete_event_plan": "Timeline and breakdown of the event",
  "explanation": "Detailed explanation of event budget breakdown"
}}
"""
            raw_json = cls._call_gemini(prompt, system_instruction)
            if raw_json:
                try:
                    parsed = json.loads(raw_json)
                    if parsed.get("allocated_budget", 0) <= data.total_budget:
                        parsed["is_fallback"] = False
                        parsed["ai_model"] = "Google Gemini AI"
                        parsed["total_budget"] = data.total_budget
                        parsed["remaining_budget"] = max(0.0, round(data.total_budget - parsed["allocated_budget"], 2))
                        parsed["per_person_cost"] = round(parsed["allocated_budget"] / max(1, data.number_of_guests), 2)
                        return PartyPlannerResponse(**parsed)
                except Exception as parse_err:
                    logger.warning(f"Failed to parse Gemini response for party planner: {parse_err}")

        # Deterministic Smart Fallback Engine
        fallback_plan = RecommendationEngine.get_party_recommendations(
            budget_data=base_budget,
            event_type=data.event_type,
            venue_type=data.venue_type,
            food_preference=data.food_preference,
            number_of_guests=data.number_of_guests
        )
        return PartyPlannerResponse(**fallback_plan)

    @classmethod
    def generate_jewelry_plan(cls, data: JewelryPlannerInput) -> JewelryPlannerResponse:
        """Generate Jewelry Plan using Gemini or Smart Fallback Engine."""
        base_budget = BudgetEngine.calculate_jewelry_budget(
            total_budget=data.total_budget,
            occasion=data.occasion,
            jewelry_style=data.jewelry_style,
            preferred_metal=data.preferred_metal,
            jewelry_types=data.jewelry_types
        )

        if is_gemini_available():
            system_instruction = (
                "You are PocketSmart AI — a luxury jewelry consultant and personal stylist. "
                "Output valid JSON strictly following the schema. Never exceed the user's budget. "
                "Provide thoughtful color and metal matching with realistic category allocations."
            )
            prompt = f"""
Create a Jewelry Plan in JSON format.
Total Budget: {data.total_budget}
Occasion: {data.occasion}
Jewelry Style: {data.jewelry_style}
Preferred Metal: {data.preferred_metal}
Preferred Color: {data.preferred_color or 'Matching'}
Selected Jewelry Types: {', '.join(data.jewelry_types)}
Outfit Description: {data.outfit_description or 'None provided'}
Additional Requirements: {data.additional_requirements or 'None'}

Baseline allocations:
Allocated: {base_budget['allocated_budget']}, Remaining: {base_budget['remaining_budget']}

Return JSON matching this structure:
{{
  "planner_type": "jewelry",
  "summary": "Short 1-2 sentence overview",
  "total_budget": {data.total_budget},
  "allocated_budget": {base_budget['allocated_budget']},
  "remaining_budget": {base_budget['remaining_budget']},
  "categories": [
    {{"name": "Necklace", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Earrings", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Bangles / Bracelet", "allocated_amount": 0, "percentage": 0, "description": ""}},
    {{"name": "Ring", "allocated_amount": 0, "percentage": 0, "description": ""}}
  ],
  "recommendations": [
    {{
      "item_name": "...",
      "estimated_price_min": 0,
      "estimated_price_max": 0,
      "priority": "High",
      "reason": "...",
      "alternative": "...",
      "premium_option": "..."
    }}
  ],
  "necklace_recommendation": "...",
  "earrings_recommendation": "...",
  "bracelet_recommendation": "...",
  "ring_recommendation": "...",
  "matching_explanation": "...",
  "style_explanation": "...",
  "color_matching": "...",
  "occasion_matching": "...",
  "saving_tips": ["...", "..."],
  "premium_upgrades": ["...", "..."],
  "explanation": "Detailed explanation of jewelry allocations and pairing"
}}
"""
            raw_json = cls._call_gemini(prompt, system_instruction)
            if raw_json:
                try:
                    parsed = json.loads(raw_json)
                    if parsed.get("allocated_budget", 0) <= data.total_budget:
                        parsed["is_fallback"] = False
                        parsed["ai_model"] = "Google Gemini AI"
                        parsed["total_budget"] = data.total_budget
                        parsed["remaining_budget"] = max(0.0, round(data.total_budget - parsed["allocated_budget"], 2))
                        return JewelryPlannerResponse(**parsed)
                except Exception as parse_err:
                    logger.warning(f"Failed to parse Gemini response for jewelry planner: {parse_err}")

        # Deterministic Smart Fallback Engine
        fallback_plan = RecommendationEngine.get_jewelry_recommendations(
            budget_data=base_budget,
            occasion=data.occasion,
            jewelry_style=data.jewelry_style,
            preferred_metal=data.preferred_metal,
            preferred_color=data.preferred_color or "Complementary",
            jewelry_types=data.jewelry_types
        )
        return JewelryPlannerResponse(**fallback_plan)

    @classmethod
    def analyze_outfit(cls, image_bytes: bytes, filename: str, mime_type: str) -> OutfitAnalysisResponse:
        """Analyze an uploaded outfit image using Gemini Vision or PIL Fallback."""
        if is_gemini_available():
            prompt = """
Analyze this outfit image in detail for jewelry styling recommendations.
Return a valid JSON object matching this schema:
{
  "primary_color": "Main dominant color of the outfit",
  "secondary_colors": ["accent color 1", "accent color 2"],
  "pattern": "Pattern type (e.g. Floral Embroidery, Solid, Brocade, Geometric)",
  "style": "Overall styling tone (e.g. Royal Traditional, Contemporary Minimalist, Bohemian)",
  "appearance": "Traditional / Modern / Indo-Western Fusion",
  "neckline": "Visible neckline shape (e.g. Sweetheart, V-Neck, High Collar, Boat Neck)",
  "sleeve_style": "Visible sleeve style (e.g. Sleeveless, Full Sleeve, Elbow-length)",
  "overall_style": "Summary of outfit silhouette and mood",
  "suitable_jewelry_colors": ["Antique Gold", "Kundan Emerald", "Rose Gold", "Polki"],
  "suitable_jewelry_types": ["Choker Necklace", "Chandbali Earrings", "Kada Bangles", "Cocktail Ring"],
  "suggested_necklace": "Specific necklace style recommendation matching this neckline",
  "suggested_earrings": "Specific earrings recommendation framing the face",
  "suggested_bracelet": "Suggested bracelet or bangle styling",
  "suggested_ring": "Suggested ring style",
  "explanation": "Clear explanation of why this jewelry matches the outfit color, fabric, and neckline"
}
"""
            raw_json = cls._call_gemini_vision(image_bytes, mime_type, prompt)
            if raw_json:
                try:
                    parsed = json.loads(raw_json)
                    parsed["is_fallback"] = False
                    return OutfitAnalysisResponse(**parsed)
                except Exception as e:
                    logger.warning(f"Failed to parse Gemini vision response: {e}")

        # Fallback to local image analysis
        fallback_data = OutfitAnalyzer.fallback_analyze_image(image_bytes, filename)
        return OutfitAnalysisResponse(**fallback_data)

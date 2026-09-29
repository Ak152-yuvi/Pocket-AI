from typing import List, Dict, Any, Tuple

class BudgetEngine:
    @staticmethod
    def calculate_home_budget(
        total_budget: float,
        number_of_rooms: int,
        room_types: List[str],
        interior_style: str,
        furniture_req: str = "",
        lighting_req: str = "",
        storage_req: str = "",
        decor_req: str = ""
    ) -> Dict[str, Any]:
        """
        Calculates category allocations and room-wise allocations
        guaranteeing sum(allocations) <= total_budget.
        """
        budget_per_room = total_budget / max(1, number_of_rooms)

        # Baseline category weights
        # Tier 1: Value / Budget (< 35,000 / room)
        # Tier 2: Balanced (35,000 - 120,000 / room)
        # Tier 3: Luxury (> 120,000 / room)
        if budget_per_room < 35000:
            weights = {
                "Furniture": 0.52,
                "Lighting & Electricals": 0.14,
                "Curtains, Rugs & Decor": 0.12,
                "Modular Storage & Wardrobes": 0.12,
                "Essentials & Hardware": 0.06
            }
        elif budget_per_room <= 120000:
            weights = {
                "Furniture": 0.44,
                "Lighting & Electricals": 0.16,
                "Curtains, Rugs & Decor": 0.16,
                "Modular Storage & Wardrobes": 0.16,
                "Essentials & Hardware": 0.05
            }
        else:
            weights = {
                "Furniture": 0.38,
                "Lighting & Electricals": 0.18,
                "Curtains, Rugs & Decor": 0.20,
                "Modular Storage & Wardrobes": 0.18,
                "Essentials & Hardware": 0.04
            }

        # Dynamic bias based on user requirements
        storage_text = (storage_req or "").lower()
        if "heavy" in storage_text or "custom" in storage_text or "wardrobe" in storage_text:
            weights["Modular Storage & Wardrobes"] += 0.05
            weights["Curtains, Rugs & Decor"] -= 0.03
            weights["Furniture"] -= 0.02

        lighting_text = (lighting_req or "").lower()
        if "smart" in lighting_text or "ambient" in lighting_text or "chandelier" in lighting_text:
            weights["Lighting & Electricals"] += 0.04
            weights["Furniture"] -= 0.04

        # Reserve a safe 2-4% unallocated buffer for unexpected on-site costs
        buffer_ratio = 0.03
        spendable_budget = total_budget * (1.0 - buffer_ratio)

        # Normalize weights to sum exactly to 1.0
        total_w = sum(weights.values())
        normalized_weights = {k: v / total_w for k, v in weights.items()}

        categories = []
        allocated_sum = 0.0
        for name, w in normalized_weights.items():
            amt = round(spendable_budget * w, 2)
            pct = round((amt / total_budget) * 100, 1)
            allocated_sum += amt
            desc = f"Optimal {interior_style.capitalize()} style allocation for {name.lower()}"
            categories.append({
                "name": name,
                "allocated_amount": amt,
                "percentage": pct,
                "description": desc
            })

        # Room weightings
        room_weight_map = {
            "living room": 1.4,
            "master bedroom": 1.25,
            "bedroom": 1.0,
            "kitchen": 1.3,
            "dining room": 0.9,
            "study room": 0.75,
            "home office": 0.85,
            "bathroom": 0.5,
            "balcony": 0.4,
            "kids room": 0.9
        }

        room_weights = []
        for r in room_types:
            clean_r = r.strip().lower()
            w = room_weight_map.get(clean_r, 1.0)
            room_weights.append((r.strip(), w))

        total_rw = sum(w for _, w in room_weights) if room_weights else 1.0
        room_allocations = []
        room_sum = 0.0

        for r_name, r_w in room_weights:
            r_ratio = r_w / total_rw
            r_amt = round(allocated_sum * r_ratio, 2)
            room_sum += r_amt
            
            # Sub-breakdown per room
            room_allocations.append({
                "room_name": r_name,
                "allocated_amount": r_amt,
                "breakdown": {
                    "Furniture": round(r_amt * normalized_weights["Furniture"], 2),
                    "Lighting": round(r_amt * normalized_weights["Lighting & Electricals"], 2),
                    "Storage": round(r_amt * normalized_weights["Modular Storage & Wardrobes"], 2),
                    "Decor": round(r_amt * (normalized_weights["Curtains, Rugs & Decor"] + normalized_weights["Essentials & Hardware"]), 2),
                },
                "description": f"Dedicated budget for complete {r_name} furnishings and aesthetic balance"
            })

        # Correct any minute rounding delta on the last room so it matches allocated_sum exactly
        delta = round(allocated_sum - room_sum, 2)
        if room_allocations and delta != 0:
            room_allocations[0]["allocated_amount"] = round(room_allocations[0]["allocated_amount"] + delta, 2)

        remaining_budget = round(total_budget - allocated_sum, 2)

        return {
            "total_budget": total_budget,
            "allocated_budget": round(allocated_sum, 2),
            "remaining_budget": max(0.0, remaining_budget),
            "categories": categories,
            "rooms": room_allocations
        }

    @staticmethod
    def calculate_party_budget(
        total_budget: float,
        number_of_guests: int,
        event_type: str,
        venue_type: str,
        food_preference: str
    ) -> Dict[str, Any]:
        """
        Calculates category allocations and guest per-person economics
        guaranteeing sum(allocations) <= total_budget.
        """
        guests = max(1, number_of_guests)
        per_person_target = total_budget / guests

        # Base category weightings
        weights = {
            "Food & Catering": 0.44,
            "Venue & Facility": 0.20,
            "Decor & Ambience": 0.14,
            "Entertainment & Sound": 0.09,
            "Photography & Media": 0.07,
            "Contingency Reserve": 0.04
        }

        # Adjust for venue type
        venue_clean = venue_type.strip().lower()
        if "home" in venue_clean or "house" in venue_clean:
            # Home party has very low or zero venue rental, reassign to Food and Entertainment
            weights["Venue & Facility"] = 0.04
            weights["Food & Catering"] += 0.10
            weights["Decor & Ambience"] += 0.04
            weights["Entertainment & Sound"] += 0.02
        elif "hotel" in venue_clean or "resort" in venue_clean or "hall" in venue_clean:
            weights["Venue & Facility"] += 0.06
            weights["Food & Catering"] -= 0.04
            weights["Entertainment & Sound"] -= 0.02

        # Adjust for event type
        event_clean = event_type.strip().lower()
        if "wedding" in event_clean or "engagement" in event_clean:
            weights["Photography & Media"] += 0.05
            weights["Decor & Ambience"] += 0.03
            weights["Entertainment & Sound"] -= 0.02
            weights["Food & Catering"] -= 0.06
        elif "birthday" in event_clean or "college" in event_clean:
            weights["Entertainment & Sound"] += 0.05
            weights["Photography & Media"] -= 0.03

        # Reserve a safe 2% unallocated buffer
        buffer_ratio = 0.02
        spendable_budget = total_budget * (1.0 - buffer_ratio)

        total_w = sum(weights.values())
        normalized_weights = {k: v / total_w for k, v in weights.items()}

        categories = []
        allocated_sum = 0.0
        for name, w in normalized_weights.items():
            amt = round(spendable_budget * w, 2)
            pct = round((amt / total_budget) * 100, 1)
            allocated_sum += amt
            categories.append({
                "name": name,
                "allocated_amount": amt,
                "percentage": pct,
                "description": f"Targeted allocation for {name.lower()} tailored for {guests} guests"
            })

        per_person_cost = round(allocated_sum / guests, 2)
        remaining_budget = round(total_budget - allocated_sum, 2)

        return {
            "total_budget": total_budget,
            "allocated_budget": round(allocated_sum, 2),
            "remaining_budget": max(0.0, remaining_budget),
            "per_person_cost": per_person_cost,
            "categories": categories
        }

    @staticmethod
    def calculate_jewelry_budget(
        total_budget: float,
        occasion: str,
        jewelry_style: str,
        preferred_metal: str,
        jewelry_types: List[str]
    ) -> Dict[str, Any]:
        """
        Calculates category allocations across selected jewelry types
        guaranteeing sum(allocations) <= total_budget.
        """
        types = [t.strip() for t in jewelry_types if t.strip()]
        if not types:
            types = ["Necklace", "Earrings", "Bangles / Bracelet", "Ring"]

        type_weights_map = {
            "necklace": 0.48,
            "choker": 0.45,
            "bridal set": 0.60,
            "earrings": 0.22,
            "jhumka": 0.20,
            "studs": 0.15,
            "bangles / bracelet": 0.18,
            "bracelet": 0.18,
            "bangles": 0.20,
            "ring": 0.12,
            "maang tikka": 0.10,
            "anklet": 0.08,
            "nose pin / ring": 0.05
        }

        raw_weights = {}
        for t in types:
            key = t.lower()
            weight = type_weights_map.get(key, 0.20)
            raw_weights[t] = weight

        total_w = sum(raw_weights.values()) if raw_weights else 1.0
        normalized_weights = {k: v / total_w for k, v in raw_weights.items()}

        # 3% buffer for certifications, hallmarking, and finishing
        buffer_ratio = 0.03
        spendable_budget = total_budget * (1.0 - buffer_ratio)

        categories = []
        allocated_sum = 0.0
        for name, w in normalized_weights.items():
            amt = round(spendable_budget * w, 2)
            pct = round((amt / total_budget) * 100, 1)
            allocated_sum += amt
            categories.append({
                "name": name,
                "allocated_amount": amt,
                "percentage": pct,
                "description": f"Curated {preferred_metal} {name.lower()} in {jewelry_style} design"
            })

        remaining_budget = round(total_budget - allocated_sum, 2)

        return {
            "total_budget": total_budget,
            "allocated_budget": round(allocated_sum, 2),
            "remaining_budget": max(0.0, remaining_budget),
            "categories": categories
        }

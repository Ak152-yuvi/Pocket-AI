from typing import List, Dict, Any
from backend.services.budget_service import BudgetEngine

class RecommendationEngine:
    @staticmethod
    def get_home_recommendations(
        budget_data: Dict[str, Any],
        interior_style: str,
        room_types: List[str],
        preferred_colors: List[str]
    ) -> Dict[str, Any]:
        """
        Generate recommendations, saving tips, upgrades, and explanation for Home Planner.
        """
        total_budget = budget_data["total_budget"]
        allocated_budget = budget_data["allocated_budget"]
        categories = budget_data["categories"]
        rooms = budget_data["rooms"]
        style = interior_style.capitalize()
        color_str = ", ".join(preferred_colors) if preferred_colors else "Neutral Earthy & Muted Tones"

        # Calculate category spending reference
        cat_map = {c["name"]: c["allocated_amount"] for c in categories}
        furn_budget = cat_map.get("Furniture", allocated_budget * 0.45)
        light_budget = cat_map.get("Lighting & Electricals", allocated_budget * 0.15)
        storage_budget = cat_map.get("Modular Storage & Wardrobes", allocated_budget * 0.15)
        decor_budget = cat_map.get("Curtains, Rugs & Decor", allocated_budget * 0.15)

        recommendations = [
            {
                "item_name": f"{style} Modular Sofa / Sectional",
                "estimated_price_min": round(furn_budget * 0.35, 2),
                "estimated_price_max": round(furn_budget * 0.45, 2),
                "priority": "High",
                "reason": f"Acts as the anchor piece in the living room, setting the {style} tone with {color_str} upholstery.",
                "alternative": "Compact 3-seater fabric sofa with washable slipcovers",
                "premium_option": "Full-grain Italian leather L-shape sectional with adjustable headrests"
            },
            {
                "item_name": f"Master Bed Frame with Hydraulic Storage",
                "estimated_price_min": round(furn_budget * 0.28, 2),
                "estimated_price_max": round(furn_budget * 0.35, 2),
                "priority": "High",
                "reason": "Maximizes vertical storage capacity while maintaining a sleek, modern silhouette.",
                "alternative": "Solid Sheesham wood platform bed frame without hydraulics",
                "premium_option": "Custom upholstered velvet wingback bed with integrated bedside USB docks"
            },
            {
                "item_name": f"Architectural Warm LED Pendant & Magnetic Track Lighting",
                "estimated_price_min": round(light_budget * 0.40, 2),
                "estimated_price_max": round(light_budget * 0.55, 2),
                "priority": "Medium",
                "reason": "Provides multi-layered ambient and task illumination tailored to modern interiors.",
                "alternative": "Flush-mount dimmable LED ceiling rings with warm-cool switchable Kelvin",
                "premium_option": "Smart Zigbee/DALI dimmable recessed continuous profile tracks"
            },
            {
                "item_name": f"Custom Floor-to-Ceiling Wardrobes with Soft-Close Hardware",
                "estimated_price_min": round(storage_budget * 0.60, 2),
                "estimated_price_max": round(storage_budget * 0.80, 2),
                "priority": "High",
                "reason": "Eliminates room clutter and optimizes vertical room height with seamless finish.",
                "alternative": "Pre-fabricated engineered wood sliding 3-door wardrobe",
                "premium_option": "Tinted fluted glass walk-in wardrobe with automatic internal LED strip illumination"
            },
            {
                "item_name": f"Blackout Drapes & Hand-tufted Geometric Area Rug",
                "estimated_price_min": round(decor_budget * 0.40, 2),
                "estimated_price_max": round(decor_budget * 0.55, 2),
                "priority": "Medium",
                "reason": f"Enhances acoustic comfort and binds the {color_str} palette together harmoniously.",
                "alternative": "Semi-sheer linen textured curtains with synthetic printed runner rug",
                "premium_option": "Motorized smart track motorized drapes paired with pure New Zealand wool rug"
            }
        ]

        saving_tips = [
            "Source high-traffic anchor furniture (sofas, mattresses) in premium grade, while opting for modular flat-pack for accent side tables and floating shelves.",
            "Use cove LED strip lighting along false ceiling perimeters to achieve luxury hotel ambience at a fraction of chandelier costs.",
            "Choose durable high-pressure laminates with anti-fingerprint coating instead of expensive natural veneers for wardrobes.",
            "Install dual-track curtain rails to reuse existing daylight while adding affordable privacy sheers."
        ]

        premium_upgrades = [
            "Smart Home Automation: Integrate IoT smart dimmers, automated curtain motors, and scene switches.",
            "Acoustic Wall Panelling: Fluted charcoal wood slat panels behind the television or master bed headboard.",
            "Quartz or Nano-white countertops for kitchen and dining console surfaces."
        ]

        explanation = (
            f"Your total budget of ₹{total_budget:,.2f} has been strategically balanced across {len(room_types)} rooms "
            f"({', '.join(room_types)}). We prioritized high-durability anchor items (44-52% in Furniture & Storage) "
            f"because these provide the longest functional lifespan. "
            f"Lighting and textiles receive a coordinated 30% share to highlight your {style} design language with {color_str} accents. "
            f"A safety buffer of ₹{budget_data['remaining_budget']:,.2f} is preserved to handle on-site installation, delivery, and minor custom hardware fittings."
        )

        summary = f"{style} interior design plan for {len(room_types)} rooms with ₹{allocated_budget:,.2f} allocated."

        return {
            "planner_type": "home",
            "summary": summary,
            "total_budget": total_budget,
            "allocated_budget": allocated_budget,
            "remaining_budget": budget_data["remaining_budget"],
            "categories": categories,
            "rooms": rooms,
            "recommendations": recommendations,
            "saving_tips": saving_tips,
            "premium_upgrades": premium_upgrades,
            "explanation": explanation,
            "is_fallback": True,
            "ai_model": "Smart Fallback Engine (Algorithmic)"
        }

    @staticmethod
    def get_party_recommendations(
        budget_data: Dict[str, Any],
        event_type: str,
        venue_type: str,
        food_preference: str,
        number_of_guests: int
    ) -> Dict[str, Any]:
        """
        Generate recommendations, saving tips, upgrades, and explanation for Party Planner.
        """
        total_budget = budget_data["total_budget"]
        allocated_budget = budget_data["allocated_budget"]
        categories = budget_data["categories"]
        per_person_cost = budget_data["per_person_cost"]
        cat_map = {c["name"]: c["allocated_amount"] for c in categories}

        food_budget = cat_map.get("Food & Catering", allocated_budget * 0.44)
        venue_budget = cat_map.get("Venue & Facility", allocated_budget * 0.20)
        decor_budget = cat_map.get("Decor & Ambience", allocated_budget * 0.14)
        sound_budget = cat_map.get("Entertainment & Sound", allocated_budget * 0.09)
        photo_budget = cat_map.get("Photography & Media", allocated_budget * 0.07)

        recommendations = [
            {
                "item_name": f"Full-Course {food_preference} Catering & Live Counters",
                "estimated_price_min": round(food_budget * 0.75, 2),
                "estimated_price_max": round(food_budget * 0.90, 2),
                "priority": "High",
                "reason": f"Catering directly drives guest satisfaction. Calculated at approx. ₹{round(food_budget/max(1, number_of_guests), 2)} per head for {food_preference} menu.",
                "alternative": "Appetizers + Heavy Finger Foods buffet spread with mocktail punch dispensers",
                "premium_option": "Interactive live chef culinary stations with imported desserts and artisanal beverages"
            },
            {
                "item_name": f"{venue_type} Booking & Operational Setup",
                "estimated_price_min": round(venue_budget * 0.80, 2),
                "estimated_price_max": round(venue_budget * 0.95, 2),
                "priority": "High",
                "reason": f"Guarantees adequate seating, air conditioning/ventilation, and sanitization for {number_of_guests} guests.",
                "alternative": "Community club hall or private farmhouse rental with flexible timings",
                "premium_option": "Boutique hotel banquet hall with dedicated banquet coordinator and valet services"
            },
            {
                "item_name": f"Themed Backdrop, Fairy Lights & Floral Installations",
                "estimated_price_min": round(decor_budget * 0.65, 2),
                "estimated_price_max": round(decor_budget * 0.85, 2),
                "priority": "Medium",
                "reason": f"Creates a visual focal point for {event_type} photography and guest welcoming.",
                "alternative": "Balloon arch with neon LED quote sign and paper lantern canopy",
                "premium_option": "Fresh exotic floral stage backdrop with dynamic wash lighting effects"
            },
            {
                "item_name": "Professional DJ, High-Output Sound & Party Lighting",
                "estimated_price_min": round(sound_budget * 0.70, 2),
                "estimated_price_max": round(sound_budget * 0.90, 2),
                "priority": "Medium",
                "reason": "Keeps event energy vibrant and manages stage announcements seamlessly.",
                "alternative": "High-powered Bluetooth PA speakers with curated Spotify event playlist",
                "premium_option": "Live acoustic 3-piece band followed by professional club DJ set"
            },
            {
                "item_name": "Candid Event Photographer & Highlight Reel",
                "estimated_price_min": round(photo_budget * 0.75, 2),
                "estimated_price_max": round(photo_budget * 0.95, 2),
                "priority": "Medium",
                "reason": "Captures spontaneous guest memories and high-resolution group portraits.",
                "alternative": "Instant Fujifilm Instax photo-booth corner with props for guest self-take",
                "premium_option": "Dual-camera crew (1 candid photographer + 1 4K cinematic video reel creator)"
            }
        ]

        saving_tips = [
            f"Pre-select a focused 3-course {food_preference} menu rather than an overwhelming 15-item buffet to eliminate food waste and reduce per-plate costs by 15-20%.",
            "Concentrate 80% of your decoration budget onto a single stunning photo backdrop corner instead of spreading thin decor across the entire hall.",
            "Book venues on weekday evenings or Sunday afternoons for up to 30% discount on facility rental charges.",
            "Use digital video invites instead of printed invitation cards to redirect savings into dessert live stations."
        ]

        premium_upgrades = [
            "360-Degree Video Booth with automated slow-motion social sharing.",
            "Personalized favors and bespoke welcome kits for all attending guests.",
            "Signature molecular mocktail / cocktail bar with custom drink names."
        ]

        complete_event_plan = (
            f"Phase 1 (Arrival & Welcome - First 45 mins): Welcome drinks, light appetizers, ambient acoustic background music, photo backdrop greetings.\n"
            f"Phase 2 (Main Ceremonies & Highlights - 60 mins): Primary {event_type} celebration moments, speeches, cake cutting or toast, candid group photography.\n"
            f"Phase 3 (Dinner & Dining - 75 mins): Main buffet service opened with coordinated live counters, warm dessert service.\n"
            f"Phase 4 (Dance & Wrap-up - 60 mins): DJ dance floor, dessert bar, guest farewell and giveaway distribution."
        )

        explanation = (
            f"With a budget of ₹{total_budget:,.2f} for {number_of_guests} guests, the targeted spend is ₹{per_person_cost:,.2f} per person. "
            f"Food & Catering is allocated the largest share (40-44%) to guarantee ample variety and culinary excellence. "
            f"Venue & Decor comprise ~34% to establish an enchanting setting in {venue_type}. "
            f"A dedicated Contingency Reserve of ₹{cat_map.get('Contingency Reserve', 0):,.2f} plus an unallocated cushion of ₹{budget_data['remaining_budget']:,.2f} "
            f"protects against last-minute headcount increases or extra service hours."
        )

        summary = f"{event_type} event plan for {number_of_guests} guests at ₹{per_person_cost:,.2f}/person."

        return {
            "planner_type": "party",
            "summary": summary,
            "total_budget": total_budget,
            "allocated_budget": allocated_budget,
            "remaining_budget": budget_data["remaining_budget"],
            "per_person_cost": per_person_cost,
            "categories": categories,
            "recommendations": recommendations,
            "saving_tips": saving_tips,
            "premium_upgrades": premium_upgrades,
            "complete_event_plan": complete_event_plan,
            "explanation": explanation,
            "is_fallback": True,
            "ai_model": "Smart Fallback Engine (Algorithmic)"
        }

    @staticmethod
    def get_jewelry_recommendations(
        budget_data: Dict[str, Any],
        occasion: str,
        jewelry_style: str,
        preferred_metal: str,
        preferred_color: str,
        jewelry_types: List[str]
    ) -> Dict[str, Any]:
        """
        Generate recommendations, saving tips, upgrades, and explanation for Jewelry Planner.
        """
        total_budget = budget_data["total_budget"]
        allocated_budget = budget_data["allocated_budget"]
        categories = budget_data["categories"]
        cat_map = {c["name"]: c["allocated_amount"] for c in categories}

        style = jewelry_style.capitalize()
        metal = preferred_metal.capitalize()

        recommendations = []
        necklace_rec = None
        earrings_rec = None
        bracelet_rec = None
        ring_rec = None

        for c in categories:
            c_name = c["name"]
            c_amt = c["allocated_amount"]
            c_lower = c_name.lower()

            if "necklace" in c_lower or "choker" in c_lower or "set" in c_lower:
                item = f"{style} {metal} Statement Necklace"
                necklace_rec = item
                recommendations.append({
                    "item_name": item,
                    "estimated_price_min": round(c_amt * 0.85, 2),
                    "estimated_price_max": round(c_amt * 1.05, 2),
                    "priority": "High",
                    "reason": f"Central aesthetic anchor designed in {metal} with subtle {preferred_color} accents for {occasion}.",
                    "alternative": "Delicate tiered chain necklace with single solitaire stone pendant",
                    "premium_option": "Intricate temple/polki handcrafted choker with certified gemstone drops"
                })
            elif "earring" in c_lower or "jhumka" in c_lower or "stud" in c_lower:
                item = f"{style} {metal} Chandbali / Jhumka Earrings"
                earrings_rec = item
                recommendations.append({
                    "item_name": item,
                    "estimated_price_min": round(c_amt * 0.85, 2),
                    "estimated_price_max": round(c_amt * 1.05, 2),
                    "priority": "High",
                    "reason": f"Frames the face with elegant movement, designed to match the {style} collar piece.",
                    "alternative": "Geometric drop earrings or minimal pave-set huggie hoops",
                    "premium_option": "Uncut diamond polki studs with detachable emerald/ruby drops"
                })
            elif "bracelet" in c_lower or "bangle" in c_lower:
                item = f"{style} {metal} Sleek Kada / Tennis Bracelet"
                bracelet_rec = item
                recommendations.append({
                    "item_name": item,
                    "estimated_price_min": round(c_amt * 0.85, 2),
                    "estimated_price_max": round(c_amt * 1.05, 2),
                    "priority": "Medium",
                    "reason": f"Provides wrist glamour without overwhelming hand movement during {occasion}.",
                    "alternative": "Pair of lightweight filigree bangles with rhodium polish",
                    "premium_option": "Prong-set diamond tennis bracelet with double safety box clasp"
                })
            elif "ring" in c_lower:
                item = f"{style} {metal} Cocktail Solitaire Ring"
                ring_rec = item
                recommendations.append({
                    "item_name": item,
                    "estimated_price_min": round(c_amt * 0.85, 2),
                    "estimated_price_max": round(c_amt * 1.05, 2),
                    "priority": "Medium",
                    "reason": f"A refined statement ring that reflects light whenever gesturing or posing.",
                    "alternative": "Sleek eternity band with micropavé cubic zirconia or moissanite",
                    "premium_option": "Certified natural gemstone ring with halo diamond surround"
                })
            else:
                item = f"{style} {metal} {c_name}"
                recommendations.append({
                    "item_name": item,
                    "estimated_price_min": round(c_amt * 0.85, 2),
                    "estimated_price_max": round(c_amt * 1.05, 2),
                    "priority": "Low",
                    "reason": f"Harmonizing accent for complete {occasion} styling.",
                    "alternative": f"Minimal silver-plated version of {c_name}",
                    "premium_option": f"Custom hand-engraved heirloom edition of {c_name}"
                })

        saving_tips = [
            f"Consider 18K or 14K hallmarked {metal} instead of 22K/24K for intricate designs; it significantly increases structural rigidity while saving 15-25% on metal costs.",
            "Opt for high-grade Lab-Grown Diamonds or Moissanite instead of mined diamonds for 60-70% lower price with identical optical brilliance and test-pen pass.",
            "Choose modular jewelry (e.g. detachable earring drops or convertible choker-to-bracelet pieces) to wear items for both casual and festive occasions.",
            "Check making charges across jewelers; negotiate flat making rates during festive promotion periods."
        ]

        premium_upgrades = [
            "Bespoke CAD Customization: Have the jewelry 3D modeled and cast specifically to your neckline contour.",
            "Certified VVS-EF Diamond Accents with IGI/GIA laser inscriptions.",
            "Heirloom Anti-Tarnish Dual Platinum & 24K Gold Micro-Plating."
        ]

        matching_explanation = (
            f"The chosen {metal} pieces with {preferred_color} undertones harmonize seamlessly with your {style} theme, "
            f"creating a cohesive visual rhythm from necklace to rings without clashing metals."
        )

        style_explanation = (
            f"By emphasizing {style} motifs, each piece showcases purposeful craftsmanship—balancing ornamentation "
            f"with wearable comfort suitable for the duration of the {occasion}."
        )

        color_matching = f"{metal} provides a warm, radiant contrast with {preferred_color} tones, amplifying the richness of the ensemble."
        occasion_matching = f"Tailored specifically for {occasion}, ensuring appropriate grandeur without looking underdressed or overly cluttered."

        explanation = (
            f"Your ₹{total_budget:,.2f} budget has been calibrated across {len(categories)} jewelry pieces in {metal}. "
            f"The centerpiece necklace receives the foundational share to command visual attention, accompanied by "
            f"matching {earrings_rec or 'earrings'} and coordinated accents. "
            f"A reserve of ₹{budget_data['remaining_budget']:,.2f} is retained for hallmarking, GST/sales taxes, and protective luxury jewel cases."
        )

        summary = f"{style} {metal} jewelry collection for {occasion} with ₹{allocated_budget:,.2f} allocated."

        return {
            "planner_type": "jewelry",
            "summary": summary,
            "total_budget": total_budget,
            "allocated_budget": allocated_budget,
            "remaining_budget": budget_data["remaining_budget"],
            "categories": categories,
            "recommendations": recommendations,
            "necklace_recommendation": necklace_rec,
            "earrings_recommendation": earrings_rec,
            "bracelet_recommendation": bracelet_rec,
            "ring_recommendation": ring_rec,
            "matching_explanation": matching_explanation,
            "style_explanation": style_explanation,
            "color_matching": color_matching,
            "occasion_matching": occasion_matching,
            "saving_tips": saving_tips,
            "premium_upgrades": premium_upgrades,
            "explanation": explanation,
            "is_fallback": True,
            "ai_model": "Smart Fallback Engine (Algorithmic)"
        }

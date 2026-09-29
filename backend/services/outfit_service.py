import io
from typing import Dict, Any, List, Tuple
from PIL import Image
from backend.schemas import OutfitAnalysisResponse

# Standard color palette distance reference
PALETTE = {
    "Deep Crimson Red": (180, 20, 30),
    "Royal Emerald Green": (20, 120, 60),
    "Midnight Navy Blue": (25, 40, 90),
    "Royal Peacock Blue": (0, 110, 160),
    "Golden Mustard / Ochre": (218, 165, 32),
    "Blush Rose Pink": (230, 150, 170),
    "Ivory / Cream White": (245, 240, 225),
    "Jet Black": (25, 25, 25),
    "Rich Wine / Maroon": (120, 20, 50),
    "Pastel Lavender": (180, 160, 220),
    "Warm Rust Orange": (200, 80, 30),
    "Olive Green": (100, 120, 45)
}

def color_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

def find_closest_color_name(rgb: Tuple[int, int, int]) -> str:
    closest_name = "Neutral Tone"
    min_dist = float("inf")
    for name, palette_rgb in PALETTE.items():
        dist = color_distance(rgb, palette_rgb)
        if dist < min_dist:
            min_dist = dist
            closest_name = name
    return closest_name

class OutfitAnalyzer:
    @staticmethod
    def fallback_analyze_image(image_bytes: bytes, filename: str = "outfit.jpg") -> Dict[str, Any]:
        """
        Deterministic image analysis using PIL color quantization and heuristic styling.
        Extracts dominant colors from the image buffer and recommends matching jewelry.
        """
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            # Downsample for rapid processing
            image.thumbnail((200, 200))
            
            # Quantize to 4 dominant colors
            quantized = image.quantize(colors=5)
            palette = quantized.getpalette()[:15]  # first 5 colors (r,g,b each)
            
            extracted_rgbs = []
            for i in range(0, len(palette), 3):
                extracted_rgbs.append((palette[i], palette[i+1], palette[i+2]))
            
            # Filter out extreme white/black background pixels if possible
            color_names = []
            for rgb in extracted_rgbs:
                name = find_closest_color_name(rgb)
                if name not in color_names:
                    color_names.append(name)
            
            primary_color = color_names[0] if color_names else "Rich Burgundy"
            secondary_colors = color_names[1:4] if len(color_names) > 1 else ["Golden Accents", "Ivory"]
        except Exception:
            primary_color = "Crimson Red"
            secondary_colors = ["Gold", "Emerald Accent"]

        # Color-based jewelry pairing heuristics
        p_lower = primary_color.lower()
        if any(w in p_lower for w in ["red", "maroon", "wine", "ochre", "mustard"]):
            jewelry_colors = ["Antique Gold", "Kundan Polki", "Warm Yellow Gold"]
            appearance = "Traditional Festive"
            neck_rec = "Multi-strand Gold Choker with ruby center drops"
            ear_rec = "Traditional Chandbali earrings with pearl edging"
            brace_rec = "Carved antique gold bangles (Kada set)"
            ring_rec = "Royal ruby-studded floral cocktail ring"
            reason = f"Warm {primary_color} pairs magnificently with antique yellow gold and rich Kundan stones, enhancing the regal festive silhouette."
        elif any(w in p_lower for w in ["blue", "navy", "peacock", "green", "emerald", "black"]):
            jewelry_colors = ["Platinum", "White Gold", "Sparkling Diamonds", "Emerald Accents"]
            appearance = "Modern Elegance"
            neck_rec = "Contemporary Diamond cascade collar necklace"
            ear_rec = "Brilliant-cut solitaire drop earrings"
            brace_rec = "Prong-set diamond tennis bracelet"
            ring_rec = "Emerald-cut sapphire or diamond solitaire ring"
            reason = f"Cool-toned {primary_color} creates high-contrast radiance against sparkling platinum and white diamonds."
        elif any(w in p_lower for w in ["pink", "blush", "lavender", "cream", "ivory"]):
            jewelry_colors = ["Rose Gold", "Freshwater Pearls", "Pastel Enamel"]
            appearance = "Romantic Contemporary"
            neck_rec = "Delicate Rose Gold pendant with layered chain"
            ear_rec = "South Sea pearl cluster drop earrings"
            brace_rec = "Slim rose-gold mesh bracelet with pave diamond clasp"
            ring_rec = "Pear-shaped morganite or pink tourmaline ring"
            reason = f"Delicate pastel {primary_color} benefits from subtle rose gold and luminescent pearls, offering refined grace without heavy glare."
        else:
            jewelry_colors = ["Yellow Gold", "Oxidized Silver", "Dual-Tone Metal"]
            appearance = "Fusion Chic"
            neck_rec = "Layered geometric statement chain necklace"
            ear_rec = "Artisan hammered metal hoop earrings"
            brace_rec = "Stackable textured dual-tone bangles"
            ring_rec = "Bold architectural signet ring"
            reason = f"The balanced palette of {primary_color} works with modern dual-tone styling, creating a confident, polished aesthetic."

        return {
            "primary_color": primary_color,
            "secondary_colors": secondary_colors,
            "pattern": "Solid / Texturized Weave",
            "style": appearance,
            "appearance": appearance,
            "neckline": "Universal / Sweetheart / Round",
            "sleeve_style": "Classic Length",
            "overall_style": appearance,
            "suitable_jewelry_colors": jewelry_colors,
            "suitable_jewelry_types": ["Necklace", "Earrings", "Bracelet", "Statement Ring"],
            "suggested_necklace": neck_rec,
            "suggested_earrings": ear_rec,
            "suggested_bracelet": brace_rec,
            "suggested_ring": ring_rec,
            "explanation": reason,
            "is_fallback": True
        }

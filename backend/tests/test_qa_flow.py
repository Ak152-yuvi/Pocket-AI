import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from backend.main import app
from backend.database import Base, engine

client = TestClient(app)

def test_complete_qa_user_flow():
    """
    QA End-to-End User Flow:
    Register → Login → Me → Health → Home Planner → Save History →
    View History → Party Planner → Jewelry Planner → Outfit Upload →
    Profile Update → Delete History → Logout → Re-login.
    """
    # 0. Initialize Clean Database
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # 1. Health Endpoint Check
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200, f"Health check failed: {health_resp.text}"
    health_data = health_resp.json()
    assert health_data["status"] == "healthy"
    print("[PASS] QA Check: /api/health returned healthy.")

    # 2. Register User
    reg_payload = {
        "name": "Sarah Connor",
        "email": "sarah.connor@example.com",
        "password": "SecurePassword2026!",
        "confirm_password": "SecurePassword2026!"
    }
    reg_resp = client.post("/api/auth/register", json=reg_payload)
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.text}"
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    token = reg_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] QA Check: User registered successfully.")

    # 3. Authenticated Me Endpoint
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200, f"Me endpoint failed: {me_resp.text}"
    assert me_resp.json()["email"] == "sarah.connor@example.com"
    print("[PASS] QA Check: /api/auth/me verified user identity.")

    # 4. Home Interior Planner
    home_payload = {
        "total_budget": 200000.0,
        "number_of_rooms": 3,
        "room_types": ["Living Room", "Master Bedroom", "Kitchen"],
        "interior_style": "Modern",
        "preferred_colors": ["Warm White", "Charcoal Grey"],
        "furniture_requirements": "Modular 3-seater sofa and queen bed with hydraulics",
        "lighting_requirements": "False ceiling magnetic track lighting",
        "storage_requirements": "Floor to ceiling sliding wardrobes",
        "decoration_requirements": "Textured wool rug and minimal art",
        "additional_requirements": "Pet-friendly fabrics"
    }
    home_resp = client.post("/api/generate-home", json=home_payload, headers=headers)
    assert home_resp.status_code == 200, f"Home planner failed: {home_resp.text}"
    home_plan = home_resp.json()
    assert home_plan["total_budget"] == 200000.0
    assert home_plan["allocated_budget"] <= 200000.0
    assert home_plan["remaining_budget"] >= 0.0
    assert round(home_plan["allocated_budget"] + home_plan["remaining_budget"], 2) == 200000.0
    assert len(home_plan["categories"]) >= 4
    assert len(home_plan["rooms"]) == 3
    assert len(home_plan["recommendations"]) > 0
    print("[PASS] QA Check: Home Planner calculated allocations without exceeding budget.")

    # 5. Check Planning History (1 item expected)
    hist_resp = client.get("/api/history", headers=headers)
    assert hist_resp.status_code == 200
    hist_items = hist_resp.json()
    assert len(hist_items) == 1
    home_history_id = hist_items[0]["id"]
    assert hist_items[0]["planner_type"] == "home"
    assert hist_items[0]["total_budget"] == 200000.0
    print("[PASS] QA Check: Home Plan automatically persisted to history.")

    # 6. View Specific Plan Detail
    detail_resp = client.get(f"/api/history/{home_history_id}", headers=headers)
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert detail_data["id"] == home_history_id
    assert detail_data["result_data"]["total_budget"] == 200000.0
    print("[PASS] QA Check: Retrieved full plan detail by ID.")

    # 7. Party Planner
    party_payload = {
        "total_budget": 80000.0,
        "number_of_guests": 100,
        "event_type": "Engagement",
        "venue_type": "Banquet Hall",
        "food_preference": "Mixed Buffet",
        "decoration_preference": "Floral stage arch with fairy lights",
        "entertainment_preference": "DJ with sound console",
        "event_duration": "5 Hours",
        "additional_requirements": "Custom 2-tier cake"
    }
    party_resp = client.post("/api/generate-party", json=party_payload, headers=headers)
    assert party_resp.status_code == 200, f"Party planner failed: {party_resp.text}"
    party_plan = party_resp.json()
    assert party_plan["total_budget"] == 80000.0
    assert party_plan["allocated_budget"] <= 80000.0
    assert party_plan["remaining_budget"] >= 0.0
    assert party_plan["per_person_cost"] > 0
    assert len(party_plan["categories"]) >= 5
    print("[PASS] QA Check: Party Planner calculated guest economics and venue allocations.")

    # 8. Jewelry Planner
    jewelry_payload = {
        "total_budget": 120000.0,
        "occasion": "Wedding",
        "jewelry_style": "Traditional",
        "preferred_metal": "Gold (22K / 18K)",
        "preferred_color": "Royal Maroon & Gold",
        "jewelry_types": ["Necklace", "Earrings", "Bangles / Bracelet", "Ring"],
        "outfit_description": "Velvet maroon lehenga with zardozi embroidery"
    }
    jewel_resp = client.post("/api/generate-jewelry", json=jewelry_payload, headers=headers)
    assert jewel_resp.status_code == 200, f"Jewelry planner failed: {jewel_resp.text}"
    jewel_plan = jewel_resp.json()
    assert jewel_plan["total_budget"] == 120000.0
    assert jewel_plan["allocated_budget"] <= 120000.0
    assert len(jewel_plan["categories"]) == 4
    print("[PASS] QA Check: Jewelry Planner created ensemble breakdown.")

    # 9. Outfit Image Upload and Vision Analysis
    # Create sample in-memory image
    test_img = Image.new("RGB", (150, 150), color=(140, 25, 45))  # Deep maroon/wine color
    img_byte_arr = io.BytesIO()
    test_img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)

    upload_resp = client.post(
        "/api/analyze-outfit",
        files={"file": ("wedding_lehenga.png", img_byte_arr, "image/png")},
        headers=headers
    )
    assert upload_resp.status_code == 200, f"Outfit analysis failed: {upload_resp.text}"
    outfit_analysis = upload_resp.json()
    assert "primary_color" in outfit_analysis
    assert "suggested_necklace" in outfit_analysis
    assert "explanation" in outfit_analysis
    print(f"[PASS] QA Check: Outfit image analyzed. Dominant color: {outfit_analysis['primary_color']}.")

    # 10. Verify History now contains all 3 plans
    hist_resp_3 = client.get("/api/history", headers=headers)
    assert hist_resp_3.status_code == 200
    all_items = hist_resp_3.json()
    assert len(all_items) == 3
    print("[PASS] QA Check: History successfully indexed all 3 plans.")

    # 11. User Profile: Get & Update Preferences
    prof_resp = client.get("/api/user/profile", headers=headers)
    assert prof_resp.status_code == 200
    assert prof_resp.json()["name"] == "Sarah Connor"

    update_prof = client.put("/api/user/profile", json={
        "name": "Sarah Connor Brewster",
        "preferred_currency": "₹",
        "preferred_style": "Luxury",
        "preferred_language": "English"
    }, headers=headers)
    assert update_prof.status_code == 200
    assert update_prof.json()["name"] == "Sarah Connor Brewster"
    assert update_prof.json()["preferred_style"] == "Luxury"
    print("[PASS] QA Check: User profile and preferences updated.")

    # 12. Delete one item from History
    plan_to_delete = all_items[0]["id"]
    del_resp = client.delete(f"/api/history/{plan_to_delete}", headers=headers)
    assert del_resp.status_code == 200

    # Verify history now has 2 items
    hist_resp_after_del = client.get("/api/history", headers=headers)
    assert len(hist_resp_after_del.json()) == 2
    print("[PASS] QA Check: Deleted plan verified removed from history.")

    # 13. Verify Unauthorized Access: Cannot access deleted plan
    not_found = client.get(f"/api/history/{plan_to_delete}", headers=headers)
    assert not_found.status_code == 404
    print("[PASS] QA Check: 404 returned for missing / deleted plan.")

    # 14. Logout
    logout_resp = client.post("/api/auth/logout", headers=headers)
    assert logout_resp.status_code == 200
    print("[PASS] QA Check: User logout acknowledged.")

    # 15. Re-login
    login_resp = client.post("/api/auth/login", json={
        "email": "sarah.connor@example.com",
        "password": "SecurePassword2026!"
    })
    assert login_resp.status_code == 200
    relogin_data = login_resp.json()
    assert "access_token" in relogin_data
    assert relogin_data["user"]["name"] == "Sarah Connor Brewster"
    print("[PASS] QA Check: Re-login successful with updated profile name.")

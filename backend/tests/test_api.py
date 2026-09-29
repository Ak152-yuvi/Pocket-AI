import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from backend.main import app
from backend.database import Base, engine, SessionLocal
from backend.models import User, PlanningHistory

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "gemini_configured" in data

def test_register_and_login_flow():
    # 1. Register User
    reg_payload = {
        "name": "Jane Designer",
        "email": "jane@example.com",
        "password": "SecretPassword123",
        "confirm_password": "SecretPassword123"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert "access_token" in reg_data
    assert reg_data["user"]["email"] == "jane@example.com"
    token = reg_data["access_token"]

    # 2. Duplicate Registration Prevention
    dup_res = client.post("/api/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Login
    login_res = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "SecretPassword123"
    })
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Invalid Login
    bad_login = client.post("/api/auth/login", json={
        "email": "jane@example.com",
        "password": "WrongPassword"
    })
    assert bad_login.status_code == 401

    # 5. Me endpoint
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["name"] == "Jane Designer"

def test_home_planner_and_history():
    # Register & get token
    reg_res = client.post("/api/auth/register", json={
        "name": "Architect Bob",
        "email": "bob@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    home_payload = {
        "total_budget": 150000,
        "number_of_rooms": 3,
        "room_types": ["Living Room", "Master Bedroom", "Kitchen"],
        "interior_style": "Scandinavian",
        "preferred_colors": ["White", "Beige", "Light Oak"],
        "furniture_requirements": "Modular 3-seater sofa and king bed",
        "lighting_requirements": "Warm ambient pendant lights",
        "storage_requirements": "Full height wardrobe",
        "decoration_requirements": "Textured rugs and planters"
    }

    res = client.post("/api/generate-home", json=home_payload, headers=headers)
    assert res.status_code == 200
    plan = res.json()
    assert plan["total_budget"] == 150000
    assert plan["allocated_budget"] <= 150000
    assert plan["remaining_budget"] >= 0
    assert len(plan["categories"]) > 0
    assert len(plan["rooms"]) == 3
    assert len(plan["recommendations"]) > 0

    # Verify history was saved
    hist_res = client.get("/api/history", headers=headers)
    assert hist_res.status_code == 200
    history_items = hist_res.json()
    assert len(history_items) == 1
    assert history_items[0]["planner_type"] == "home"
    history_id = history_items[0]["id"]

    # Retrieve history detail
    detail_res = client.get(f"/api/history/{history_id}", headers=headers)
    assert detail_res.status_code == 200
    assert detail_res.json()["planner_type"] == "home"
    assert detail_res.json()["result_data"]["total_budget"] == 150000

def test_party_planner():
    reg_res = client.post("/api/auth/register", json={
        "name": "Party Host",
        "email": "host@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    party_payload = {
        "total_budget": 60000,
        "number_of_guests": 80,
        "event_type": "Engagement",
        "venue_type": "Outdoor Lawn",
        "food_preference": "Mixed Buffet",
        "decoration_preference": "Floral Arch with fairy lights",
        "entertainment_preference": "Live Acoustic Duo",
        "event_duration": "5 Hours"
    }

    res = client.post("/api/generate-party", json=party_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_budget"] == 60000
    assert data["allocated_budget"] <= 60000
    assert data["per_person_cost"] > 0
    assert len(data["categories"]) > 0
    assert len(data["recommendations"]) > 0

def test_jewelry_planner_and_outfit():
    reg_res = client.post("/api/auth/register", json={
        "name": "Jewelry Buyer",
        "email": "buyer@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    jewelry_payload = {
        "total_budget": 85000,
        "occasion": "Wedding",
        "jewelry_style": "Traditional",
        "preferred_metal": "Gold",
        "preferred_color": "Ruby Red & Gold",
        "jewelry_types": ["Necklace", "Earrings", "Bangles / Bracelet", "Ring"]
    }

    res = client.post("/api/generate-jewelry", json=jewelry_payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_budget"] == 85000
    assert data["allocated_budget"] <= 85000
    assert len(data["categories"]) == 4

    # Test outfit image analysis with synthetic PIL image
    img = Image.new("RGB", (100, 100), color=(180, 20, 30))  # Crimson red image
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    upload_res = client.post(
        "/api/analyze-outfit",
        files={"file": ("red_dress.jpg", buf, "image/jpeg")},
        headers=headers
    )
    assert upload_res.status_code == 200
    outfit_data = upload_res.json()
    assert "primary_color" in outfit_data
    assert "suggested_necklace" in outfit_data
    assert len(outfit_data["suitable_jewelry_colors"]) > 0

def test_user_profile_and_isolation():
    # User 1
    u1 = client.post("/api/auth/register", json={
        "name": "User One",
        "email": "user1@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    }).json()
    t1 = u1["access_token"]

    # User 2
    u2 = client.post("/api/auth/register", json={
        "name": "User Two",
        "email": "user2@example.com",
        "password": "Password123",
        "confirm_password": "Password123"
    }).json()
    t2 = u2["access_token"]

    # User 1 creates home plan
    client.post("/api/generate-home", json={
        "total_budget": 50000,
        "number_of_rooms": 1,
        "room_types": ["Living Room"],
        "interior_style": "Minimal"
    }, headers={"Authorization": f"Bearer {t1}"})

    # User 1 history has 1 item
    h1 = client.get("/api/history", headers={"Authorization": f"Bearer {t1}"}).json()
    assert len(h1) == 1
    plan_id = h1[0]["id"]

    # User 2 history must be empty (isolated)
    h2 = client.get("/api/history", headers={"Authorization": f"Bearer {t2}"}).json()
    assert len(h2) == 0

    # User 2 cannot access or delete User 1's plan
    forbidden_get = client.get(f"/api/history/{plan_id}", headers={"Authorization": f"Bearer {t2}"})
    assert forbidden_get.status_code == 404

    forbidden_del = client.delete(f"/api/history/{plan_id}", headers={"Authorization": f"Bearer {t2}"})
    assert forbidden_del.status_code == 404

    # Profile update for User 1
    prof_update = client.put("/api/user/profile", json={
        "name": "User One Updated",
        "preferred_currency": "$",
        "preferred_style": "Luxury"
    }, headers={"Authorization": f"Bearer {t1}"})
    assert prof_update.status_code == 200
    assert prof_update.json()["name"] == "User One Updated"
    assert prof_update.json()["preferred_currency"] == "$"

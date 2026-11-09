import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.reservation import Reservation
from app.models.enquiry import CustomerEnquiry

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Layali Dubai" in data["restaurant"]

def test_get_menu():
    response = client.get("/api/menu/categories")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) > 0
    # Starters, Mains, Desserts, Beverages exist
    names = [c["name"] for c in categories]
    assert any("Starters" in n for n in names)
    assert any("Mains" in n for n in names)

def test_admin_login_success():
    response = client.post("/api/auth/login", json={
        "email": "admin@layalidubai.ae",
        "password": "Admin@Dubai2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@layalidubai.ae"

def test_admin_login_failure():
    response = client.post("/api/auth/login", json={
        "email": "admin@layalidubai.ae",
        "password": "WrongPassword!"
    })
    assert response.status_code == 401

def test_check_availability():
    target_date = (date.today() + timedelta(days=2)).isoformat()
    response = client.get(f"/api/availability/check?reservation_date={target_date}&guest_count=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["slots"]) > 0
    # At least some standard slots should be available
    available_slots = [s for s in data["slots"] if s["available"]]
    assert len(available_slots) > 0

def test_create_and_lookup_reservation():
    target_date = (date.today() + timedelta(days=5)).isoformat()
    booking_payload = {
        "customer_name": "Sheikh Mansoor Al-Ketbi",
        "customer_email": "mansoor.test@example.com",
        "customer_phone": "+971 50 123 4567",
        "reservation_date": target_date,
        "reservation_time": "20:00",
        "guest_count": 4,
        "seating_preference": "Burj View Terrace",
        "special_requests": "Anniversary dinner celebration with fountain view"
    }

    response = client.post("/api/reservations", json=booking_payload)
    assert response.status_code == 201
    booking = response.json()
    assert "LYL-" in booking["booking_reference"]
    assert booking["status"] == "pending"
    assert booking["table_id"] is not None
    assert booking["guest_count"] == 4

    ref = booking["booking_reference"]

    # Customer lookup
    lookup_res = client.get(f"/api/reservations/lookup?booking_reference={ref}&contact=mansoor.test@example.com")
    assert lookup_res.status_code == 200
    assert lookup_res.json()["booking_reference"] == ref

def test_submit_enquiry():
    enquiry_payload = {
        "customer_name": "Fatima Al-Zahra",
        "customer_email": "fatima.zahra@example.com",
        "customer_phone": "+971 55 987 6543",
        "subject": "Corporate Gala Event Booking",
        "message": "We would like to inquire about booking the entire Royal Majlis for a 40-person private dinner next month."
    }
    response = client.post("/api/enquiries", json=enquiry_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "pending"
    assert data["customer_name"] == "Fatima Al-Zahra"

def test_admin_dashboard_stats():
    # Login to get token
    login_res = client.post("/api/auth/login", json={
        "email": "admin@layalidubai.ae",
        "password": "Admin@Dubai2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    stats_res = client.get("/api/dashboard/stats", headers=headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_bookings"] >= 1
    assert stats["total_enquiries"] >= 1
    assert stats["total_tables"] >= 10
    assert stats["total_menu_items"] >= 10

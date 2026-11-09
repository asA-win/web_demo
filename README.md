# Layali Dubai — Royal Lounge & Dining
### Production-Grade Restaurant & Café Management Platform (Downtown Dubai)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styles-Tailwind%20CSS-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![WebSockets](https://img.shields.io/badge/Real--Time-WebSockets-FF6B6B.svg?style=flat)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

A full-stack, production-ready restaurant website and management platform designed for a luxury Dubai establishment overlooking the Burj Khalifa and Dubai Fountain.

---

## 🏛️ Project Features

### 1. Customer Website
* **Home Page**: Opulent Dubai gold & obsidian dark aesthetic, high-resolution cuisine gallery, Michelin-trained Executive Chef showcase, guest accolades, operating hours, and location highlights.
* **A La Carte Menu**: Dynamic menu categories (*Starters & Cold Mezze*, *Royal Mains*, *Charcoal Robata & Grills*, *Artisanal Desserts*, *Signature Zero-Proof Elixirs*), AED pricing, vegetarian/vegan/gluten-free/chef's special badges, search filter, and **real-time WebSocket updates** when management edits items.
* **Intelligent Table Reservation**:
  * Guest count, calendar date picker, and seating atmosphere preference (*Burj View Terrace*, *Royal Majlis VIP*, *Main Dining Hall*).
  * Real-time slot availability check (`/api/availability/check`).
  * Double-booking and overbooking prevention via automated capacity matching.
  * Unique booking reference generation (`LYL-XXXX-XX`).
  * Instant voucher generation with print capability and status tracker.
* **Live Booking Status Tracker**:
  * Track reservation status (*Pending*, *Confirmed*, *Completed*, *Cancelled*, *Rejected*).
  * Connected via real-time WebSocket: updates instantly when admin confirms or adjusts bookings.
  * Customer cancellation subject to 2-hour restaurant policy.
* **Contact & Concierge**: Interactive form saving enquiries to PostgreSQL with instant WebSocket alerts to admin; interactive Downtown Dubai Google Map integration.

### 2. Admin Operations Console
* **Secure JWT Authentication**: Bcrypt password hashing and role-based access control.
* **Operations Dashboard**: Real-time KPI counters (*Total Bookings*, *Today's Bookings*, *Pending Approval*, *Confirmed*, *Cancelled*, *Customer Enquiries*).
* **Reservation Manager**: Status updates (*Confirm*, *Reject*, *Complete*), table re-allocation, internal host notes, search, and date filters.
* **Menu Engineering**: Add/Edit/Delete categories and dishes, AED price adjustments, allergen tagging, and instant client broadcast.
* **Table Capacity Management**: Multi-zone salon management (*Burj View Terrace*, *Royal Majlis VIP*, *Main Dining Salon*), guest capacities, and active/offline toggles.
* **Concierge & Enquiries**: View customer questions, record host replies, and manage communications.
* **Restaurant Parameters**: Opening/closing hours, dining slot duration, max guests, booking policy, and homepage announcement ribbon.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide React, Axios |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy ORM, Pydantic v2, Uvicorn |
| **Database** | PostgreSQL 16+ with Alembic migrations |
| **Real-Time** | FastAPI WebSockets with pub/sub channel broadcasting |
| **Security** | JWT Tokens (python-jose), Bcrypt native hashing, CORS middleware |
| **Containerization**| Docker, Docker Compose, Nginx Alpine |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
* Python 3.11+
* Node.js v20+ & npm
* PostgreSQL 16+ running locally or in Docker

---

### Step 1: Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file (copied from `.env.example`):
   ```env
   DATABASE_URL=postgresql://postgres:root@localhost:5433/dubai_restaurant
   SECRET_KEY=dubai_luxury_restaurant_secret_key_super_secure_2026_jwt_token_sign
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ENVIRONMENT=development
   ```

5. Run Alembic migrations and seed data:
   ```bash
   python -m alembic upgrade head
   python -c "from app.database import SessionLocal; from app.seed import seed_initial_data; db=SessionLocal(); seed_initial_data(db); db.close()"
   ```

6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   * Swagger Documentation: `http://localhost:8000/docs`
   * Health Check: `http://localhost:8000/health`

---

### Step 2: Frontend Setup

1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Ensure `frontend/.env` is configured:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_WS_BASE_URL=ws://localhost:8000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   * Access the customer website at: `http://localhost:5173`
   * Access the admin portal at: `http://localhost:5173/admin/login`

---

## 🔑 Default Administrator Credentials

| Role | Email | Password |
|---|---|---|
| **Executive Admin** | `admin@layalidubai.ae` | `Admin@Dubai2026` |

---

## ⚡ Real-Time WebSocket Architecture

1. **Admin Stream (`/ws/admin?token=...`)**:
   * Broadcasts `NEW_RESERVATION` when any customer books a table.
   * Broadcasts `RESERVATION_CANCELLED` when a customer cancels.
   * Broadcasts `NEW_ENQUIRY` on contact form submission.
   * Auto-refreshes admin counters and tables without page reload.

2. **Public Stream (`/ws/public`)**:
   * Broadcasts `MENU_UPDATED` when menu items or categories change.
   * Broadcasts `AVAILABILITY_CHANGED` when tables are booked or released.

3. **Booking Stream (`/ws/reservation/{booking_reference}`)**:
   * Dedicated channel for the customer tracking screen.
   * Immediately updates booking status when host clicks *Confirm* or *Reject*.

---

## 🧪 Testing

Execute the automated backend test suite:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

All 8 core test suites verify:
* API health check
* Menu category and item queries
* Authentication (success & failure)
* Availability logic & capacity matching
* Booking generation & reference lookup
* Contact enquiry pipeline
* Admin metrics & dashboard aggregations

---

## 🐳 Docker Deployment

To launch the full production stack (PostgreSQL, FastAPI backend, Nginx frontend):

```bash
docker-compose up --build -d
```

* Frontend: `http://localhost:80`
* Backend API: `http://localhost:8000`
* Swagger UI: `http://localhost:8000/docs`

---

## 📜 License
Proprietary & Confidential. Built for Layali Dubai Royal Lounge & Dining LLC.

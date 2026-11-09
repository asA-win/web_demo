from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.routers import (
    auth_router,
    menu_router,
    tables_router,
    availability_router,
    reservations_router,
    enquiries_router,
    dashboard_router,
    settings_router,
    websocket_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("layali_dubai_api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables are created
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
    
    # Auto-seed initial restaurant settings and admin if empty
    from app.seed import seed_initial_data
    db = SessionLocal()
    try:
        seed_initial_data(db)
    except Exception as e:
        logger.error(f"Error during auto-seeding: {e}")
    finally:
        db.close()

    yield
    # Shutdown
    logger.info("Shutting down API server...")

app = FastAPI(
    title="Layali Dubai — Royal Lounge & Dining API",
    description="Production-grade API for table reservations, menu management, customer enquiries, real-time WebSockets and administrative operations in Downtown Dubai.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev & production access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(menu_router)
app.include_router(tables_router)
app.include_router(availability_router)
app.include_router(reservations_router)
app.include_router(enquiries_router)
app.include_router(dashboard_router)
app.include_router(settings_router)
app.include_router(websocket_router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "restaurant": settings.RESTAURANT_NAME,
        "currency": settings.RESTAURANT_CURRENCY,
        "environment": settings.ENVIRONMENT
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to the {settings.RESTAURANT_NAME} API",
        "documentation": "/docs",
        "health": "/health"
    }

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from dotenv import load_dotenv

load_dotenv()

from backend.database import engine, Base
from backend.services.ai_service import is_gemini_available
from backend.schemas import HealthResponse

# Import routers
from backend.routes.auth import router as auth_router
from backend.routes.home import router as home_router
from backend.routes.party import router as party_router
from backend.routes.jewelry import router as jewelry_router
from backend.routes.history import router as history_router
from backend.routes.user import router as user_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("pocketsmart.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    logger.info("Initializing PocketSmart AI database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully.")
    yield
    logger.info("Shutting down PocketSmart AI backend...")

app = FastAPI(
    title="PocketSmart AI API",
    description="AI Budget & Smart Recommendation Assistant Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Validation Error Handler to prevent raw errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        field = " -> ".join([str(loc) for loc in err["loc"] if loc != "body"])
        errors.append(f"{field}: {err['msg']}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors}
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Something went wrong while processing your request. Please try again."}
    )

# Include Routers
app.include_router(auth_router)
app.include_router(home_router)
app.include_router(party_router)
app.include_router(jewelry_router)
app.include_router(history_router)
app.include_router(user_router)

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint indicating API status and Gemini AI readiness."""
    return {
        "status": "healthy",
        "gemini_configured": is_gemini_available(),
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
def root_status():
    return {
        "name": "PocketSmart AI API",
        "status": "running",
        "docs_url": "/docs",
        "gemini_ready": is_gemini_available()
    }

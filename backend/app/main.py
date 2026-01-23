"""
STRATA-AI Backend - Optimized for Production
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import ORJSONResponse
from app.core.config import settings
from app.db.engine import init_db, close_db
from app.api.v1.endpoints import auth, financials, ai, forecast, scenarios, roadmaps, startup, llm, onboarding
import time
import logging
from typing import Callable

# Configure logging - reduce pymongo verbosity
logging.basicConfig(level=logging.INFO)
logging.getLogger("pymongo").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for startup/shutdown events.
    Handles database connection pooling efficiently.
    """
    # Startup
    logger.info("Starting STRATA-AI API...")
    await init_db()
    logger.info("Database connected successfully")
    yield
    # Shutdown
    logger.info("Shutting down STRATA-AI API...")
    await close_db()
    logger.info("Database connection closed")


# Use ORJSONResponse for faster JSON serialization (2-3x faster than standard json)
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.DEBUG else None,  # Disable in prod
    docs_url="/docs" if settings.DEBUG else None,  # Disable Swagger in prod
    redoc_url="/redoc" if settings.DEBUG else None,  # Disable ReDoc in prod
    lifespan=lifespan,
    debug=settings.DEBUG,
    default_response_class=ORJSONResponse,  # Faster JSON responses
)

# GZip compression for responses > 500 bytes (reduces bandwidth significantly)
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Configuration - Allow frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    max_age=86400,
)


# Request timing and caching middleware
@app.middleware("http")
async def add_headers_middleware(request: Request, call_next: Callable):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time
    
    # Add timing header
    response.headers["X-Process-Time"] = f"{process_time:.4f}"
    
    # Add cache control headers based on endpoint
    path = request.url.path
    
    # Static/reference data - cache for 1 hour
    if any(p in path for p in ["/methods", "/templates", "/health"]):
        response.headers["Cache-Control"] = "public, max-age=3600"
    # User-specific data - no caching
    elif any(p in path for p in ["/auth", "/financials", "/roadmaps"]):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    # AI/forecast results - short cache (5 min)
    elif any(p in path for p in ["/forecast", "/scenarios", "/ai"]):
        response.headers["Cache-Control"] = "private, max-age=300"
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    
    return response


# Register Routers with optimized prefixes
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(financials.router, prefix=f"{settings.API_V1_STR}/financials", tags=["financials"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])
app.include_router(forecast.router, prefix=f"{settings.API_V1_STR}/forecast", tags=["forecast"])
app.include_router(scenarios.router, prefix=f"{settings.API_V1_STR}/scenarios", tags=["scenarios"])
app.include_router(roadmaps.router, prefix=f"{settings.API_V1_STR}/roadmaps", tags=["roadmaps"])
app.include_router(startup.router, prefix=f"{settings.API_V1_STR}/startup", tags=["startup"])
app.include_router(llm.router, prefix=f"{settings.API_V1_STR}/llm", tags=["llm"])
app.include_router(onboarding.router, prefix=f"{settings.API_V1_STR}/onboarding", tags=["onboarding"])


@app.get("/", response_class=ORJSONResponse)
async def root():
    """Root endpoint - lightweight health indicator."""
    return {"message": "STRATA-AI API", "status": "running", "version": "1.0.0"}


@app.get("/health", response_class=ORJSONResponse)
async def health_check():
    """
    Health check endpoint for load balancers and monitoring.
    Returns quickly to minimize resource usage.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else 4,  # Multiple workers in production
        log_level="debug" if settings.DEBUG else "info",
    )

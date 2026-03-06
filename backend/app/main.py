"""
FastAPI Application Entry Point
================================
• Mounts all API routers under /api/v1
• Adds CORS middleware for the React frontend
• Provides /health and / endpoints for observability
• Initialises the database on startup
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import init_db
from app.api import (
    leads_router,
    workflows_router,
    channels_router,
    analytics_router,
    ai_router,
    campaigns_router,
)
from app.api.webhooks import router as webhooks_router
from app.utils.logger import get_logger

settings = get_settings()
log = get_logger("main")


# ── Lifespan ──


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info(f"Starting {settings.APP_NAME} ({settings.APP_ENV})")
    init_db()
    log.info("Database tables created / verified")
    yield
    log.info("Shutting down")


# ── App Factory ──

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered outreach workflow automation platform",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount Routers ──

API_PREFIX = "/api/v1"
app.include_router(leads_router, prefix=API_PREFIX)
app.include_router(workflows_router, prefix=API_PREFIX)
app.include_router(channels_router, prefix=API_PREFIX)
app.include_router(analytics_router, prefix=API_PREFIX)
app.include_router(ai_router, prefix=API_PREFIX)
app.include_router(campaigns_router, prefix=API_PREFIX)
app.include_router(webhooks_router, prefix=API_PREFIX)


# ── Health & Root ──


@app.get("/", tags=["Root"])
def root():
    return {
        "app": settings.APP_NAME,
        "version": "0.1.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
    }

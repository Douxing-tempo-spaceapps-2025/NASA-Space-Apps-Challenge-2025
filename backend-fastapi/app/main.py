"""
FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
import sys

from app.core.config import settings
from app.api.v1.api import api_router


def create_application() -> FastAPI:
    """Create FastAPI application instance"""
    
    # Configure logging
    logger.remove()  # Remove default handler
    logger.add(
        sys.stdout,
        level=settings.log_level,
        format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
    )
    
    # Create FastAPI application
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="NASA Air Quality Data API Service",
        debug=settings.debug,
    )
    
    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # In production, should restrict to specific domains
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API routes
    app.include_router(api_router, prefix="/api/v1")
    
    return app


# Create application instance
app = create_application()


@app.on_event("startup")
async def startup_event():
    """Application startup event"""
    logger.info(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    logger.info(f"📡 Server running at http://{settings.host}:{settings.port}")
    logger.info(f"📚 API documentation: http://{settings.host}:{settings.port}/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event"""
    logger.info("🛑 Application shutting down...")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app_name": settings.app_name,
        "version": settings.app_version
    }

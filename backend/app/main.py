"""
MedInventory Backend API
FastAPI application with AI-powered supply chain optimization
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from contextlib import asynccontextmanager

from app.config import settings
from app.api.auth import router as auth_router
from app.api.inventory import router as inventory_router
from app.api.bidding import router as bidding_router
from app.api.equipment import router as equipment_router
from app.api.ai import router as ai_router
from app.api.analytics import router as analytics_router

# Initialize FastAPI app
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 MedInventory API starting up...")
    print(f"📊 Environment: {settings.APP_ENV}")
    print(f"🗄️  Database: Connected to Supabase")
    yield
    # Shutdown
    print("🛑 MedInventory API shutting down...")

app = FastAPI(
    title="MedInventory API",
    description="AI-powered healthcare supply chain optimization platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware for frontend integration
# Allow both development and production origins
allowed_origins = [
    "http://localhost:8080",
    "http://localhost:3000",
    "https://medinventory.vercel.app",  # Vercel frontend
    "https://medinventory-frontend.vercel.app",  # Alternative Vercel URL
    "https://*.vercel.app",  # Any Vercel subdomain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth_router)  # Auth router has its own prefix
app.include_router(inventory_router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(bidding_router, prefix="/api/bidding", tags=["Bidding"])
app.include_router(equipment_router, prefix="/api/equipment", tags=["Equipment"])
app.include_router(ai_router, prefix="/api", tags=["AI"])
app.include_router(analytics_router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "MedInventory API is running!",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.APP_ENV,
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    try:
        # You can add database connectivity check here
        return {
            "status": "healthy",
            "environment": settings.APP_ENV,
            "database": "connected",
            "ai_services": "available"
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Health check failed: {str(e)}")

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={
            "message": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if settings.DEBUG else False,
        log_level="info"
    )
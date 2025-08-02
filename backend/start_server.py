#!/usr/bin/env python3
"""
MedInventory Backend Server Startup Script
"""

import uvicorn
import sys
import os

# Add the app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def start_development_server():
    """Start the development server"""
    print("🚀 Starting MedInventory Backend API...")
    print("📝 Environment: Development")
    print("🌐 API Documentation: http://localhost:8000/docs")
    print("📊 Alternative Docs: http://localhost:8000/redoc")
    print("❤️  Health Check: http://localhost:8000/health")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
        access_log=True
    )

def start_production_server():
    """Start the production server"""
    print("🚀 Starting MedInventory Backend API (Production)...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="warning",
        access_log=False,
        workers=4
    )

if __name__ == "__main__":
    # Check if production mode
    if len(sys.argv) > 1 and sys.argv[1] == "--production":
        start_production_server()
    else:
        start_development_server()
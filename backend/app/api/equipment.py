"""
Equipment management and predictive maintenance API endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from datetime import datetime

from app.database import db

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
async def get_equipment(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    equipment_type: Optional[str] = Query(None)
):
    """Get equipment with pagination and filtering"""
    try:
        filters = {}
        if status:
            filters['status'] = status
        if equipment_type:
            filters['type'] = equipment_type
            
        result = await db.get_equipment(skip=skip, limit=limit, filters=filters)
        return result
    except Exception as e:
        logger.error(f"Failed to get equipment: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def equipment_health_check():
    """Health check for equipment service"""
    return {
        "status": "healthy",
        "service": "equipment",
        "timestamp": datetime.utcnow().isoformat()
    }
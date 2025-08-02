"""
AI API endpoints for demand forecasting and email generation
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any
from loguru import logger
from app.services.ai_service import ai_service
from app.services.forecast_service import forecast_service
from app.api.auth import get_current_user
from app.database import auth_db

router = APIRouter(prefix="/ai", tags=["AI Services"])


@router.get("/health")
async def get_ai_health():
    """Get AI service health status"""
    try:
        health_status = await ai_service.get_health_status()
        return {
            "status": "healthy" if health_status else "unhealthy",
            "ai_service": "operational" if health_status else "error",
            "model": ai_service.model_name,
            "message": "AI service is working correctly" if health_status else "AI service error"
        }
    except Exception as e:
        logger.error(f"AI health check failed: {e}")
        return {
            "status": "unhealthy",
            "ai_service": "error",
            "model": ai_service.model_name,
            "message": f"AI service error: {str(e)}"
        }


@router.get("/forecast/demand")
async def get_demand_forecast(
    forecast_period: str = Query("30d", description="Forecast period (7d, 30d, 90d, 6m, 1y)"),
    category_filter: Optional[str] = Query(None, description="Category filter"),
    force_regenerate: bool = Query(False, description="Force regeneration of forecast"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get AI-powered demand forecast with caching
    
    - Uses cached forecast for the day unless force_regenerate=True
    - Returns comprehensive forecast data with charts and insights
    - Includes stock alerts and immediate actions
    """
    try:
        # Get organization ID from user dictionary
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Get or create forecast using the forecast service
        forecast_data = await forecast_service.get_or_create_forecast(
            organization_id=organization_id,
            forecast_period=forecast_period,
            category_filter=category_filter,
            force_regenerate=force_regenerate
        )
        
        if not forecast_data:
            raise HTTPException(status_code=500, detail="Failed to generate forecast")
        
        # Log the forecast generation
        logger.info(f"Generated demand forecast for {len(forecast_data.get('forecasts', []))} items")
        
        return forecast_data
        
    except Exception as e:
        logger.error(f"Error in demand forecast API: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast generation failed: {str(e)}")


@router.post("/forecast/regenerate")
async def regenerate_forecast(
    forecast_period: str = Query("30d", description="Forecast period"),
    category_filter: Optional[str] = Query(None, description="Category filter"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Force regeneration of demand forecast
    
    - Always generates a new forecast regardless of existing cache
    - Useful for testing or when new data is available
    """
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        # Force regeneration
        forecast_data = await forecast_service.get_or_create_forecast(
            organization_id=organization_id,
            forecast_period=forecast_period,
            category_filter=category_filter,
            force_regenerate=True
        )
        
        if not forecast_data:
            raise HTTPException(status_code=500, detail="Failed to regenerate forecast")
        
        logger.info(f"Regenerated demand forecast for {len(forecast_data.get('forecasts', []))} items")
        
        return {
            "message": "Forecast regenerated successfully",
            "forecast": forecast_data
        }
        
    except Exception as e:
        logger.error(f"Error in forecast regeneration API: {e}")
        raise HTTPException(status_code=500, detail=f"Forecast regeneration failed: {str(e)}")


@router.get("/forecast/history")
async def get_forecast_history(
    days: int = Query(30, description="Number of days of history to retrieve"),
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Get forecast history for the organization
    
    - Returns list of past forecasts with metadata
    - Useful for tracking forecast accuracy over time
    """
    try:
        organization_id = current_user.get('organization_id')
        
        if not organization_id:
            raise HTTPException(status_code=400, detail="User organization not found")
        
        history = await forecast_service.get_forecast_history(
            organization_id=organization_id,
            days=days
        )
        
        return {
            "history": history,
            "total_forecasts": len(history)
        }
        
    except Exception as e:
        logger.error(f"Error getting forecast history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve forecast history: {str(e)}")


@router.post("/email/bid-request")
async def generate_bid_request_email(
    bid_request: Dict[str, Any],
    supplier: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Generate bid request email using AI"""
    try:
        email_content = await ai_service.generate_bid_request_email(bid_request, supplier)
        
        # Create audit log
        await auth_db.create_audit_log(
            user_id=current_user.get('id'),
            organization_id=current_user.get('organization_id'),
            action="generate_bid_email",
            resource_type="bid_request",
            resource_id=bid_request.get("id"),
            input_data={"bid_request": bid_request, "supplier": supplier},
            output_data={"email_content": email_content}
        )
        
        return {"email_content": email_content}
        
    except Exception as e:
        logger.error(f"Error generating bid request email: {e}")
        raise HTTPException(status_code=500, detail=f"Email generation failed: {str(e)}")


@router.post("/email/parse-response")
async def parse_supplier_response(
    email_content: str,
    bid_request_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """Parse supplier response email using AI"""
    try:
        parsed_response = await ai_service.parse_supplier_response(email_content, bid_request_id)
        
        # Create audit log
        await auth_db.create_audit_log(
            user_id=current_user.get('id'),
            organization_id=current_user.get('organization_id'),
            action="parse_supplier_response",
            resource_type="bid_request",
            resource_id=bid_request_id,
            input_data={"email_content": email_content},
            output_data={"parsed_response": parsed_response}
        )
        
        return parsed_response
        
    except Exception as e:
        logger.error(f"Error parsing supplier response: {e}")
        raise HTTPException(status_code=500, detail=f"Response parsing failed: {str(e)}") 
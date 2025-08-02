"""
Forecast Service for managing AI demand forecasting data
Handles storage, retrieval, and caching of forecast data
"""

import json
from datetime import datetime, date, timedelta
from typing import Dict, List, Any, Optional, Union
from loguru import logger
from app.database import db, auth_db
from app.services.ai_service import ai_service


class ForecastService:
    """Service for managing forecast data storage and retrieval"""
    
    def __init__(self):
        self.ai_service = ai_service
    
    async def get_or_create_forecast(
        self, 
        organization_id: str,
        forecast_period: str = "30d",
        category_filter: Optional[str] = None,
        force_regenerate: bool = False
    ) -> Dict[str, Any]:
        """Get cached forecast or generate new one"""
        try:
            if not force_regenerate:
                # Try to get existing forecast for today
                existing_forecast = await self._get_forecast_for_date(
                    organization_id, date.today(), forecast_period, category_filter
                )
                if existing_forecast:
                    logger.info(f"Using cached forecast for {date.today()}")
                    return existing_forecast
            
            # Generate new forecast
            logger.info(f"Generating new forecast for {date.today()}")
            return await self._generate_and_store_forecast(
                organization_id, forecast_period, category_filter
            )
            
        except Exception as e:
            logger.error(f"Error in get_or_create_forecast: {e}")
            return self._generate_fallback_forecast()
    
    def _generate_fallback_forecast(self) -> Dict[str, Any]:
        """Generate fallback forecast when AI is not available"""
        return {
            "forecasts": [
                {
                    "item_name": "Paracetamol 500mg",
                    "item_category": "Pain Relief",
                    "current_stock": 3200,
                    "predicted_demand": 3500,
                    "confidence_score": 75,
                    "risk_level": "medium",
                    "recommendation": "Order 300 additional units",
                    "trend": "increasing",
                    "difference": 300
                },
                {
                    "item_name": "Amoxicillin 250mg",
                    "item_category": "Antibiotics",
                    "current_stock": 1560,
                    "predicted_demand": 1800,
                    "confidence_score": 75,
                    "risk_level": "low",
                    "recommendation": "Stock levels adequate",
                    "trend": "stable",
                    "difference": 240
                }
            ],
            "insights": [
                {
                    "type": "Stock Alert",
                    "title": "Low Stock Warning",
                    "description": "1 item needs immediate attention",
                    "priority": "high",
                    "category": "inventory",
                    "action_required": True,
                    "action_description": "Review and reorder low stock items"
                }
            ],
            "chart_data": {
                "seasonal_pattern": [
                    {"month": "Jan", "demand": 60},
                    {"month": "Feb", "demand": 65},
                    {"month": "Mar", "demand": 68},
                    {"month": "Apr", "demand": 72},
                    {"month": "May", "demand": 75},
                    {"month": "Jun", "demand": 78},
                    {"month": "Jul", "demand": 80},
                    {"month": "Aug", "demand": 82},
                    {"month": "Sep", "demand": 85},
                    {"month": "Oct", "demand": 88},
                    {"month": "Nov", "demand": 90},
                    {"month": "Dec", "demand": 91}
                ]
            },
            "overall_accuracy": 75.0,
            "total_items_forecasted": 2,
            "source": "fallback"
        }
    
    async def _get_forecast_for_date(
        self, 
        organization_id: str, 
        forecast_date: date,
        forecast_period: str,
        category_filter: Optional[str]
    ) -> Optional[Dict[str, Any]]:
        """Get forecast data for a specific date"""
        try:
            # Get forecast data
            forecast_query = """
                SELECT * FROM forecast_data 
                WHERE organization_id = %s 
                AND forecast_date = %s 
                AND forecast_period = %s 
                AND (category_filter = %s OR (category_filter IS NULL AND %s IS NULL))
                ORDER BY created_at DESC 
                LIMIT 1
            """
            
            forecast_result = db.client.table('forecast_data').select('*').eq('organization_id', organization_id).eq('forecast_date', forecast_date.isoformat()).eq('forecast_period', forecast_period).execute()
            
            if not forecast_result.data:
                return None
            
            forecast_id = forecast_result.data[0]['id']
            
            # Get forecast items
            items_result = db.client.table('forecast_items').select('*').eq('forecast_id', forecast_id).execute()
            
            # Get forecast insights
            insights_result = db.client.table('forecast_insights').select('*').eq('forecast_id', forecast_id).order('priority', desc=True).order('created_at', desc=False).execute()
            
            # Get chart data
            charts_result = db.client.table('forecast_charts').select('*').eq('forecast_id', forecast_id).execute()
            
            # Build response
            chart_data = {}
            for chart in charts_result.data:
                chart_data[chart['chart_type']] = json.loads(chart['chart_data'])
            
            return {
                "forecasts": items_result.data,
                "insights": insights_result.data,
                "chart_data": chart_data,
                "overall_accuracy": float(forecast_result.data[0]['overall_accuracy'] or 0),
                "total_items_forecasted": forecast_result.data[0]['total_items_forecasted'],
                "source": "database"
            }
            
        except Exception as e:
            logger.error(f"Error getting forecast for date: {e}")
            return None
    
    async def _generate_and_store_forecast(
        self, 
        organization_id: str,
        forecast_period: str,
        category_filter: Optional[str]
    ) -> Dict[str, Any]:
        """Generate new forecast using AI and store it"""
        try:
            # Get inventory data - using synchronous Supabase methods
            inventory_result = db.client.table('inventory_items').select('*').eq('organization_id', organization_id).order('quantity', desc=False).limit(50).execute()
            
            if not inventory_result.data:
                logger.warning("No inventory data found for forecasting")
                return self._generate_fallback_forecast()
            
            # Generate AI forecast
            ai_forecast = await self.ai_service.generate_demand_forecast(
                inventory_result.data, forecast_period, category_filter
            )
            
            if not ai_forecast:
                logger.warning("AI forecast generation failed, using fallback")
                return self._generate_fallback_forecast()
            
            # Store forecast data
            forecast_id = await self._store_forecast_data(
                organization_id, forecast_period, category_filter, ai_forecast
            )
            
            # Store forecast items
            await self._store_forecast_items(forecast_id, ai_forecast.get('forecasts', []))
            
            # Store forecast insights
            await self._store_forecast_insights(forecast_id, ai_forecast.get('insights', []))
            
            # Store chart data
            await self._store_forecast_charts(forecast_id, ai_forecast.get('chart_data', {}))
            
            # Return complete forecast
            return await self._get_forecast_for_date(
                organization_id, date.today(), forecast_period, category_filter
            )
            
        except Exception as e:
            logger.error(f"Error generating and storing forecast: {e}")
            return self._generate_fallback_forecast()
    
    async def _store_forecast_data(
        self, 
        organization_id: str,
        forecast_period: str,
        category_filter: Optional[str],
        ai_forecast: Dict[str, Any]
    ) -> str:
        """Store main forecast data"""
        try:
            result = db.client.table('forecast_data').insert({
                'organization_id': organization_id,
                'forecast_date': date.today().isoformat(),
                'forecast_period': forecast_period,
                'category_filter': category_filter,
                'overall_accuracy': ai_forecast.get('overall_accuracy', 0),
                'total_items_forecasted': len(ai_forecast.get('forecasts', [])),
                'ai_model_version': ai_forecast.get('ai_model_version', 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8')
            }).execute()
            
            return result.data[0]['id']
            
        except Exception as e:
            logger.error(f"Error storing forecast data: {e}")
            raise
    
    async def _store_forecast_items(self, forecast_id: str, forecasts: List[Dict[str, Any]]):
        """Store forecast items"""
        try:
            for forecast in forecasts:
                db.client.table('forecast_items').insert({
                    'forecast_id': forecast_id,
                    'item_name': forecast.get('item_name', ''),
                    'item_category': forecast.get('item_category', ''),
                    'current_stock': forecast.get('current_stock', 0),
                    'predicted_demand': forecast.get('predicted_demand', 0),
                    'confidence_score': forecast.get('confidence_score', 0),
                    'risk_level': forecast.get('risk_level', 'low'),
                    'recommendation': forecast.get('recommendation', ''),
                    'trend': forecast.get('trend', 'stable'),
                    'difference': forecast.get('difference', 0)
                }).execute()
                
        except Exception as e:
            logger.error(f"Error storing forecast items: {e}")
            raise
    
    async def _store_forecast_insights(self, forecast_id: str, insights: List[Dict[str, Any]]):
        """Store forecast insights"""
        try:
            for insight in insights:
                db.client.table('forecast_insights').insert({
                    'forecast_id': forecast_id,
                    'insight_type': insight.get('type', ''),
                    'title': insight.get('title', ''),
                    'description': insight.get('description', ''),
                    'priority': insight.get('priority', 'medium'),
                    'category': insight.get('category', ''),
                    'action_required': insight.get('action_required', False),
                    'action_description': insight.get('action_description', '')
                }).execute()
                
        except Exception as e:
            logger.error(f"Error storing forecast insights: {e}")
            raise
    
    async def _store_forecast_charts(self, forecast_id: str, chart_data: Dict[str, Any]):
        """Store chart data"""
        try:
            for chart_type, data in chart_data.items():
                db.client.table('forecast_charts').insert({
                    'forecast_id': forecast_id,
                    'chart_type': chart_type,
                    'chart_data': json.dumps(data)
                }).execute()
                
        except Exception as e:
            logger.error(f"Error storing forecast charts: {e}")
            raise

    async def get_forecast_history(
        self, 
        organization_id: str,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """Get forecast history for the last N days"""
        try:
            start_date = date.today() - timedelta(days=days)
            
            result = db.client.table('forecast_data').select('*').eq('organization_id', organization_id).gte('forecast_date', start_date.isoformat()).order('forecast_date', desc=True).execute()
            
            return [
                {
                    "id": row['id'],
                    "forecast_date": row['forecast_date'],
                    "forecast_period": row['forecast_period'],
                    "overall_accuracy": float(row['overall_accuracy'] or 0),
                    "total_items_forecasted": row['total_items_forecasted'],
                    "created_at": row['created_at']
                }
                for row in result.data
            ]
            
        except Exception as e:
            logger.error(f"Error getting forecast history: {e}")
            return []


# Global instance
forecast_service = ForecastService() 
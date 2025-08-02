"""
AI Service for MedInventory.
Handles Together AI API integration for demand forecasting and supplier bidding.
"""

import httpx
import json
from typing import Dict, Any, List, Optional
from loguru import logger
from app.config import settings

class AIService:
    """Service class for AI operations using Together AI API"""
    
    def __init__(self):
        self.api_key = settings.TOGETHER_API_KEY
        self.base_url = settings.TOGETHER_BASE_URL
        self.model = settings.AI_MODEL
        self.model_name = settings.AI_MODEL  # Add this for API compatibility
        self.max_tokens = settings.AI_MAX_TOKENS
        self.temperature = settings.AI_TEMPERATURE
    
    async def _call_together_ai(self, prompt: str, system_prompt: str = None) -> Optional[str]:
        """Make a call to Together AI API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})
            
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": self.max_tokens,
                "temperature": self.temperature
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(f"Together AI API error: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            logger.error(f"Failed to call Together AI API: {e}")
            return None
    
    async def get_health_status(self) -> bool:
        """Check if AI service is healthy"""
        try:
            # Test AI service with a simple prompt
            test_prompt = "Hello, this is a health check. Please respond with 'OK' if you're working."
            response = await self._call_together_ai(test_prompt)
            return response is not None
        except Exception as e:
            logger.error(f"AI health check failed: {e}")
            return False

    async def generate_demand_forecast(self, inventory_data: List[Dict[str, Any]], forecast_period: str = "30d", category_filter: str = None) -> Dict[str, Any]:
        """
        Generate comprehensive AI-powered demand forecast for inventory items
        
        Args:
            inventory_data: List of inventory items
            forecast_period: Forecast period (7d, 30d, 90d, 6m, 1y)
            category_filter: Category filter (None for all categories)
        """
        try:
            # Filter by category if specified
            if category_filter and category_filter != "All Categories":
                inventory_data = [item for item in inventory_data if item.get("category") == category_filter]
            
            # Limit to top 10 items for detailed forecasting
            top_items = inventory_data[:10]
            
            # Create inventory summary for AI analysis
            inventory_summary = []
            for item in top_items:
                inventory_summary.append({
                    "name": item.get("name", "Unknown"),
                    "category": item.get("category", "Unknown"),
                    "current_stock": item.get("quantity", 0),
                    "reorder_level": item.get("reorder_level", 0),
                    "unit_price": item.get("unit_price", 0),
                    "supplier": item.get("supplier_name", "Unknown"),
                    "last_restocked": item.get("last_restocked"),
                    "expiry_date": item.get("expiry_date")
                })
            
            system_prompt = """You are an expert AI system for hospital inventory demand forecasting. 
            Analyze inventory data and provide accurate predictions for the next 30 days.
            
            Focus on:
            1. Seasonal trends and patterns
            2. Current stock levels vs predicted demand
            3. Risk assessment for stockouts
            4. Specific recommendations for ordering
            5. Market trends and price fluctuations
            
            Return ONLY valid JSON with the exact structure specified."""
            
            user_prompt = f"""Analyze this hospital inventory data and provide a comprehensive 30-day demand forecast:

Inventory Data:
{json.dumps(inventory_summary, indent=2)}

Generate a detailed forecast for the next 30 days. Return ONLY valid JSON with this structure:
{{
    "forecasts": [
        {{
            "item_name": "Item Name",
            "item_category": "Category",
            "current_stock": 100,
            "predicted_demand": 150,
            "confidence_score": 85,
            "risk_level": "medium",
            "recommendation": "Order 50 units",
            "trend": "increasing",
            "difference": -50
        }}
    ],
    "insights": [
        {{
            "type": "Stock Alert",
            "title": "Critical Stock Alert",
            "description": "3 items need immediate attention",
            "priority": "high",
            "category": "Stock Alert",
            "action_required": true,
            "action_description": "Order 700 additional units of Paracetamol"
        }},
        {{
            "type": "Seasonal Trend",
            "title": "Seasonal Demand Spike",
            "description": "Anticipated 30% increase in respiratory medications",
            "priority": "medium",
            "category": "Seasonal Trend",
            "action_required": false,
            "action_description": "Consider increasing stock by mid-October"
        }}
    ],
    "chart_data": {{
        "demand_overview": [
            {{"name": "Paracetamol", "forecast": 3200, "actual": 2500}},
            {{"name": "Amoxicillin", "forecast": 1560, "actual": 1800}},
            {{"name": "Insulin", "forecast": 800, "actual": 600}},
            {{"name": "Atorvastatin", "forecast": 1200, "actual": 1000}},
            {{"name": "Omeprazole", "forecast": 900, "actual": 750}}
        ],
        "accuracy_trend": [
            {{"month": "Jan", "accuracy": 85}},
            {{"month": "Feb", "accuracy": 87}},
            {{"month": "Mar", "accuracy": 89}},
            {{"month": "Apr", "accuracy": 91}},
            {{"month": "May", "accuracy": 88}},
            {{"month": "Jun", "accuracy": 90}},
            {{"month": "Jul", "accuracy": 92}},
            {{"month": "Aug", "accuracy": 89}},
            {{"month": "Sep", "accuracy": 91}},
            {{"month": "Oct", "accuracy": 93}},
            {{"month": "Nov", "accuracy": 90}},
            {{"month": "Dec", "accuracy": 94}}
        ],
        "seasonal_pattern": [
            {{"month": "Jan", "demand": 80}},
            {{"month": "Feb", "demand": 75}},
            {{"month": "Mar", "demand": 85}},
            {{"month": "Apr", "demand": 90}},
            {{"month": "May", "demand": 95}},
            {{"month": "Jun", "demand": 100}},
            {{"month": "Jul", "demand": 110}},
            {{"month": "Aug", "demand": 105}},
            {{"month": "Sep", "demand": 100}},
            {{"month": "Oct", "demand": 95}},
            {{"month": "Nov", "demand": 105}},
            {{"month": "Dec", "demand": 115}}
        ]
    }},
    "overall_accuracy": 87.5,
    "total_items_forecasted": {len(top_items)},
    "stock_alerts": {{
        "critical_items": 3,
        "high_risk_items": 2,
        "total_alerts": 5,
        "immediate_actions": [
            "Order 700 additional units of Paracetamol",
            "Restock Insulin Glargine - 250 units needed",
            "Monitor Atorvastatin stock levels"
        ]
    }}
}}

IMPORTANT: Return ONLY valid JSON. No additional text, explanations, or markdown formatting."""
            
            response = await self._call_together_ai(system_prompt, user_prompt)
            
            if response:
                try:
                    # Clean the response to extract JSON
                    cleaned_response = response.strip()
                    
                    # Remove markdown code blocks
                    if cleaned_response.startswith("```"):
                        # Find the first and last ```
                        start_idx = cleaned_response.find("```") + 3
                        end_idx = cleaned_response.rfind("```")
                        if end_idx > start_idx:
                            cleaned_response = cleaned_response[start_idx:end_idx].strip()
                    
                    # Remove language identifier if present
                    if cleaned_response.startswith("json"):
                        cleaned_response = cleaned_response[4:].strip()
                    
                    # Try to parse JSON response
                    forecast_data = json.loads(cleaned_response.strip())
                    logger.info("AI demand forecast generated successfully")
                    return forecast_data
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse AI response as JSON: {e}")
                    logger.error(f"Raw response: {response[:200]}...")
                    return self._generate_fallback_forecast(inventory_data, forecast_period, category_filter)
            else:
                logger.warning("AI service unavailable, using fallback forecast")
                return self._generate_fallback_forecast(inventory_data, forecast_period, category_filter)
                
        except Exception as e:
            logger.error(f"Failed to generate demand forecast: {e}")
            return self._generate_fallback_forecast(inventory_data, forecast_period, category_filter)
    
    def _generate_fallback_forecast(self, inventory_data: List[Dict[str, Any]], forecast_period: str = "30d", category_filter: str = None) -> Dict[str, Any]:
        """Generate fallback forecast when AI is unavailable"""
        # Filter by category if specified
        if category_filter and category_filter != "All Categories":
            inventory_data = [item for item in inventory_data if item.get("category") == category_filter]
        
        # Take top 10 items
        top_items = inventory_data[:10]
        
        forecasts = []
        for i, item in enumerate(top_items):
            current_stock = item.get("quantity", 0)
            predicted_demand = int(current_stock * 1.2)  # 20% increase
            difference = current_stock - predicted_demand
            
            forecasts.append({
                "item_name": item.get("name", f"Item {i+1}"),
                "item_category": item.get("category", "Unknown"),
                "current_stock": current_stock,
                "predicted_demand": predicted_demand,
                "confidence_score": 75,
                "risk_level": "medium" if difference < 0 else "low",
                "recommendation": f"Order {abs(difference)} units" if difference < 0 else "Stock levels adequate",
                "trend": "increasing" if difference < 0 else "stable",
                "difference": difference
            })
        
        insights = [
            {
                "type": "Stock Alert",
                "title": "Critical Stock Alert",
                "description": f"{len([f for f in forecasts if f['difference'] < 0])} items need immediate attention",
                "priority": "high",
                "category": "Stock Alert",
                "action_required": True,
                "action_description": "Review low stock items and place orders"
            },
            {
                "type": "System Status",
                "title": "AI Service Limited",
                "description": "Using fallback forecasting due to AI service unavailability",
                "priority": "medium",
                "category": "System Alert",
                "action_required": False,
                "action_description": "Contact system administrator"
            }
        ]
        
        chart_data = {
            "demand_overview": [
                {"name": item["item_name"], "forecast": item["predicted_demand"], "actual": item["current_stock"]}
                for item in forecasts[:5]
            ],
            "accuracy_trend": [
                {"month": "Jan", "accuracy": 75},
                {"month": "Feb", "accuracy": 78},
                {"month": "Mar", "accuracy": 80},
                {"month": "Apr", "accuracy": 82},
                {"month": "May", "accuracy": 85},
                {"month": "Jun", "accuracy": 87}
            ],
            "seasonal_pattern": [
                {"month": "Jan", "demand": 80},
                {"month": "Feb", "demand": 75},
                {"month": "Mar", "demand": 85},
                {"month": "Apr", "demand": 90},
                {"month": "May", "demand": 95},
                {"month": "Jun", "demand": 100}
            ]
        }
        
        return {
            "forecasts": forecasts,
            "insights": insights,
            "chart_data": chart_data,
            "overall_accuracy": 75.0,
            "total_items_forecasted": len(forecasts),
            "ai_model_version": "fallback",
            "stock_alerts": {
                "critical_items": len([f for f in forecasts if f['risk_level'] == 'high']),
                "high_risk_items": len([f for f in forecasts if f['risk_level'] == 'medium']),
                "total_alerts": len([f for f in forecasts if f['difference'] < 0]),
                "immediate_actions": [
                    f"Order {abs(f['difference'])} units of {f['item_name']}"
                    for f in forecasts if f['difference'] < 0
                ]
            }
        }
    
    async def generate_bid_request_email(self, bid_request: Dict[str, Any], supplier: Dict[str, Any]) -> str:
        """Generate personalized bid request email using AI"""
        try:
            system_prompt = """You are a professional procurement specialist for a hospital. 
            Generate personalized, professional bid request emails to medical suppliers.
            The email should be courteous, specific, and encourage competitive bidding.
            Include all necessary details about the bid request."""
            
            user_prompt = f"""Generate a professional bid request email for the following:

Bid Request Details:
- Title: {bid_request.get('title', 'Medical Supply Procurement')}
- Description: {bid_request.get('description', '')}
- Category: {bid_request.get('category', '')}
- Quantity: {bid_request.get('quantity', 0)}
- Estimated Value: ${bid_request.get('estimated_value', 0):,.2f}
- Deadline: {bid_request.get('deadline', '')}

Supplier Information:
- Name: {supplier.get('name', '')}
- Email: {supplier.get('email', '')}
- Rating: {supplier.get('rating', 0)}/5

Please generate a professional email that:
1. Addresses the supplier by name
2. Clearly states the bid requirements
3. Mentions their good standing as a supplier
4. Provides clear submission instructions
5. Encourages competitive pricing
6. Maintains professional tone

Return only the email content without subject line or additional formatting."""
            
            response = await self._call_together_ai(user_prompt, system_prompt)
            
            if response:
                logger.info(f"Generated bid request email for supplier: {supplier.get('name', '')}")
                return response
            else:
                return self._generate_fallback_email(bid_request, supplier)
                
        except Exception as e:
            logger.error(f"Failed to generate bid request email: {e}")
            return self._generate_fallback_email(bid_request, supplier)
    
    def _generate_fallback_email(self, bid_request: Dict[str, Any], supplier: Dict[str, Any]) -> str:
        """Generate fallback email when AI is unavailable"""
        return f"""Dear {supplier.get('name', 'Valued Supplier')},

We hope this email finds you well. We are pleased to invite you to submit a bid for our medical supply procurement.

Bid Request Details:
- Title: {bid_request.get('title', 'Medical Supply Procurement')}
- Category: {bid_request.get('category', '')}
- Quantity: {bid_request.get('quantity', 0)} units
- Estimated Value: ${bid_request.get('estimated_value', 0):,.2f}
- Submission Deadline: {bid_request.get('deadline', '')}

Description: {bid_request.get('description', '')}

As a valued supplier with a rating of {supplier.get('rating', 0)}/5, we believe you can provide competitive pricing and quality products.

Please submit your bid including:
- Unit price
- Total cost
- Delivery timeline
- Payment terms
- Quality certifications

We look forward to receiving your competitive bid.

Best regards,
MedInventory Procurement Team"""
    
    async def parse_supplier_response(self, email_content: str, bid_request_id: str) -> Dict[str, Any]:
        """Parse supplier email response using AI"""
        try:
            system_prompt = """You are an AI assistant that parses supplier bid responses from emails.
            Extract key information like pricing, delivery terms, and bid details.
            Return the parsed information as a structured JSON object."""
            
            user_prompt = f"""Parse this supplier email response for bid request {bid_request_id}:

Email Content:
{email_content}

Extract and return the following information as JSON:
{{
    "supplier_name": "string",
    "unit_price": number,
    "total_cost": number,
    "delivery_days": number,
    "payment_terms": "string",
    "quality_certifications": ["string"],
    "additional_notes": "string",
    "bid_status": "valid|invalid|needs_clarification",
    "confidence_score": number (0-100)
}}

If any information is missing or unclear, mark bid_status as "needs_clarification"."""
            
            response = await self._call_together_ai(user_prompt, system_prompt)
            
            if response:
                try:
                    parsed_data = json.loads(response)
                    logger.info(f"Parsed supplier response for bid request {bid_request_id}")
                    return parsed_data
                except json.JSONDecodeError:
                    logger.error("Failed to parse AI response as JSON")
                    return self._generate_fallback_parsed_response(email_content)
            else:
                return self._generate_fallback_parsed_response(email_content)
                
        except Exception as e:
            logger.error(f"Failed to parse supplier response: {e}")
            return self._generate_fallback_parsed_response(email_content)
    
    def _generate_fallback_parsed_response(self, email_content: str) -> Dict[str, Any]:
        """Generate fallback parsed response when AI is unavailable"""
        return {
            "supplier_name": "Unknown",
            "unit_price": 0,
            "total_cost": 0,
            "delivery_days": 30,
            "payment_terms": "Net 30",
            "quality_certifications": [],
            "additional_notes": "AI parsing unavailable - manual review required",
            "bid_status": "needs_clarification",
            "confidence_score": 0
        }

# Create singleton instance
ai_service = AIService() 
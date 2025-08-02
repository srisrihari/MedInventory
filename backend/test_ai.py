#!/usr/bin/env python3
"""
Test script for AI integration
"""

import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.ai_service import ai_service

async def test_ai_service():
    """Test the AI service"""
    print("🧪 Testing AI Service Integration...")
    print("=" * 50)
    
    # Test 1: Simple health check
    print("1. Testing AI Health Check...")
    try:
        test_prompt = "Hello, this is a health check. Please respond with 'OK' if you're working."
        response = await ai_service._call_openrouter(test_prompt)
        if response:
            print(f"✅ AI Service Working: {response[:100]}...")
        else:
            print("❌ AI Service Not Responding")
    except Exception as e:
        print(f"❌ AI Service Error: {e}")
    
    # Test 2: Demand forecasting
    print("\n2. Testing Demand Forecasting...")
    try:
        # Mock inventory data
        inventory_data = [
            {
                "name": "Paracetamol 500mg",
                "category": "Pain Relief",
                "quantity": 2500,
                "reorder_level": 500,
                "price": 0.50
            },
            {
                "name": "Amoxicillin 250mg",
                "category": "Antibiotics",
                "quantity": 1800,
                "reorder_level": 300,
                "price": 1.20
            }
        ]
        
        forecast = await ai_service.generate_demand_forecast(inventory_data)
        print(f"✅ Forecast Generated: {len(forecast.get('forecasts', []))} items")
        print(f"   Overall Accuracy: {forecast.get('overall_accuracy', 0)}%")
        print(f"   Source: {forecast.get('source', 'unknown')}")
        
    except Exception as e:
        print(f"❌ Forecast Error: {e}")
    
    # Test 3: Bid request email generation
    print("\n3. Testing Bid Request Email Generation...")
    try:
        bid_request = {
            "title": "Medical Supply Procurement",
            "description": "Need 1000 units of surgical masks",
            "category": "PPE",
            "quantity": 1000,
            "estimated_value": 5000.00,
            "deadline": "2024-02-15"
        }
        
        supplier = {
            "name": "MedSupply Co",
            "email": "procurement@medsupply.com",
            "rating": 4.5
        }
        
        email = await ai_service.generate_bid_request_email(bid_request, supplier)
        print(f"✅ Email Generated: {len(email)} characters")
        print(f"   Preview: {email[:100]}...")
        
    except Exception as e:
        print(f"❌ Email Generation Error: {e}")
    
    print("\n" + "=" * 50)
    print("🎉 AI Service Testing Complete!")

if __name__ == "__main__":
    asyncio.run(test_ai_service()) 
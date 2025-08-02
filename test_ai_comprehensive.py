#!/usr/bin/env python3
"""
Comprehensive AI Testing Script for MedInventory
Tests all AI algorithms, accuracy, and integration
"""

import asyncio
import sys
import os
import json
import requests
from datetime import datetime

# Add the backend app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend', 'app'))

def test_ai_health():
    """Test AI health endpoint"""
    print("🧪 1. Testing AI Health Check...")
    try:
        response = requests.get("http://localhost:8000/api/ai/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {data['status']}")
            print(f"   ✅ Model: {data['model']}")
            print(f"   ✅ Message: {data['message']}")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_authentication():
    """Test authentication and get token"""
    print("\n🔐 2. Testing Authentication...")
    try:
        response = requests.post(
            "http://localhost:8000/api/auth/login",
            json={
                "email": "demo-admin@hospital.com",
                "password": "admin123"
            },
            timeout=10
        )
        if response.status_code == 200:
            data = response.json()
            token = data['tokens']['access_token']
            print(f"   ✅ Login successful: {data['user']['email']}")
            print(f"   ✅ Role: {data['user']['role']}")
            return token
        else:
            print(f"   ❌ Login failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def test_demand_forecast(token):
    """Test AI demand forecasting"""
    print("\n📊 3. Testing AI Demand Forecasting...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            "http://localhost:8000/api/ai/forecast/demand",
            headers=headers,
            timeout=30
        )
        if response.status_code == 200:
            data = response.json()
            forecasts = data['data']['forecasts']
            insights = data['data']['insights']
            accuracy = data['data']['overall_accuracy']
            
            print(f"   ✅ Success: {data['success']}")
            print(f"   ✅ Forecasts: {len(forecasts)} items")
            print(f"   ✅ Accuracy: {accuracy}%")
            print(f"   ✅ Insights: {len(insights)} insights")
            
            # Test forecast quality
            high_risk_items = [f for f in forecasts if f['risk_level'] == 'high']
            avg_confidence = sum(f['confidence_score'] for f in forecasts) / len(forecasts)
            
            print(f"   ✅ High Risk Items: {len(high_risk_items)}")
            print(f"   ✅ Average Confidence: {avg_confidence:.1f}%")
            
            # Show sample forecast
            if forecasts:
                sample = forecasts[0]
                print(f"   📋 Sample Forecast:")
                print(f"      Item: {sample['item_name']}")
                print(f"      Predicted Demand: {sample['predicted_demand']} units")
                print(f"      Risk Level: {sample['risk_level']}")
                print(f"      Recommendation: {sample['recommendation']}")
            
            return True
        else:
            print(f"   ❌ Failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_bid_email_generation(token):
    """Test AI bid email generation"""
    print("\n📧 4. Testing AI Bid Email Generation...")
    try:
        # Get bid request and supplier data
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get bid requests
        bid_response = requests.get(
            "http://localhost:8000/api/bidding/requests",
            headers=headers,
            timeout=10
        )
        if bid_response.status_code != 200:
            print(f"   ❌ Failed to get bid requests: {bid_response.status_code}")
            return False
        
        bid_data = bid_response.json()
        bid_id = bid_data['requests'][0]['id']
        
        # Get suppliers
        supplier_response = requests.get(
            "http://localhost:8000/api/bidding/suppliers",
            headers=headers,
            timeout=10
        )
        if supplier_response.status_code != 200:
            print(f"   ❌ Failed to get suppliers: {supplier_response.status_code}")
            return False
        
        supplier_data = supplier_response.json()
        supplier_id = supplier_data['suppliers'][0]['id']
        
        print(f"   ✅ Bid Request ID: {bid_id}")
        print(f"   ✅ Supplier ID: {supplier_id}")
        
        # Generate email
        email_response = requests.post(
            "http://localhost:8000/api/ai/bidding/generate-email",
            headers=headers,
            json={
                "bid_request_id": bid_id,
                "supplier_id": supplier_id
            },
            timeout=30
        )
        
        if email_response.status_code == 200:
            data = email_response.json()
            email_content = data['data']['email_content']
            
            print(f"   ✅ Success: {data['success']}")
            print(f"   ✅ Email Length: {len(email_content)} characters")
            print(f"   📧 Email Preview: {email_content[:100]}...")
            
            return True
        else:
            print(f"   ❌ Failed: {email_response.status_code}")
            print(f"   Response: {email_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_supplier_response_parsing(token):
    """Test AI supplier response parsing"""
    print("\n🔍 5. Testing AI Supplier Response Parsing...")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get a bid request ID
        bid_response = requests.get(
            "http://localhost:8000/api/bidding/requests",
            headers=headers,
            timeout=10
        )
        bid_id = bid_response.json()['requests'][0]['id']
        
        # Test email content
        test_email = """
        Dear Procurement Team,
        
        Thank you for your bid request. We are pleased to submit our proposal:
        
        Unit Price: $2.50 per unit
        Total Cost: $2,500 for 1000 units
        Delivery Time: 7-10 business days
        Payment Terms: Net 30 days
        Quality Certifications: ISO 13485, FDA approved
        
        We guarantee on-time delivery and competitive pricing.
        
        Best regards,
        BioSupply International
        """
        
        parse_response = requests.post(
            "http://localhost:8000/api/ai/bidding/parse-response",
            headers=headers,
            json={
                "email_content": test_email,
                "bid_request_id": bid_id
            },
            timeout=30
        )
        
        if parse_response.status_code == 200:
            data = parse_response.json()
            parsed_data = data['data']
            
            print(f"   ✅ Success: {data['success']}")
            print(f"   ✅ Unit Price: ${parsed_data['unit_price']}")
            print(f"   ✅ Total Cost: ${parsed_data['total_cost']}")
            print(f"   ✅ Delivery Days: {parsed_data['delivery_days']}")
            print(f"   ✅ Payment Terms: {parsed_data['payment_terms']}")
            print(f"   ✅ Bid Status: {parsed_data['bid_status']}")
            print(f"   ✅ Confidence: {parsed_data['confidence_score']}%")
            
            return True
        else:
            print(f"   ❌ Failed: {parse_response.status_code}")
            print(f"   Response: {parse_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_frontend_integration():
    """Test frontend AI integration"""
    print("\n🖥️  6. Testing Frontend AI Integration...")
    try:
        # Test if frontend is running
        response = requests.get("http://localhost:8080", timeout=5)
        if response.status_code == 200:
            print("   ✅ Frontend is running")
            
            # Test dashboard
            dashboard_response = requests.get("http://localhost:8080/dashboard", timeout=5)
            if dashboard_response.status_code == 200:
                print("   ✅ Dashboard is accessible")
                return True
            else:
                print(f"   ⚠️  Dashboard status: {dashboard_response.status_code}")
                return False
        else:
            print(f"   ❌ Frontend not accessible: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Frontend error: {e}")
        return False

def main():
    """Run comprehensive AI tests"""
    print("🚀 COMPREHENSIVE AI TESTING STARTING...")
    print("=" * 60)
    print(f"📅 Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    results = {}
    
    # Test 1: AI Health
    results['ai_health'] = test_ai_health()
    
    # Test 2: Authentication
    token = test_authentication()
    results['authentication'] = token is not None
    
    if token:
        # Test 3: Demand Forecasting
        results['demand_forecast'] = test_demand_forecast(token)
        
        # Test 4: Bid Email Generation
        results['bid_email'] = test_bid_email_generation(token)
        
        # Test 5: Supplier Response Parsing
        results['response_parsing'] = test_supplier_response_parsing(token)
    else:
        results['demand_forecast'] = False
        results['bid_email'] = False
        results['response_parsing'] = False
    
    # Test 6: Frontend Integration
    results['frontend'] = test_frontend_integration()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print(f"\n🎯 Overall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 ALL TESTS PASSED! AI integration is working perfectly!")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
    
    print("\n🚀 AI Integration Status:")
    if results.get('ai_health'):
        print("   ✅ AI Service: Operational")
    if results.get('demand_forecast'):
        print("   ✅ Demand Forecasting: Working")
    if results.get('bid_email'):
        print("   ✅ Email Generation: Working")
    if results.get('response_parsing'):
        print("   ✅ Response Parsing: Working")
    if results.get('frontend'):
        print("   ✅ Frontend Integration: Working")
    
    return passed_tests == total_tests

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 
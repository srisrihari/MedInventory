#!/usr/bin/env python3
"""
Load Synthetic Data into MedInventory Backend
This script loads the generated synthetic data via API calls
"""

import json
import requests
import time
import sys
from typing import Dict, List

class TestDataLoader:
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.session = requests.Session()
        
    def check_server_health(self) -> bool:
        """Check if the backend server is running"""
        try:
            response = self.session.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                print("✅ Backend server is healthy and ready")
                return True
            else:
                print(f"❌ Backend server responded with status: {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ Cannot connect to backend server: {e}")
            print("💡 Make sure to start the server with: python3 start_server.py")
            return False
    
    def load_inventory_items(self, items: List[Dict]) -> int:
        """Load inventory items via API"""
        print(f"📦 Loading {len(items)} inventory items...")
        
        loaded_count = 0
        for i, item in enumerate(items, 1):
            try:
                # Prepare item data for API
                api_item = {
                    "name": item["name"],
                    "category": item["category"],
                    "quantity": item["quantity"],
                    "unit": item["unit"],
                    "batch_number": item["batch_number"],
                    "batch_id": item["batch_id"],
                    "expiry_date": item["expiry_date"],
                    "price": round(item["price"], 2),
                    "location": item["location"],
                    "reorder_level": item["reorder_level"]
                }
                
                response = self.session.post(
                    f"{self.base_url}/api/inventory/items",
                    json=api_item,
                    timeout=10
                )
                
                if response.status_code in [200, 201]:
                    loaded_count += 1
                    if i % 10 == 0:
                        print(f"   • Loaded {i}/{len(items)} items...")
                else:
                    print(f"   ⚠️  Failed to load item '{item['name']}': {response.status_code}")
                    if response.text:
                        print(f"      Error: {response.text}")
                        
            except Exception as e:
                print(f"   ❌ Error loading item '{item['name']}': {e}")
        
        print(f"✅ Successfully loaded {loaded_count}/{len(items)} inventory items")
        return loaded_count
    
    def test_inventory_operations(self) -> bool:
        """Test add/subtract inventory operations"""
        print("🧪 Testing inventory add/subtract operations...")
        
        try:
            # Get first inventory item
            response = self.session.get(f"{self.base_url}/api/inventory/items?limit=1")
            if response.status_code != 200:
                print("❌ Could not fetch inventory items for testing")
                return False
            
            items = response.json()
            if not items.get("items"):
                print("❌ No inventory items found for testing")
                return False
            
            item_id = items["items"][0]["id"]
            item_name = items["items"][0]["name"]
            original_quantity = items["items"][0]["quantity"]
            
            print(f"   Testing with item: {item_name} (ID: {item_id})")
            print(f"   Original quantity: {original_quantity}")
            
            # Test adding stock
            add_response = self.session.post(
                f"{self.base_url}/api/inventory/items/{item_id}/add-stock",
                params={"quantity": 100, "reference_type": "purchase", "notes": "Test addition"}
            )
            
            if add_response.status_code == 200:
                new_quantity = add_response.json()["quantity"]
                print(f"   ✅ Add stock test: {original_quantity} → {new_quantity} (+100)")
            else:
                print(f"   ❌ Add stock test failed: {add_response.status_code}")
                return False
            
            # Test subtracting stock
            subtract_response = self.session.post(
                f"{self.base_url}/api/inventory/items/{item_id}/subtract-stock",
                params={"quantity": 50, "reference_type": "usage", "notes": "Test subtraction"}
            )
            
            if subtract_response.status_code == 200:
                final_quantity = subtract_response.json()["quantity"]
                print(f"   ✅ Subtract stock test: {new_quantity} → {final_quantity} (-50)")
            else:
                print(f"   ❌ Subtract stock test failed: {subtract_response.status_code}")
                return False
            
            return True
            
        except Exception as e:
            print(f"❌ Error during inventory operations test: {e}")
            return False
    
    def create_sample_bid_request(self) -> bool:
        """Create a sample bid request"""
        print("📋 Creating sample bid request...")
        
        try:
            bid_request = {
                "title": "Emergency Medical Supplies - Urgent Procurement",
                "description": "Urgent procurement needed for emergency medical supplies. Please provide competitive quotes with fast delivery.",
                "category": "Emergency Medicine",
                "items": [
                    {
                        "name": "Epinephrine Auto-Injector",
                        "category": "Emergency Medicine",
                        "quantity": 50,
                        "unit": "Injectors",
                        "specifications": "FDA approved, 0.3mg dose, adult version"
                    },
                    {
                        "name": "Atropine 1mg/ml",
                        "category": "Emergency Medicine", 
                        "quantity": 100,
                        "unit": "Vials",
                        "specifications": "Hospital grade, sterile injection"
                    }
                ],
                "quantity": 150,
                "estimated_value": 8500.00,
                "deadline": "2024-02-15"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/bidding/requests",
                json=bid_request
            )
            
            if response.status_code in [200, 201]:
                print("✅ Sample bid request created successfully")
                return True
            else:
                print(f"❌ Failed to create bid request: {response.status_code}")
                if response.text:
                    print(f"   Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error creating bid request: {e}")
            return False
    
    def test_api_endpoints(self) -> Dict[str, bool]:
        """Test various API endpoints"""
        print("🔍 Testing API endpoints...")
        
        results = {}
        
        # Test inventory endpoints
        endpoints_to_test = [
            ("GET", "/api/inventory/items", "Inventory Items List"),
            ("GET", "/health", "Health Check"),
            ("GET", "/api/bidding/requests", "Bid Requests List"),
            ("GET", "/api/equipment/", "Equipment List"),
            ("GET", "/api/analytics/dashboard", "Analytics Dashboard")
        ]
        
        for method, endpoint, description in endpoints_to_test:
            try:
                if method == "GET":
                    response = self.session.get(f"{self.base_url}{endpoint}")
                
                if response.status_code == 200:
                    print(f"   ✅ {description}: OK")
                    results[endpoint] = True
                else:
                    print(f"   ❌ {description}: {response.status_code}")
                    results[endpoint] = False
                    
            except Exception as e:
                print(f"   ❌ {description}: Error - {e}")
                results[endpoint] = False
        
        return results
    
    def generate_summary_report(self, loaded_items: int, test_results: Dict[str, bool]) -> None:
        """Generate a summary report"""
        print("\n" + "="*60)
        print("📊 SYNTHETIC DATA LOADING SUMMARY")
        print("="*60)
        
        print(f"📦 Inventory Items Loaded: {loaded_items}")
        print(f"🧪 Inventory Operations: {'✅ PASSED' if self.test_inventory_operations() else '❌ FAILED'}")
        print(f"📋 Bid Request Creation: {'✅ PASSED' if self.create_sample_bid_request() else '❌ FAILED'}")
        
        print("\n🔍 API Endpoint Tests:")
        for endpoint, status in test_results.items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {endpoint}")
        
        passed_tests = sum(test_results.values())
        total_tests = len(test_results)
        print(f"\n📈 Overall Success Rate: {passed_tests}/{total_tests} ({(passed_tests/total_tests)*100:.1f}%)")
        
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! Your backend is working perfectly!")
            print("🚀 Ready for frontend integration!")
        else:
            print("\n⚠️  Some tests failed. Check the logs above for details.")
    
    def load_all_data(self, data_file: str = "synthetic_data.json") -> None:
        """Load all synthetic data and run tests"""
        print("🚀 Starting synthetic data loading process...")
        print("-" * 60)
        
        # Check server health
        if not self.check_server_health():
            print("❌ Cannot proceed without a healthy backend server")
            sys.exit(1)
        
        # Load data file
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            print(f"✅ Loaded data file: {data_file}")
        except FileNotFoundError:
            print(f"❌ Data file not found: {data_file}")
            print("💡 Run 'python3 create_synthetic_data.py' first")
            sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"❌ Invalid JSON in data file: {e}")
            sys.exit(1)
        
        # Load inventory items
        loaded_items = self.load_inventory_items(data["inventory_items"])
        
        # Wait a moment for data to be processed
        time.sleep(2)
        
        # Run tests
        test_results = self.test_api_endpoints()
        
        # Generate summary
        self.generate_summary_report(loaded_items, test_results)

def main():
    """Main function"""
    print("🏥 MedInventory Synthetic Data Loader")
    print("=====================================")
    
    loader = TestDataLoader()
    loader.load_all_data()

if __name__ == "__main__":
    main()
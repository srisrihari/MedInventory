#!/usr/bin/env python3
"""
Script to add realistic sample inventory data to Supabase
Creates items with realistic expiry dates around current time
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
import random
from typing import List, Dict, Any

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import db
from app.config import settings

# Sample inventory data with realistic expiry dates
SAMPLE_INVENTORY_DATA = [
    # Recently expired items (within 1 month)
    {
        "name": "Amoxicillin 500mg Capsules",
        "category": "Antibiotics",
        "batch_number": "AMX-2024-001",
        "expiry_date": (datetime.now() - timedelta(days=5)).strftime('%Y-%m-%d'),
        "quantity": 240,
        "price": 2.50,
        "reorder_level": 50,
        "status": "out_of_stock"
    },
    {
        "name": "Ibuprofen 200mg Tablets",
        "category": "Pain Relief",
        "batch_number": "IBU-2024-002",
        "expiry_date": (datetime.now() - timedelta(days=12)).strftime('%Y-%m-%d'),
        "quantity": 180,
        "price": 1.20,
        "reorder_level": 100,
        "status": "out_of_stock"
    },
    {
        "name": "Ceftriaxone 1g Injection",
        "category": "Antibiotics",
        "batch_number": "CTX-2024-003",
        "expiry_date": (datetime.now() - timedelta(days=25)).strftime('%Y-%m-%d'),
        "quantity": 50,
        "price": 15.00,
        "reorder_level": 20,
        "status": "out_of_stock"
    },
    {
        "name": "Omeprazole 20mg Capsules",
        "category": "Gastrointestinal",
        "batch_number": "OMP-2024-004",
        "expiry_date": (datetime.now() - timedelta(days=8)).strftime('%Y-%m-%d'),
        "quantity": 120,
        "price": 3.80,
        "reorder_level": 60,
        "status": "out_of_stock"
    },
    {
        "name": "Diazepam 5mg Tablets",
        "category": "Psychiatric",
        "batch_number": "DZP-2024-005",
        "expiry_date": (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d'),
        "quantity": 45,
        "price": 4.20,
        "reorder_level": 25,
        "status": "out_of_stock"
    },
    
    # Items expiring soon (within 30 days)
    {
        "name": "Metformin 500mg Tablets",
        "category": "Diabetes",
        "batch_number": "MTF-2024-006",
        "expiry_date": (datetime.now() + timedelta(days=14)).strftime('%Y-%m-%d'),
        "quantity": 300,
        "price": 1.80,
        "reorder_level": 150,
        "status": "low_stock"
    },
    {
        "name": "Lipitor 40mg Tablets",
        "category": "Cardiovascular",
        "batch_number": "LPT-2024-007",
        "expiry_date": (datetime.now() + timedelta(days=9)).strftime('%Y-%m-%d'),
        "quantity": 90,
        "price": 8.50,
        "reorder_level": 50,
        "status": "low_stock"
    },
    {
        "name": "Albuterol Inhaler",
        "category": "Respiratory",
        "batch_number": "ALB-2024-008",
        "expiry_date": (datetime.now() + timedelta(days=4)).strftime('%Y-%m-%d'),
        "quantity": 40,
        "price": 12.00,
        "reorder_level": 20,
        "status": "low_stock"
    },
    {
        "name": "Cephalexin 250mg Capsules",
        "category": "Antibiotics",
        "batch_number": "CPX-2024-009",
        "expiry_date": (datetime.now() + timedelta(days=17)).strftime('%Y-%m-%d'),
        "quantity": 150,
        "price": 2.80,
        "reorder_level": 75,
        "status": "in_stock"
    },
    {
        "name": "Lorazepam 1mg Tablets",
        "category": "Psychiatric",
        "batch_number": "LRZ-2024-010",
        "expiry_date": (datetime.now() + timedelta(days=19)).strftime('%Y-%m-%d'),
        "quantity": 60,
        "price": 5.50,
        "reorder_level": 30,
        "status": "in_stock"
    },
    {
        "name": "Insulin Glargine",
        "category": "Diabetes",
        "batch_number": "INS-2024-011",
        "expiry_date": (datetime.now() + timedelta(days=2)).strftime('%Y-%m-%d'),
        "quantity": 80,
        "price": 25.00,
        "reorder_level": 40,
        "status": "low_stock"
    },
    {
        "name": "Atorvastatin 20mg Tablets",
        "category": "Cardiovascular",
        "batch_number": "ATV-2024-012",
        "expiry_date": (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d'),
        "quantity": 120,
        "price": 7.20,
        "reorder_level": 60,
        "status": "low_stock"
    },
    {
        "name": "Salbutamol Inhaler",
        "category": "Respiratory",
        "batch_number": "SLB-2024-013",
        "expiry_date": (datetime.now() + timedelta(days=11)).strftime('%Y-%m-%d'),
        "quantity": 60,
        "price": 11.50,
        "reorder_level": 30,
        "status": "in_stock"
    },
    {
        "name": "Ranitidine 150mg Tablets",
        "category": "Gastrointestinal",
        "batch_number": "RNT-2024-014",
        "expiry_date": (datetime.now() + timedelta(days=24)).strftime('%Y-%m-%d'),
        "quantity": 180,
        "price": 2.10,
        "reorder_level": 90,
        "status": "in_stock"
    },
    {
        "name": "Metronidazole 400mg Tablets",
        "category": "Antibiotics",
        "batch_number": "MTZ-2024-015",
        "expiry_date": (datetime.now() + timedelta(days=18)).strftime('%Y-%m-%d'),
        "quantity": 90,
        "price": 3.40,
        "reorder_level": 45,
        "status": "in_stock"
    },
    
    # Items with good expiry dates (30+ days)
    {
        "name": "Paracetamol 500mg Tablets",
        "category": "Pain Relief",
        "batch_number": "PCT-2024-016",
        "expiry_date": (datetime.now() + timedelta(days=42)).strftime('%Y-%m-%d'),
        "quantity": 500,
        "price": 0.80,
        "reorder_level": 250,
        "status": "in_stock"
    },
    {
        "name": "Azithromycin 250mg Tablets",
        "category": "Antibiotics",
        "batch_number": "AZM-2024-017",
        "expiry_date": (datetime.now() + timedelta(days=47)).strftime('%Y-%m-%d'),
        "quantity": 200,
        "price": 4.60,
        "reorder_level": 100,
        "status": "in_stock"
    },
    {
        "name": "Amlodipine 5mg Tablets",
        "category": "Cardiovascular",
        "batch_number": "AML-2024-018",
        "expiry_date": (datetime.now() + timedelta(days=37)).strftime('%Y-%m-%d'),
        "quantity": 150,
        "price": 6.80,
        "reorder_level": 75,
        "status": "in_stock"
    },
    {
        "name": "Cetirizine 10mg Tablets",
        "category": "Allergy",
        "batch_number": "CTZ-2024-019",
        "expiry_date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
        "quantity": 100,
        "price": 1.50,
        "reorder_level": 50,
        "status": "low_stock"
    },
    {
        "name": "Omeprazole 40mg Capsules",
        "category": "Gastrointestinal",
        "batch_number": "OMP-2024-020",
        "expiry_date": (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d'),
        "quantity": 75,
        "price": 5.20,
        "reorder_level": 40,
        "status": "out_of_stock"
    }
]

async def add_sample_inventory_data():
    """Add sample inventory data to the database"""
    try:
        print("🔄 Adding sample inventory data to Supabase...")
        
        # Get current timestamp
        current_time = datetime.utcnow().isoformat()
        
        # Add organization_id to all items (using a default test organization)
        test_organization_id = "550e8400-e29b-41d4-a716-446655440000"  # Proper UUID format
        
        for item_data in SAMPLE_INVENTORY_DATA:
            # Add metadata
            item_data.update({
                "organization_id": test_organization_id,
                "created_at": current_time,
                "updated_at": current_time
            })
            
            # Remove notes field if it exists
            if "notes" in item_data:
                del item_data["notes"]
            
            # Insert into database
            try:
                result = db.client.table('inventory_items').insert(item_data).execute()
                print(f"✅ Added: {item_data['name']} (Expires: {item_data['expiry_date']})")
            except Exception as e:
                print(f"❌ Failed to add {item_data['name']}: {e}")
                continue
        
        print(f"🎉 Successfully added {len(SAMPLE_INVENTORY_DATA)} sample inventory items!")
        print(f"📊 Current date: {datetime.now().strftime('%Y-%m-%d')}")
        print(f"📅 Sample data includes:")
        print(f"   - Recently expired items (1-30 days ago)")
        print(f"   - Items expiring soon (1-30 days)")
        print(f"   - Items with good expiry dates (30+ days)")
        
    except Exception as e:
        print(f"❌ Error adding sample data: {e}")
        raise

async def main():
    """Main function to run the script"""
    print("🚀 MedInventory Sample Data Generator")
    print("=" * 50)
    
    try:
        await add_sample_inventory_data()
        print("\n✅ Sample data generation completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Sample data generation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 
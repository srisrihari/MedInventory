#!/usr/bin/env python3
"""
Load Synthetic Data into Real Supabase Database
This script populates your Supabase database with realistic medical inventory data
"""

import asyncio
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import random
from loguru import logger
from supabase import create_client, Client
from app.config import settings

# Ensure we're using real credentials, not placeholders
if (settings.SUPABASE_URL == "https://placeholder.supabase.co" or 
    settings.SUPABASE_ANON_KEY == "placeholder-anon-key"):
    print("❌ ERROR: Please update your .env file with real Supabase credentials!")
    print("📝 Follow the SUPABASE_SETUP_GUIDE.md instructions")
    exit(1)

# Initialize Supabase client
supabase: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

class SupabaseDataLoader:
    def __init__(self):
        self.medical_items = [
            # Pain Relief
            {"name": "Paracetamol 500mg", "category": "Pain Relief", "unit": "Tablets"},
            {"name": "Ibuprofen 400mg", "category": "Pain Relief", "unit": "Tablets"},
            {"name": "Aspirin 75mg", "category": "Pain Relief", "unit": "Tablets"},
            {"name": "Tramadol 50mg", "category": "Pain Relief", "unit": "Capsules"},
            {"name": "Morphine 10mg/ml", "category": "Pain Relief", "unit": "Vials"},
            
            # Antibiotics
            {"name": "Amoxicillin 250mg", "category": "Antibiotics", "unit": "Capsules"},
            {"name": "Ciprofloxacin 500mg", "category": "Antibiotics", "unit": "Tablets"},
            {"name": "Azithromycin 250mg", "category": "Antibiotics", "unit": "Tablets"},
            {"name": "Ceftriaxone 1g", "category": "Antibiotics", "unit": "Vials"},
            {"name": "Vancomycin 500mg", "category": "Antibiotics", "unit": "Vials"},
            
            # Diabetes
            {"name": "Insulin Glargine", "category": "Diabetes", "unit": "Vials"},
            {"name": "Metformin 500mg", "category": "Diabetes", "unit": "Tablets"},
            {"name": "Glucose Test Strips", "category": "Diabetes", "unit": "Strips"},
            {"name": "Insulin Pen Needles", "category": "Diabetes", "unit": "Needles"},
            {"name": "Glucagon Emergency Kit", "category": "Diabetes", "unit": "Kits"},
            
            # Cardiovascular
            {"name": "Atorvastatin 20mg", "category": "Cardiovascular", "unit": "Tablets"},
            {"name": "Lisinopril 10mg", "category": "Cardiovascular", "unit": "Tablets"},
            {"name": "Amlodipine 5mg", "category": "Cardiovascular", "unit": "Tablets"},
            {"name": "Warfarin 5mg", "category": "Cardiovascular", "unit": "Tablets"},
            {"name": "Nitroglycerin Spray", "category": "Cardiovascular", "unit": "Bottles"},
            
            # Emergency
            {"name": "Epinephrine Auto-Injector", "category": "Emergency", "unit": "Devices"},
            {"name": "Atropine 1mg/ml", "category": "Emergency", "unit": "Vials"},
            {"name": "Naloxone 0.4mg/ml", "category": "Emergency", "unit": "Vials"},
            {"name": "Dextrose 50%", "category": "Emergency", "unit": "Vials"},
            {"name": "Sodium Bicarbonate 8.4%", "category": "Emergency", "unit": "Vials"},
            
            # IV Fluids
            {"name": "Normal Saline 0.9%", "category": "IV Fluids", "unit": "Bags"},
            {"name": "Lactated Ringer's", "category": "IV Fluids", "unit": "Bags"},
            {"name": "D5W (5% Dextrose)", "category": "IV Fluids", "unit": "Bags"},
            {"name": "Plasma Expander", "category": "IV Fluids", "unit": "Bags"},
            {"name": "Blood Type O-", "category": "IV Fluids", "unit": "Units"},
            
            # Anesthesia
            {"name": "Propofol 10mg/ml", "category": "Anesthesia", "unit": "Vials"},
            {"name": "Lidocaine 2%", "category": "Anesthesia", "unit": "Vials"},
            {"name": "Sevoflurane", "category": "Anesthesia", "unit": "Bottles"},
            {"name": "Midazolam 5mg/ml", "category": "Anesthesia", "unit": "Vials"},
            {"name": "Fentanyl 50mcg/ml", "category": "Anesthesia", "unit": "Vials"},
            
            # Vaccines
            {"name": "COVID-19 Vaccine", "category": "Vaccines", "unit": "Doses"},
            {"name": "Influenza Vaccine", "category": "Vaccines", "unit": "Doses"},
            {"name": "Hepatitis B Vaccine", "category": "Vaccines", "unit": "Doses"},
            {"name": "Tetanus Vaccine", "category": "Vaccines", "unit": "Doses"},
            {"name": "MMR Vaccine", "category": "Vaccines", "unit": "Doses"},
            
            # Surgical Supplies
            {"name": "Surgical Sutures 3-0", "category": "Surgical", "unit": "Packets"},
            {"name": "Surgical Gloves Size M", "category": "Surgical", "unit": "Pairs"},
            {"name": "Gauze Pads 4x4", "category": "Surgical", "unit": "Pieces"},
            {"name": "Medical Tape", "category": "Surgical", "unit": "Rolls"},
            {"name": "Surgical Masks", "category": "Surgical", "unit": "Pieces"},
            
            # Respiratory
            {"name": "Albuterol Inhaler", "category": "Respiratory", "unit": "Inhalers"},
            {"name": "Oxygen Cylinder", "category": "Respiratory", "unit": "Cylinders"},
            {"name": "Nebulizer Solution", "category": "Respiratory", "unit": "Vials"},
            {"name": "CPAP Masks", "category": "Respiratory", "unit": "Units"},
            {"name": "Ventilator Tubing", "category": "Respiratory", "unit": "Sets"},
            
            # Laboratory
            {"name": "Blood Collection Tubes", "category": "Laboratory", "unit": "Tubes"},
            {"name": "Urine Collection Cups", "category": "Laboratory", "unit": "Cups"},
            {"name": "Microscope Slides", "category": "Laboratory", "unit": "Slides"},
            {"name": "Lab Reagents Kit", "category": "Laboratory", "unit": "Kits"},
            {"name": "Petri Dishes", "category": "Laboratory", "unit": "Dishes"},
        ]
        
        self.suppliers = [
            {
                "name": "MediTech Pharmaceuticals Ltd.",
                "email": "orders@meditech-pharma.com",
                "phone": "+1-555-0123",
                "whatsapp": "+1-555-0123",
                "address": "1250 Medical Plaza, Boston, MA 02101",
                "rating": 4.8,
                "response_time_hours": 12,
                "delivery_performance": "excellent",
                "price_competitiveness": "high",
                "on_time_delivery_rate": 97.5,
                "status": "active"
            },
            {
                "name": "Global Health Supplies Inc.",
                "email": "procurement@globalhealthsupplies.com",
                "phone": "+1-555-0456",
                "whatsapp": "+1-555-0456",
                "address": "890 Healthcare Drive, Chicago, IL 60601",
                "rating": 4.6,
                "response_time_hours": 18,
                "delivery_performance": "excellent",
                "price_competitiveness": "medium",
                "on_time_delivery_rate": 95.2,
                "status": "active"
            },
            {
                "name": "PharmaPlus Distribution",
                "email": "sales@pharmaplus.com",
                "phone": "+1-555-0789",
                "whatsapp": "+1-555-0789",
                "address": "456 Pharma Boulevard, Houston, TX 77001",
                "rating": 4.4,
                "response_time_hours": 24,
                "delivery_performance": "good",
                "price_competitiveness": "high",
                "on_time_delivery_rate": 92.8,
                "status": "active"
            },
            {
                "name": "Emergency Medical Solutions",
                "email": "emergency@emsolutions.com",
                "phone": "+1-555-0321",
                "whatsapp": "+1-555-0321",
                "address": "789 Emergency Lane, Atlanta, GA 30301",
                "rating": 4.9,
                "response_time_hours": 6,
                "delivery_performance": "excellent",
                "price_competitiveness": "medium",
                "on_time_delivery_rate": 98.1,
                "status": "active"
            },
            {
                "name": "Precision Medical Devices",
                "email": "contact@precisionmedical.com",
                "phone": "+1-555-0654",
                "whatsapp": "+1-555-0654",
                "address": "321 Device Street, San Francisco, CA 94101",
                "rating": 4.3,
                "response_time_hours": 36,
                "delivery_performance": "good",
                "price_competitiveness": "low",
                "on_time_delivery_rate": 89.7,
                "status": "active"
            },
            {
                "name": "BioSupply International",
                "email": "orders@biosupply-intl.com",
                "phone": "+1-555-0987",
                "whatsapp": "+1-555-0987",
                "address": "654 Bio Avenue, New York, NY 10001",
                "rating": 4.7,
                "response_time_hours": 15,
                "delivery_performance": "excellent",
                "price_competitiveness": "high",
                "on_time_delivery_rate": 96.3,
                "status": "active"
            },
            {
                "name": "Healthcare Products Co.",
                "email": "info@healthcareproducts.com",
                "phone": "+1-555-0147",
                "whatsapp": "+1-555-0147",
                "address": "987 Health Street, Denver, CO 80201",
                "rating": 4.1,
                "response_time_hours": 48,
                "delivery_performance": "average",
                "price_competitiveness": "medium",
                "on_time_delivery_rate": 87.4,
                "status": "active"
            },
            {
                "name": "MedEquip Solutions Ltd.",
                "email": "sales@medequipsolutions.com",
                "phone": "+1-555-0258",
                "whatsapp": "+1-555-0258",
                "address": "147 Equipment Row, Seattle, WA 98101",
                "rating": 4.5,
                "response_time_hours": 20,
                "delivery_performance": "good",
                "price_competitiveness": "high",
                "on_time_delivery_rate": 93.6,
                "status": "active"
            }
        ]
        
        self.equipment_types = [
            # ICU Equipment
            {"name": "Ventilator Model VT-500", "type": "Respiratory", "manufacturer": "RespiraTech"},
            {"name": "Patient Monitor PM-2000", "type": "Monitoring", "manufacturer": "VitalSigns Inc"},
            {"name": "Defibrillator DF-300", "type": "Emergency", "manufacturer": "LifeSaver Medical"},
            {"name": "Infusion Pump IP-150", "type": "IV Therapy", "manufacturer": "FluidTech"},
            {"name": "ECG Machine EC-100", "type": "Diagnostics", "manufacturer": "CardioSystems"},
            
            # OR Equipment
            {"name": "Anesthesia Machine AM-400", "type": "Anesthesia", "manufacturer": "SleepSafe"},
            {"name": "Surgical Table ST-200", "type": "Surgical", "manufacturer": "SurgePro"},
            {"name": "C-Arm X-Ray CA-250", "type": "Imaging", "manufacturer": "ImageTech"},
            {"name": "Electrosurgical Unit ES-180", "type": "Surgical", "manufacturer": "SurgePro"},
            {"name": "OR Light System LS-350", "type": "Surgical", "manufacturer": "BrightSurg"},
            
            # Diagnostic Equipment
            {"name": "CT Scanner CT-3000", "type": "Imaging", "manufacturer": "ScanMaster"},
            {"name": "MRI Machine MR-1500", "type": "Imaging", "manufacturer": "MagnetoMed"},
            {"name": "Ultrasound US-800", "type": "Imaging", "manufacturer": "SonoWave"},
            {"name": "X-Ray Machine XR-600", "type": "Imaging", "manufacturer": "RadiTech"},
            {"name": "Blood Analyzer BA-450", "type": "Laboratory", "manufacturer": "LabSystems"},
            
            # Emergency Equipment
            {"name": "Crash Cart CC-100", "type": "Emergency", "manufacturer": "EmergTech"},
            {"name": "Transport Monitor TM-50", "type": "Monitoring", "manufacturer": "PortaMed"},
            {"name": "Portable Ventilator PV-200", "type": "Respiratory", "manufacturer": "RespiraTech"},
            {"name": "Emergency Suction ES-75", "type": "Emergency", "manufacturer": "VacuMed"},
            {"name": "AED Device AED-300", "type": "Emergency", "manufacturer": "LifeSaver Medical"},
        ]
        
        self.locations = [
            "ICU Room 101", "ICU Room 102", "ICU Room 103",
            "OR 1", "OR 2", "OR 3", "OR 4",
            "Emergency Room", "Recovery Room A", "Recovery Room B",
            "Radiology Department", "Laboratory", "Central Pharmacy",
            "Warehouse A, Shelf 1", "Warehouse A, Shelf 2", "Warehouse A, Shelf 3",
            "Warehouse B, Shelf 1", "Warehouse B, Shelf 2", 
            "Cold Storage, Section 1", "Cold Storage, Section 2",
            "Pharmacy, Cabinet A", "Pharmacy, Cabinet B"
        ]

    def generate_inventory_items(self, count: int = 50) -> List[Dict[str, Any]]:
        """Generate realistic inventory items"""
        items = []
        
        # Use all medical items and cycle if needed
        extended_items = (self.medical_items * (count // len(self.medical_items) + 1))[:count]
        
        for i, base_item in enumerate(extended_items):
            quantity = random.randint(50, 1000)
            reorder_level = random.randint(20, 100)
            
            # Determine status based on quantity vs reorder level
            if quantity == 0:
                status = 'out_of_stock'
            elif quantity <= reorder_level:
                status = 'low_stock'
            else:
                status = 'in_stock'
            
            # Generate expiry date (mix of past, near future, and far future)
            days_offset = random.choice([
                random.randint(-30, 30),     # Some expired or expiring soon
                random.randint(90, 365),     # Medium term
                random.randint(365, 730)     # Long term
            ])
            expiry_date = (datetime.now() + timedelta(days=days_offset)).date()
            
            item = {
                "name": base_item["name"],
                "category": base_item["category"],
                "quantity": quantity,
                "unit": base_item["unit"],
                "batch_number": f"BATCH-{random.randint(1000, 9999)}",
                "batch_id": f"B{random.randint(100, 999)}",
                "expiry_date": expiry_date.isoformat(),
                "price": round(random.uniform(0.1, 100.0), 2),
                "location": random.choice(self.locations),
                "reorder_level": reorder_level,
                "status": status
            }
            items.append(item)
        
        return items

    def generate_equipment(self, count: int = 20) -> List[Dict[str, Any]]:
        """Generate realistic medical equipment"""
        equipment = []
        
        for i in range(count):
            base_equipment = random.choice(self.equipment_types)
            
            # Generate dates
            install_date = datetime.now() - timedelta(days=random.randint(30, 1095))  # 1 month to 3 years ago
            warranty_expiry = install_date + timedelta(days=random.randint(365, 1825))  # 1-5 year warranty
            last_maintenance = datetime.now() - timedelta(days=random.randint(1, 90))
            next_maintenance = datetime.now() + timedelta(days=random.randint(30, 180))
            
            # Generate status and health score
            status_options = ['operational', 'maintenance', 'critical', 'offline']
            status = random.choices(status_options, weights=[70, 20, 8, 2])[0]  # Most operational
            
            health_score = random.randint(60, 100) if status == 'operational' else random.randint(20, 80)
            utilization_rate = random.uniform(40.0, 95.0)
            
            equipment_item = {
                "name": f"{base_equipment['name']} #{i+1:03d}",
                "type": base_equipment["type"],
                "location": random.choice(self.locations[:10]),  # Equipment in main areas
                "manufacturer": base_equipment["manufacturer"],
                "model": base_equipment["name"].split()[0],
                "serial_number": f"SN{random.randint(100000, 999999)}",
                "install_date": install_date.date().isoformat(),
                "warranty_expiry": warranty_expiry.date().isoformat(),
                "status": status,
                "health_score": health_score,
                "utilization_rate": round(utilization_rate, 1),
                "last_maintenance": last_maintenance.date().isoformat(),
                "next_maintenance": next_maintenance.date().isoformat()
            }
            equipment.append(equipment_item)
        
        return equipment

    def generate_bid_requests(self, count: int = 10) -> List[Dict[str, Any]]:
        """Generate realistic bid requests"""
        requests = []
        
        bid_categories = ["Pain Relief", "Antibiotics", "Surgical", "Emergency", "IV Fluids"]
        
        for i in range(count):
            category = random.choice(bid_categories)
            quantity = random.randint(100, 2000)
            estimated_value = round(random.uniform(5000.0, 50000.0), 2)
            deadline = (datetime.now() + timedelta(days=random.randint(7, 45))).date()
            
            # Mix of statuses
            status_options = ['draft', 'active', 'closed', 'awarded']
            status = random.choices(status_options, weights=[20, 50, 20, 10])[0]
            
            # Sample items for the bid
            category_items = [item for item in self.medical_items if item["category"] == category]
            selected_items = random.sample(category_items, min(3, len(category_items)))
            
            request = {
                "title": f"{category} Supply Request #{i+1:03d}",
                "description": f"Urgent procurement of {category.lower()} medical supplies for hospital inventory replenishment.",
                "category": category,
                "items": selected_items,
                "quantity": quantity,
                "estimated_value": estimated_value,
                "deadline": deadline.isoformat(),
                "status": status
            }
            requests.append(request)
        
        return requests

    async def load_data_to_supabase(self):
        """Load all synthetic data to Supabase"""
        try:
            logger.info("🚀 Starting Supabase data loading...")
            
            # Generate data
            logger.info("📊 Generating synthetic data...")
            inventory_items = self.generate_inventory_items(50)
            equipment_list = self.generate_equipment(20)
            bid_requests = self.generate_bid_requests(10)
            
            # Load suppliers
            logger.info("🏢 Loading suppliers...")
            suppliers_result = supabase.table('suppliers').insert(self.suppliers).execute()
            logger.info(f"✅ Loaded {len(suppliers_result.data)} suppliers")
            
            # Load inventory items
            logger.info("💊 Loading inventory items...")
            inventory_result = supabase.table('inventory_items').insert(inventory_items).execute()
            logger.info(f"✅ Loaded {len(inventory_result.data)} inventory items")
            
            # Load equipment
            logger.info("🏥 Loading equipment...")
            equipment_result = supabase.table('equipment').insert(equipment_list).execute()
            logger.info(f"✅ Loaded {len(equipment_result.data)} equipment items")
            
            # Load bid requests
            logger.info("📋 Loading bid requests...")
            bid_result = supabase.table('bid_requests').insert(bid_requests).execute()
            logger.info(f"✅ Loaded {len(bid_result.data)} bid requests")
            
            logger.info("🎉 All synthetic data loaded successfully!")
            
        except Exception as e:
            logger.error(f"❌ Error loading data to Supabase: {e}")
            raise

async def main():
    """Main function to load data"""
    loader = SupabaseDataLoader()
    
    print("🗄️  SUPABASE DATA LOADER")
    print("=" * 50)
    print(f"📡 Supabase URL: {settings.SUPABASE_URL}")
    print(f"🔑 Using Service Role Key: {settings.SUPABASE_SERVICE_ROLE_KEY[:20]}...")
    print()
    
    # Test connection first
    try:
        logger.info("🔍 Testing Supabase connection...")
        test_result = supabase.table('inventory_items').select("count").execute()
        logger.info("✅ Supabase connection successful!")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")
        logger.error("🔧 Please check your credentials in .env file")
        return
    
    # Ask for confirmation
    print("⚠️  This will add synthetic data to your Supabase database.")
    print("📝 Make sure you've created the tables using the SQL in SUPABASE_SETUP_GUIDE.md")
    response = input("\n👉 Continue? (y/N): ").strip().lower()
    
    if response != 'y':
        print("❌ Operation cancelled")
        return
    
    try:
        await loader.load_data_to_supabase()
        
        print("\n" + "=" * 50)
        print("🎊 SUCCESS! Your Supabase database is ready!")
        print("=" * 50)
        print("✅ 8 Medical suppliers")
        print("✅ 50 Medical inventory items") 
        print("✅ 20 Medical equipment pieces")
        print("✅ 10 Bid requests")
        print()
        print("🚀 Now restart your backend server to use real data!")
        print("   cd backend && python3 start_server.py")
        print()
        print("🌐 Test your APIs:")
        print("   curl http://localhost:8000/api/inventory/items")
        
    except Exception as e:
        logger.error(f"💥 Failed to load data: {e}")
        print("\n🔧 Troubleshooting:")
        print("1. Check your .env file has correct Supabase credentials")
        print("2. Make sure you ran the SQL table creation script")
        print("3. Verify your Supabase project is active")

if __name__ == "__main__":
    asyncio.run(main())
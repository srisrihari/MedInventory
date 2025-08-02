#!/usr/bin/env python3
"""
Create Synthetic Data for MedInventory Testing
This script generates realistic medical inventory, supplier, and equipment data
"""

import json
import random
from datetime import datetime, date, timedelta
from typing import List, Dict

class SyntheticDataGenerator:
    def __init__(self):
        self.medical_categories = [
            "Pain Relief", "Antibiotics", "Diabetes", "Cardiovascular", 
            "Respiratory", "Supplements", "Vaccines", "Emergency Medicine",
            "Surgical Supplies", "Diagnostic Reagents", "Dermatology", "Oncology"
        ]
        
        self.medical_items = [
            # Pain Relief
            {"name": "Paracetamol 500mg", "category": "Pain Relief", "unit": "Tablets", "price": 0.15},
            {"name": "Ibuprofen 400mg", "category": "Pain Relief", "unit": "Tablets", "price": 0.18},
            {"name": "Aspirin 75mg", "category": "Pain Relief", "unit": "Tablets", "price": 0.12},
            {"name": "Tramadol 50mg", "category": "Pain Relief", "unit": "Capsules", "price": 0.45},
            {"name": "Morphine 10mg/ml", "category": "Pain Relief", "unit": "Vials", "price": 8.50},
            
            # Antibiotics
            {"name": "Amoxicillin 250mg", "category": "Antibiotics", "unit": "Capsules", "price": 0.28},
            {"name": "Ciprofloxacin 500mg", "category": "Antibiotics", "unit": "Tablets", "price": 0.35},
            {"name": "Azithromycin 250mg", "category": "Antibiotics", "unit": "Tablets", "price": 0.75},
            {"name": "Ceftriaxone 1g", "category": "Antibiotics", "unit": "Vials", "price": 3.20},
            {"name": "Vancomycin 500mg", "category": "Antibiotics", "unit": "Vials", "price": 12.50},
            
            # Diabetes
            {"name": "Insulin Glargine", "category": "Diabetes", "unit": "Vials", "price": 35.99},
            {"name": "Metformin 500mg", "category": "Diabetes", "unit": "Tablets", "price": 0.08},
            {"name": "Glucose Test Strips", "category": "Diabetes", "unit": "Strips", "price": 0.65},
            {"name": "Insulin Pen Needles", "category": "Diabetes", "unit": "Needles", "price": 0.15},
            {"name": "Glucagon Emergency Kit", "category": "Diabetes", "unit": "Kits", "price": 85.00},
            
            # Cardiovascular
            {"name": "Atorvastatin 20mg", "category": "Cardiovascular", "unit": "Tablets", "price": 0.25},
            {"name": "Lisinopril 10mg", "category": "Cardiovascular", "unit": "Tablets", "price": 0.18},
            {"name": "Amlodipine 5mg", "category": "Cardiovascular", "unit": "Tablets", "price": 0.22},
            {"name": "Warfarin 5mg", "category": "Cardiovascular", "unit": "Tablets", "price": 0.30},
            {"name": "Nitroglycerin Spray", "category": "Cardiovascular", "unit": "Bottles", "price": 25.00},
            
            # Respiratory
            {"name": "Salbutamol Inhaler", "category": "Respiratory", "unit": "Inhalers", "price": 15.50},
            {"name": "Prednisolone 5mg", "category": "Respiratory", "unit": "Tablets", "price": 0.12},
            {"name": "Oxygen Mask", "category": "Respiratory", "unit": "Masks", "price": 2.50},
            {"name": "Nebulizer Solution", "category": "Respiratory", "unit": "Vials", "price": 4.20},
            
            # Supplements
            {"name": "Vitamin B Complex", "category": "Supplements", "unit": "Tablets", "price": 0.10},
            {"name": "Vitamin D3 1000IU", "category": "Supplements", "unit": "Tablets", "price": 0.08},
            {"name": "Folic Acid 5mg", "category": "Supplements", "unit": "Tablets", "price": 0.06},
            {"name": "Iron Sulfate 200mg", "category": "Supplements", "unit": "Tablets", "price": 0.12},
            
            # Emergency Medicine
            {"name": "Epinephrine Auto-Injector", "category": "Emergency Medicine", "unit": "Injectors", "price": 150.00},
            {"name": "Atropine 1mg/ml", "category": "Emergency Medicine", "unit": "Vials", "price": 5.50},
            {"name": "Dextrose 50% Solution", "category": "Emergency Medicine", "unit": "Vials", "price": 3.75},
            {"name": "Naloxone 0.4mg/ml", "category": "Emergency Medicine", "unit": "Vials", "price": 25.00},
            
            # Surgical Supplies
            {"name": "Surgical Gloves (Latex)", "category": "Surgical Supplies", "unit": "Pairs", "price": 0.35},
            {"name": "Surgical Masks", "category": "Surgical Supplies", "unit": "Masks", "price": 0.25},
            {"name": "Suture Kit (Nylon)", "category": "Surgical Supplies", "unit": "Kits", "price": 12.50},
            {"name": "Surgical Gauze", "category": "Surgical Supplies", "unit": "Pads", "price": 0.45},
        ]
        
        self.suppliers = [
            {"name": "MediTech Pharmaceuticals", "email": "orders@meditech.com", "rating": 4.8, "response_time": 24},
            {"name": "Global Health Supplies", "email": "procurement@globalhealth.com", "rating": 4.5, "response_time": 48},
            {"name": "PharmaPlus Inc.", "email": "sales@pharmaplus.com", "rating": 4.2, "response_time": 36},
            {"name": "Healthcare Products Co.", "email": "orders@healthcareproducts.com", "rating": 4.7, "response_time": 24},
            {"name": "MedEquip Solutions", "email": "support@medequip.com", "rating": 3.9, "response_time": 72},
            {"name": "BioMed Distributors", "email": "sales@biomedist.com", "rating": 4.4, "response_time": 48},
            {"name": "Surgical Specialists Ltd", "email": "orders@surgicalspec.com", "rating": 4.6, "response_time": 36},
            {"name": "Emergency Medical Supply", "email": "urgent@emssupply.com", "rating": 4.3, "response_time": 12}
        ]
        
        self.equipment_types = [
            {"name": "MRI Scanner Alpha", "type": "Diagnostic Imaging", "manufacturer": "Siemens", "model": "MAGNETOM Vida 3T"},
            {"name": "CT Scanner Beta", "type": "Diagnostic Imaging", "manufacturer": "GE Healthcare", "model": "Revolution CT"},
            {"name": "X-Ray Machine Gamma", "type": "Diagnostic Imaging", "manufacturer": "Canon", "model": "CXDI-820C"},
            {"name": "Ultrasound Delta", "type": "Diagnostic Imaging", "manufacturer": "Philips", "model": "EPIQ 7"},
            {"name": "Ventilator Unit-A1", "type": "Life Support", "manufacturer": "Philips", "model": "Respironics V680"},
            {"name": "Defibrillator Pro-5", "type": "Emergency", "manufacturer": "Zoll", "model": "R Series Plus"},
            {"name": "Patient Monitor M1", "type": "Monitoring", "manufacturer": "GE Healthcare", "model": "CARESCAPE B850"},
            {"name": "Anesthesia Machine AM-200", "type": "Surgical", "manufacturer": "Dräger", "model": "Perseus A500"},
            {"name": "Infusion Pump IP-100", "type": "Drug Delivery", "manufacturer": "BD", "model": "Alaris 8015"},
            {"name": "Laboratory Analyzer LA-500", "type": "Laboratory", "manufacturer": "Abbott", "model": "ARCHITECT c4000"}
        ]

    def generate_inventory_items(self, count: int = 50) -> List[Dict]:
        """Generate realistic medical inventory items"""
        items = []
        
        # Create extended list of medical items to handle count
        extended_items = (self.medical_items * (count // len(self.medical_items) + 1))[:count]
        
        for i, base_item in enumerate(extended_items):
            if i >= count:
                break
                
            # Generate realistic quantities based on item type
            if base_item["category"] in ["Emergency Medicine", "Vaccines"]:
                quantity = random.randint(10, 100)
                reorder_level = random.randint(5, 25)
            elif base_item["category"] in ["Surgical Supplies"]:
                quantity = random.randint(100, 2000)
                reorder_level = random.randint(50, 200)
            else:
                quantity = random.randint(50, 1000)
                reorder_level = random.randint(25, 100)
            
            # Generate expiry dates (some expired, some expiring soon, most future)
            expiry_days = random.choice([
                random.randint(-30, 0),    # 20% expired
                random.randint(1, 30),     # 20% expiring soon
                random.randint(31, 365),   # 40% normal
                random.randint(366, 730)   # 20% long shelf life
            ])
            
            # Determine status
            if quantity == 0:
                status = "out_of_stock"
            elif quantity <= reorder_level:
                status = "low_stock"
            else:
                status = "in_stock"
            
            item = {
                "name": base_item["name"],
                "category": base_item["category"],
                "quantity": quantity,
                "unit": base_item["unit"],
                "batch_number": f"BATCH-{random.randint(1000, 9999)}",
                "batch_id": f"B{random.randint(100, 999)}",
                "expiry_date": (datetime.now().date() + timedelta(days=expiry_days)).isoformat(),
                "price": base_item["price"] * random.uniform(0.8, 1.2),  # Add price variation
                "location": random.choice([
                    "Warehouse A, Shelf 1", "Warehouse A, Shelf 2", "Warehouse A, Shelf 3",
                    "Warehouse B, Shelf 1", "Warehouse B, Shelf 2", 
                    "Cold Storage, Section 1", "Cold Storage, Section 2",
                    "Pharmacy, Cabinet A", "Emergency Room Stock", "ICU Storage"
                ]),
                "reorder_level": reorder_level,
                "status": status,
                "supplier_name": random.choice(self.suppliers)["name"]
            }
            items.append(item)
        
        return items

    def generate_suppliers_data(self) -> List[Dict]:
        """Generate supplier data with contact information"""
        suppliers_data = []
        
        for supplier in self.suppliers:
            # Generate phone numbers
            phone = f"+91-98{random.randint(10000000, 99999999)}"
            whatsapp = phone
            
            supplier_data = {
                "name": supplier["name"],
                "email": supplier["email"],
                "phone": phone,
                "whatsapp": whatsapp,
                "address": f"{random.randint(100, 999)} Medical Plaza, {random.choice(['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Pune'])}, India",
                "rating": supplier["rating"],
                "response_time_hours": supplier["response_time"],
                "delivery_performance": random.choice(["excellent", "good", "average"]),
                "price_competitiveness": random.choice(["high", "medium", "low"]),
                "on_time_delivery_rate": random.uniform(80, 99),
                "status": "active"
            }
            suppliers_data.append(supplier_data)
        
        return suppliers_data

    def generate_equipment_data(self) -> List[Dict]:
        """Generate medical equipment data"""
        equipment_data = []
        
        for i, equipment in enumerate(self.equipment_types):
            install_date = datetime.now().date() - timedelta(days=random.randint(30, 1095))  # 1 month to 3 years ago
            warranty_expiry = install_date + timedelta(days=random.randint(365, 1825))  # 1-5 year warranty
            
            # Generate health score and status
            health_score = random.randint(40, 100)
            if health_score >= 80:
                status = "operational"
            elif health_score >= 60:
                status = "maintenance"
            else:
                status = "critical"
            
            equipment_item = {
                "name": equipment["name"],
                "type": equipment["type"],
                "location": random.choice([
                    "Radiology - Room 101", "Radiology - Room 102", "ICU - Bay 1", "ICU - Bay 2",
                    "Emergency - Room 205", "Surgery - OR 1", "Surgery - OR 2", "Laboratory - Section A",
                    "Cardiology - Room 301", "Pharmacy - Main Floor"
                ]),
                "manufacturer": equipment["manufacturer"],
                "model": equipment["model"],
                "serial_number": f"{equipment['manufacturer'][:2].upper()}-{datetime.now().year}-{i+1:03d}",
                "install_date": install_date.isoformat(),
                "warranty_expiry": warranty_expiry.isoformat(),
                "status": status,
                "health_score": health_score,
                "utilization_rate": random.uniform(20, 95),
                "last_maintenance": (datetime.now().date() - timedelta(days=random.randint(1, 90))).isoformat(),
                "next_maintenance": (datetime.now().date() + timedelta(days=random.randint(10, 180))).isoformat()
            }
            equipment_data.append(equipment_item)
        
        return equipment_data

    def generate_bid_requests(self, count: int = 10) -> List[Dict]:
        """Generate bid requests for procurement"""
        bid_requests = []
        
        categories = ["Pharmaceuticals", "Medical Equipment", "Surgical Supplies", "Diagnostic Reagents"]
        
        for i in range(count):
            category = random.choice(categories)
            quantity = random.randint(100, 5000)
            estimated_value = random.uniform(1000, 50000)
            
            # Create items list
            items = []
            item_count = random.randint(1, 5)
            for j in range(item_count):
                item = random.choice(self.medical_items)
                items.append({
                    "name": item["name"],
                    "category": item["category"],
                    "quantity": random.randint(50, 1000),
                    "unit": item["unit"],
                    "specifications": f"Hospital grade, FDA approved, Batch size: {random.randint(10, 100)}"
                })
            
            request = {
                "title": f"{category} Procurement Request #{i+1:04d}",
                "description": f"Urgent procurement required for {category.lower()}. Please provide competitive quotes with delivery timeline.",
                "category": category,
                "items": items,
                "quantity": quantity,
                "estimated_value": round(estimated_value, 2),
                "deadline": (datetime.now().date() + timedelta(days=random.randint(7, 30))).isoformat(),
                "status": random.choice(["draft", "active", "closed"])
            }
            bid_requests.append(request)
        
        return bid_requests

    def generate_maintenance_tasks(self, count: int = 15) -> List[Dict]:
        """Generate maintenance tasks for equipment"""
        tasks = []
        
        task_types = ["preventive", "corrective", "emergency"]
        priorities = ["low", "medium", "high", "critical"]
        statuses = ["scheduled", "in_progress", "completed", "overdue"]
        
        for i in range(count):
            equipment_name = random.choice(self.equipment_types)["name"]
            task_type = random.choice(task_types)
            priority = random.choice(priorities)
            status = random.choice(statuses)
            
            # Generate realistic task details
            if task_type == "preventive":
                title = f"Routine maintenance for {equipment_name}"
                description = "Regular preventive maintenance including calibration, cleaning, and performance verification."
            elif task_type == "corrective":
                title = f"Repair {random.choice(['cooling system', 'display unit', 'power supply', 'sensor calibration'])} - {equipment_name}"
                description = "Corrective maintenance to address performance issues and restore optimal functionality."
            else:  # emergency
                title = f"URGENT: Critical failure in {equipment_name}"
                description = "Emergency maintenance required due to critical system failure affecting patient care."
            
            task = {
                "equipment_name": equipment_name,
                "task_type": task_type,
                "priority": priority,
                "title": title,
                "description": description,
                "scheduled_date": (datetime.now().date() + timedelta(days=random.randint(-30, 60))).isoformat(),
                "estimated_duration_hours": random.randint(1, 8),
                "status": status,
                "cost": random.uniform(500, 5000) if status == "completed" else None
            }
            
            if status == "completed":
                task["completed_date"] = (datetime.now().date() - timedelta(days=random.randint(1, 30))).isoformat()
                task["actual_duration_hours"] = random.randint(1, 10)
                
            tasks.append(task)
        
        return tasks

    def generate_inventory_transactions(self, count: int = 100) -> List[Dict]:
        """Generate inventory transaction history"""
        transactions = []
        
        transaction_types = ["add", "subtract", "adjust"]
        reference_types = ["purchase", "usage", "adjustment", "waste", "transfer", "return"]
        
        for i in range(count):
            transaction_type = random.choice(transaction_types)
            reference_type = random.choice(reference_types)
            
            # Generate realistic quantities based on transaction type
            if transaction_type == "add":
                quantity = random.randint(10, 500)
                if reference_type not in ["purchase", "return", "transfer"]:
                    reference_type = "purchase"
            elif transaction_type == "subtract":
                quantity = random.randint(1, 100)
                if reference_type not in ["usage", "waste", "transfer"]:
                    reference_type = "usage"
            else:  # adjust
                quantity = random.randint(1, 50)
                reference_type = "adjustment"
            
            transaction = {
                "item_name": random.choice(self.medical_items)["name"],
                "transaction_type": transaction_type,
                "quantity": quantity,
                "reference_type": reference_type,
                "reference_id": f"REF-{random.randint(10000, 99999)}",
                "notes": f"Transaction for {reference_type} - Reference: {random.choice(['PO-123', 'PATIENT-456', 'AUDIT-789', 'TRANSFER-321'])}",
                "created_at": (datetime.now() - timedelta(days=random.randint(1, 90))).isoformat()
            }
            transactions.append(transaction)
        
        return transactions

    def generate_all_synthetic_data(self) -> Dict:
        """Generate complete synthetic dataset"""
        print("🔄 Generating synthetic data...")
        
        data = {
            "inventory_items": self.generate_inventory_items(50),
            "suppliers": self.generate_suppliers_data(),
            "equipment": self.generate_equipment_data(),
            "bid_requests": self.generate_bid_requests(10),
            "maintenance_tasks": self.generate_maintenance_tasks(15),
            "inventory_transactions": self.generate_inventory_transactions(100),
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "total_items": 50,
                "total_suppliers": len(self.suppliers),
                "total_equipment": len(self.equipment_types),
                "description": "Comprehensive synthetic data for MedInventory testing"
            }
        }
        
        print("✅ Synthetic data generated successfully!")
        return data

def main():
    """Generate and save synthetic data"""
    generator = SyntheticDataGenerator()
    data = generator.generate_all_synthetic_data()
    
    # Save to JSON file
    output_file = "synthetic_data.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"📁 Data saved to: {output_file}")
    print(f"📊 Generated:")
    print(f"   • {len(data['inventory_items'])} inventory items")
    print(f"   • {len(data['suppliers'])} suppliers")
    print(f"   • {len(data['equipment'])} equipment units")
    print(f"   • {len(data['bid_requests'])} bid requests")
    print(f"   • {len(data['maintenance_tasks'])} maintenance tasks")
    print(f"   • {len(data['inventory_transactions'])} transactions")

if __name__ == "__main__":
    main()
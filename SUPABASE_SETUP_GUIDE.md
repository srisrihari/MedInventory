# 🗄️ Supabase Integration Setup Guide

## **Step 1: Create Supabase Account & Project**

### **1.1 Sign up for Supabase**
1. Go to https://supabase.com/
2. Click "Start your project" 
3. Sign up with GitHub/Google or email
4. Verify your email if needed

### **1.2 Create New Project**
1. Click "New Project"
2. **Organization**: Use your personal organization
3. **Project Name**: `medmanage-visionary`
4. **Database Password**: Choose a strong password (save it!)
5. **Region**: Choose closest to your location
6. Click "Create new project"
7. **Wait 2-3 minutes** for project creation

### **1.3 Get Project Credentials**
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## **Step 2: Configure Your Backend**

### **2.1 Update Environment Variables**
```bash
cd /home/sri/Documents/GitHub/medmanage-visionary/backend
```

Create/update `.env` file:
```bash
# Replace with YOUR actual Supabase credentials
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...YOUR_SERVICE_ROLE_KEY
```

### **2.2 Test Connection**
```bash
source venv/bin/activate
python3 -c "
from app.config import settings
print(f'URL: {settings.SUPABASE_URL}')
print(f'Key: {settings.SUPABASE_ANON_KEY[:20]}...')
"
```

---

## **Step 3: Create Database Tables**

### **3.1 Run SQL in Supabase Dashboard**
1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- Create inventory categories enum
CREATE TYPE inventory_status AS ENUM ('in_stock', 'low_stock', 'out_of_stock');
CREATE TYPE delivery_performance AS ENUM ('excellent', 'good', 'average', 'poor');
CREATE TYPE price_competitiveness AS ENUM ('high', 'medium', 'low');
CREATE TYPE equipment_status AS ENUM ('operational', 'maintenance', 'critical', 'offline');
CREATE TYPE bid_status AS ENUM ('draft', 'active', 'closed', 'awarded');

-- Inventory Items Table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'Units',
    batch_number VARCHAR(100),
    batch_id VARCHAR(50),
    expiry_date DATE,
    supplier_id UUID,
    price DECIMAL(10, 2),
    location VARCHAR(200),
    reorder_level INTEGER DEFAULT 0,
    status inventory_status NOT NULL DEFAULT 'in_stock',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suppliers Table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    whatsapp VARCHAR(50),
    address TEXT,
    rating DECIMAL(3, 2) DEFAULT 0.0,
    response_time_hours INTEGER DEFAULT 48,
    delivery_performance delivery_performance DEFAULT 'average',
    price_competitiveness price_competitiveness DEFAULT 'medium',
    on_time_delivery_rate DECIMAL(5, 2) DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Table
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    serial_number VARCHAR(100),
    install_date DATE,
    warranty_expiry DATE,
    status equipment_status NOT NULL DEFAULT 'operational',
    health_score INTEGER DEFAULT 100,
    utilization_rate DECIMAL(5, 2) DEFAULT 0.0,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bid Requests Table
CREATE TABLE bid_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    items JSONB NOT NULL DEFAULT '[]',
    quantity INTEGER NOT NULL,
    estimated_value DECIMAL(12, 2) NOT NULL,
    deadline DATE NOT NULL,
    status bid_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Transactions Table (for tracking add/subtract operations)
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- 'add', 'subtract'
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(100), -- 'purchase', 'usage', 'waste', etc.
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_expiry ON inventory_items(expiry_date);
CREATE INDEX idx_suppliers_status ON suppliers(status);
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_bid_requests_status ON bid_requests(status);
CREATE INDEX idx_inventory_transactions_item_id ON inventory_transactions(item_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bid_requests_updated_at BEFORE UPDATE ON bid_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

4. Click "Run" to execute the SQL
5. You should see "Success. No rows returned" message

### **3.2 Verify Table Creation**
1. Go to **Table Editor** in Supabase dashboard
2. You should see these tables:
   - `inventory_items`
   - `suppliers`
   - `equipment`
   - `bid_requests`
   - `inventory_transactions`

---

## **Step 4: Load Synthetic Data into Supabase**

### **4.1 Update Data Loading Script**
Create a new script to load data into real Supabase:

```bash
cd /home/sri/Documents/GitHub/medmanage-visionary/backend
```

I'll create this script for you next...

---

## **Step 5: Test Real Database Connection**

### **5.1 Update Backend to Use Real Database**
Once your credentials are set, the backend will automatically switch from mock to real database.

### **5.2 Restart Backend Server**
```bash
source venv/bin/activate
python3 start_server.py
```

### **5.3 Verify Connection**
Look for this log message:
```
INFO:app.database:✅ Using real Supabase database
```

Instead of:
```
INFO:app.database:🔄 Using mock database for testing
```

---

## **Step 6: Test Frontend Integration**

### **6.1 Test API Endpoints**
```bash
curl http://localhost:8000/api/inventory/items
```

Should return real data from Supabase instead of mock data.

### **6.2 Test Add/Subtract Operations**
1. Open frontend: http://localhost:8081
2. Go to Inventory page
3. Add/subtract stock - changes should persist in Supabase!

---

## **🎯 Success Indicators**

✅ **Supabase project created**  
✅ **Database tables created**  
✅ **Backend connects to real database**  
✅ **Synthetic data loaded**  
✅ **Frontend shows real data**  
✅ **Add/subtract operations persist**  

---

## **🚨 Need Help?**

**Common Issues:**
1. **Wrong credentials**: Double-check URL and keys
2. **Connection timeout**: Check internet connection
3. **SQL errors**: Make sure all SQL ran successfully
4. **Permission errors**: Use service_role key for admin operations

**Next Steps:**
1. Follow this guide step by step
2. Let me know when you complete each step
3. I'll help troubleshoot any issues
4. We'll then load synthetic data into your real database!

## **Ready to start? Let's begin with Step 1! 🚀**
# MedInventory Backend Architecture Plan

## 1. Project Structure
```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app
│   ├── config.py              # Settings and environment
│   ├── database.py            # Supabase connection
│   ├── models/                # Pydantic models
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── bidding.py
│   │   ├── equipment.py
│   │   └── user.py
│   ├── schemas/               # Database schemas
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── bidding.py
│   │   └── equipment.py
│   ├── api/                   # API routes
│   │   ├── __init__.py
│   │   ├── inventory.py
│   │   ├── bidding.py
│   │   ├── equipment.py
│   │   └── analytics.py
│   ├── services/              # Business logic
│   │   ├── __init__.py
│   │   ├── inventory_service.py
│   │   ├── bidding_service.py
│   │   ├── ai_agent_service.py
│   │   └── notification_service.py
│   ├── agents/                # AI Agents
│   │   ├── __init__.py
│   │   ├── email_agent.py
│   │   ├── whatsapp_agent.py
│   │   ├── decision_agent.py
│   │   └── communication_parser.py
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── email_utils.py
│       ├── whatsapp_utils.py
│       └── ai_utils.py
├── requirements.txt
├── .env
└── README.md
```

## 2. Database Schema (Supabase)

### Inventory Tables
```sql
-- inventory_items
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR NOT NULL,
    batch_number VARCHAR,
    batch_id VARCHAR,
    expiry_date DATE,
    supplier_id UUID REFERENCES suppliers(id),
    price DECIMAL(10,2),
    location VARCHAR,
    reorder_level INTEGER DEFAULT 0,
    status VARCHAR CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- inventory_transactions
CREATE TABLE inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID REFERENCES inventory_items(id),
    transaction_type VARCHAR CHECK (transaction_type IN ('add', 'subtract', 'adjust')),
    quantity INTEGER NOT NULL,
    reference_type VARCHAR, -- 'purchase', 'usage', 'adjustment', 'waste'
    reference_id UUID,
    notes TEXT,
    performed_by UUID, -- user_id
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Bidding System Tables
```sql
-- suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    whatsapp VARCHAR,
    address TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    response_time_hours INTEGER DEFAULT 48,
    delivery_performance VARCHAR DEFAULT 'good',
    price_competitiveness VARCHAR DEFAULT 'medium',
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    status VARCHAR DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- bid_requests
CREATE TABLE bid_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    category VARCHAR NOT NULL,
    items JSONB NOT NULL, -- Array of items with specifications
    quantity INTEGER NOT NULL,
    estimated_value DECIMAL(12,2),
    deadline DATE NOT NULL,
    status VARCHAR DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'awarded')),
    created_by UUID, -- user_id
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- bids
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES bid_requests(id),
    supplier_id UUID REFERENCES suppliers(id),
    total_amount DECIMAL(12,2) NOT NULL,
    delivery_time_days INTEGER,
    valid_until DATE,
    status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    notes TEXT,
    ai_score DECIMAL(5,2), -- AI evaluation score
    ai_recommendation TEXT,
    submitted_via VARCHAR DEFAULT 'email', -- 'email', 'whatsapp', 'manual'
    raw_communication TEXT, -- Original email/message content
    parsed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ai_agent_logs
CREATE TABLE ai_agent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_type VARCHAR NOT NULL, -- 'email', 'whatsapp', 'decision', 'parser'
    action VARCHAR NOT NULL,
    reference_type VARCHAR, -- 'bid_request', 'bid', 'supplier'
    reference_id UUID,
    input_data JSONB,
    output_data JSONB,
    status VARCHAR DEFAULT 'success',
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Equipment Management Tables
```sql
-- equipment
CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    manufacturer VARCHAR,
    model VARCHAR,
    serial_number VARCHAR UNIQUE,
    install_date DATE,
    warranty_expiry DATE,
    status VARCHAR DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'critical', 'offline')),
    health_score INTEGER DEFAULT 100,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    last_maintenance DATE,
    next_maintenance DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- equipment_sensors
CREATE TABLE equipment_sensors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id),
    sensor_type VARCHAR NOT NULL, -- 'temperature', 'vibration', 'power', 'pressure'
    current_value DECIMAL(10,3),
    unit VARCHAR,
    normal_min DECIMAL(10,3),
    normal_max DECIMAL(10,3),
    warning_min DECIMAL(10,3),
    warning_max DECIMAL(10,3),
    critical_min DECIMAL(10,3),
    critical_max DECIMAL(10,3),
    last_reading TIMESTAMP,
    status VARCHAR DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'critical')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- maintenance_tasks
CREATE TABLE maintenance_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id),
    task_type VARCHAR CHECK (task_type IN ('preventive', 'corrective', 'emergency')),
    priority VARCHAR CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR NOT NULL,
    description TEXT,
    assigned_to UUID, -- user_id
    scheduled_date DATE,
    estimated_duration_hours INTEGER,
    status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'overdue')),
    completed_date DATE,
    actual_duration_hours INTEGER,
    notes TEXT,
    cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ai_predictions
CREATE TABLE ai_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    equipment_id UUID REFERENCES equipment(id),
    prediction_type VARCHAR NOT NULL, -- 'failure', 'maintenance', 'performance'
    risk_level VARCHAR CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    predicted_date DATE,
    confidence_score DECIMAL(5,2),
    recommendation TEXT,
    ai_insight TEXT,
    model_version VARCHAR,
    input_features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 3. AI Agent Workflow Implementation

### Email Agent Workflow
```python
# agents/email_agent.py
class EmailAgent:
    async def send_bid_request(self, bid_request_id: str, suppliers: List[Supplier]):
        """Send bid request emails to all relevant suppliers"""
        
    async def parse_supplier_response(self, email_content: str):
        """Parse supplier email responses using AI"""
        
    async def send_confirmation(self, bid_id: str, action: str):
        """Send confirmation emails after decision"""
```

### WhatsApp Agent Workflow
```python
# agents/whatsapp_agent.py
class WhatsAppAgent:
    async def send_bid_notification(self, phone: str, bid_details: dict):
        """Send WhatsApp notifications about bid requests"""
        
    async def handle_whatsapp_response(self, message: str, sender: str):
        """Handle and parse WhatsApp responses"""
```

### Decision Making Agent
```python
# agents/decision_agent.py
class DecisionAgent:
    async def evaluate_bid(self, bid: Bid, criteria: dict) -> dict:
        """AI-powered bid evaluation with scoring"""
        
    async def recommend_action(self, bid_id: str) -> str:
        """Recommend accept/reject based on analysis"""
        
    async def generate_insights(self, all_bids: List[Bid]) -> str:
        """Generate insights for decision making"""
```

## 4. Core Services

### Inventory Service
```python
# services/inventory_service.py
class InventoryService:
    async def add_inventory(self, item_id: str, quantity: int, reference: str):
        """Add inventory with transaction logging"""
        
    async def subtract_inventory(self, item_id: str, quantity: int, reference: str):
        """Subtract inventory with validation"""
        
    async def check_reorder_levels(self):
        """Check and trigger reorder alerts"""
        
    async def update_stock_status(self, item_id: str):
        """Update stock status based on quantity"""
```

### Bidding Service
```python
# services/bidding_service.py
class BiddingService:
    async def create_bid_request(self, request_data: dict) -> str:
        """Create bid request and trigger AI agents"""
        
    async def process_supplier_response(self, communication_data: dict):
        """Process and store supplier responses"""
        
    async def execute_decision(self, bid_id: str, decision: bool):
        """Execute accept/reject decision with AI confirmation"""
```

## 5. API Endpoints Structure

### Inventory API
```python
# api/inventory.py
@router.get("/items")
async def get_inventory_items(skip: int = 0, limit: int = 100)

@router.post("/items")
async def create_inventory_item(item: InventoryItemCreate)

@router.put("/items/{item_id}/quantity")
async def update_inventory_quantity(item_id: str, transaction: InventoryTransaction)

@router.get("/items/{item_id}/transactions")
async def get_inventory_transactions(item_id: str)
```

### Bidding API
```python
# api/bidding.py
@router.post("/requests")
async def create_bid_request(request: BidRequestCreate)

@router.get("/requests/{request_id}/bids")
async def get_request_bids(request_id: str)

@router.post("/bids/{bid_id}/decide")
async def make_bid_decision(bid_id: str, decision: BidDecision)

@router.post("/webhook/email")
async def handle_email_webhook(email_data: dict)

@router.post("/webhook/whatsapp")
async def handle_whatsapp_webhook(message_data: dict)
```

## 6. Technology Stack

### Core Backend
- **FastAPI** - Modern, fast web framework
- **Supabase-py** - Database client
- **Pydantic** - Data validation
- **SQLAlchemy** - ORM (optional, for complex queries)

### AI & Communication
- **OpenAI** - GPT for decision making and parsing
- **LangChain** - AI agent orchestration
- **Celery** - Background task processing
- **Redis** - Task queue and caching

### Communication
- **smtplib** - Email sending
- **Twilio** - WhatsApp integration
- **Mailgun/SendGrid** - Email service
- **Webhook handlers** - Incoming communications

### Monitoring & Utils
- **Loguru** - Logging
- **Prometheus** - Metrics
- **APScheduler** - Scheduled tasks
- **Pandas** - Data processing

## 7. Development Priority

1. **Phase 1**: Database setup + Basic CRUD APIs
2. **Phase 2**: Inventory add/subtract functionality
3. **Phase 3**: Bidding system without AI
4. **Phase 4**: AI agent integration
5. **Phase 5**: Equipment monitoring
6. **Phase 6**: Advanced analytics
# MedInventory Backend Implementation Roadmap

## Priority 1: Foundation (Week 1)
**Goal**: Set up backend infrastructure and database

### Day 1-2: Project Setup
- [ ] Initialize FastAPI project with proper structure
- [ ] Set up Supabase database connection
- [ ] Create environment configuration
- [ ] Set up basic CORS and middleware

### Day 3-5: Database Schema
- [ ] Create all core tables in Supabase
- [ ] Set up inventory_items and inventory_transactions tables
- [ ] Create suppliers and bidding system tables
- [ ] Add equipment and maintenance tables
- [ ] Insert sample data for testing

### Day 6-7: Basic API Structure
- [ ] Create Pydantic models for all entities
- [ ] Set up basic CRUD endpoints for inventory
- [ ] Test database connections and basic operations

## Priority 2: Inventory Management with Real Data (Week 2)
**Goal**: Replace frontend mock data with real inventory system

### Core Inventory APIs
```python
# Priority endpoints to implement first:

POST /api/inventory/items          # Create new inventory item
GET  /api/inventory/items          # List all items with filters
PUT  /api/inventory/items/{id}     # Update item details
DELETE /api/inventory/items/{id}   # Delete item

# Your specific requirements:
POST /api/inventory/items/{id}/add-stock     # Add inventory quantity
POST /api/inventory/items/{id}/subtract-stock # Subtract inventory quantity
GET  /api/inventory/items/{id}/transactions  # Get transaction history
```

### Frontend Integration Tasks
- [ ] Replace mock data in Inventory.tsx with API calls
- [ ] Implement add/subtract inventory functionality
- [ ] Add real-time stock level updates
- [ ] Handle loading states and errors properly
- [ ] Add optimistic updates for better UX

## Priority 3: Basic Bidding System (Week 3)
**Goal**: Implement bidding system foundation (without AI initially)

### Bidding System APIs
```python
# Core bidding endpoints:
POST /api/bidding/requests         # Create bid request
GET  /api/bidding/requests         # List bid requests
GET  /api/bidding/requests/{id}/bids # Get bids for request
POST /api/bidding/bids             # Submit bid (manual initially)
PUT  /api/bidding/bids/{id}/status # Accept/reject bid
```

### Manual Bidding Flow (Before AI)
- [ ] Create bid request manually
- [ ] Store supplier information
- [ ] Manual bid entry system
- [ ] Basic bid comparison interface
- [ ] Manual decision making

## Priority 4: AI Agent Integration (Week 4-5)
**Goal**: Implement your specific AI agent workflow

### AI Agent Architecture
```python
# Your specific AI workflow:

1. Bid Request Generation → AI Email Agent
   ↓
2. AI Agent sends emails to all relevant suppliers
   ↓  
3. AI Agent monitors email responses + WhatsApp
   ↓
4. AI parses supplier responses and creates bid entries
   ↓
5. Decision Making Agent evaluates all bids
   ↓
6. Present AI recommendations with Yes/No options
   ↓
7. After user selection, AI Agent confirms with supplier
```

### Implementation Steps
- [ ] Set up OpenAI/Anthropic integration
- [ ] Create Email Agent for sending bid requests
- [ ] Set up email webhook for receiving responses
- [ ] Create Communication Parser Agent
- [ ] Implement WhatsApp integration (Twilio)
- [ ] Build Decision Making Agent
- [ ] Create confirmation workflow

### AI Agent Services
```python
# agents/email_agent.py
class EmailAgent:
    async def send_bid_request_to_suppliers(self, bid_request_id: str):
        # Your requirement: "AI agent will send emails to all"
        suppliers = await get_relevant_suppliers(bid_request_id)
        for supplier in suppliers:
            await self.send_personalized_bid_email(supplier, bid_request_id)
    
    async def parse_supplier_email_response(self, email_content: str):
        # Your requirement: "getting details through mail"
        parsed_bid = await ai_parse_bid_response(email_content)
        return await create_bid_from_parsed_data(parsed_bid)

# agents/whatsapp_agent.py  
class WhatsAppAgent:
    async def handle_whatsapp_bid_response(self, message: str, sender: str):
        # Your requirement: "communicate through whatsapp"
        parsed_response = await ai_parse_whatsapp_message(message)
        return await process_whatsapp_bid(parsed_response, sender)

# agents/decision_agent.py
class DecisionAgent:
    async def evaluate_all_bids(self, bid_request_id: str):
        # Your requirement: "decision making agent in received bids"
        bids = await get_bids_for_request(bid_request_id)
        analysis = await ai_analyze_bids(bids)
        return {
            "recommended_bid": analysis.best_bid,
            "reasoning": analysis.explanation,
            "alternatives": analysis.alternatives
        }
    
    async def confirm_selection(self, bid_id: str, user_decision: bool):
        # Your requirement: "yes and no option then agent confirms"
        if user_decision:
            await self.send_acceptance_email(bid_id)
            await self.notify_other_suppliers_rejection(bid_id)
        else:
            await self.request_clarification(bid_id)
```

## Priority 5: Equipment Management (Week 6)
**Goal**: Implement predictive maintenance system

### Equipment APIs
- [ ] Equipment CRUD operations
- [ ] Sensor data ingestion
- [ ] Maintenance task management
- [ ] AI prediction algorithms

## Implementation Commands & Setup

### 1. Backend Setup Commands
```bash
# Create backend directory
mkdir backend && cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn supabase python-dotenv
pip install openai langchain celery redis
pip install twilio sendgrid
pip install pandas numpy python-multipart
pip install loguru APScheduler

# Create requirements.txt
pip freeze > requirements.txt
```

### 2. Environment Variables (.env)
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key

# AI Configuration  
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Communication Services
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=your_whatsapp_number

SENDGRID_API_KEY=your_sendgrid_key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_password

# Redis (for Celery)
REDIS_URL=redis://localhost:6379

# Application
APP_ENV=development
SECRET_KEY=your_secret_key
```

### 3. Initial Project Structure Creation
```bash
mkdir -p app/{models,schemas,api,services,agents,utils}
touch app/__init__.py app/main.py app/config.py app/database.py
touch app/models/__init__.py app/schemas/__init__.py 
touch app/api/__init__.py app/services/__init__.py
touch app/agents/__init__.py app/utils/__init__.py
```

## Testing Strategy

### 1. Phase Testing
- **Phase 1**: Test basic CRUD operations with Postman
- **Phase 2**: Test inventory add/subtract with frontend
- **Phase 3**: Test bidding workflow manually
- **Phase 4**: Test AI agents with mock emails/WhatsApp
- **Phase 5**: End-to-end testing with real suppliers

### 2. AI Agent Testing
```python
# Test AI agents independently
async def test_email_agent():
    agent = EmailAgent()
    test_bid_request = create_test_bid_request()
    await agent.send_bid_request_to_suppliers(test_bid_request.id)

async def test_decision_agent():
    agent = DecisionAgent()
    test_bids = create_test_bids()
    recommendation = await agent.evaluate_all_bids(test_bids[0].request_id)
    assert recommendation.recommended_bid is not None
```

## Next Steps

1. **Choose this roadmap path** - Start with Priority 1 foundation
2. **Set up development environment** - Python, FastAPI, Supabase
3. **Create database schema** - Run the SQL scripts in Supabase
4. **Implement basic inventory APIs** - Replace mock data systematically
5. **Build AI agent architecture** - Your specific email/WhatsApp workflow

Would you like me to start implementing any specific part of this roadmap? I recommend beginning with the database setup and basic inventory APIs to get immediate results with your existing frontend.
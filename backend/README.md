# MedInventory Backend API

AI-powered healthcare supply chain optimization platform backend built with FastAPI and Supabase.

## 🚀 Quick Start

### 1. Setup Environment

```bash
# For Ubuntu/Linux users, use python3
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Ubuntu/Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install minimal dependencies first (recommended)
pip install -r requirements-minimal.txt

# OR install all dependencies (includes optional AI/communication tools)
# pip install -r requirements.txt
```

### 2. Database Setup

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and API keys
3. Run the database initialization script in Supabase SQL Editor:
   ```sql
   -- Copy and paste the contents of init_database.sql
   ```

### 3. Environment Configuration

1. Copy the environment template:
   ```bash
   cp env_template.txt .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 4. Start the Server

```bash
# Development mode (with auto-reload)
python3 start_server.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 📋 API Endpoints

### Inventory Management
- `GET /api/inventory/items` - Get inventory items with pagination/filtering
- `POST /api/inventory/items` - Create new inventory item
- `PUT /api/inventory/items/{id}` - Update inventory item
- `DELETE /api/inventory/items/{id}` - Delete inventory item
- `POST /api/inventory/items/{id}/add-stock` - **Add inventory stock**
- `POST /api/inventory/items/{id}/subtract-stock` - **Subtract inventory stock**

### Bidding System  
- `GET /api/bidding/requests` - Get bid requests
- `POST /api/bidding/requests` - Create bid request (triggers AI agents)
- `GET /api/bidding/requests/{id}/bids` - Get bids for request
- `POST /api/bidding/bids/{id}/decide` - Accept/reject bid (triggers AI confirmation)

### Equipment Management
- `GET /api/equipment/` - Get equipment with filtering
- Equipment health monitoring and predictive maintenance

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard metrics

## 🤖 AI Agent Workflow

The system implements your specific AI agent requirements:

### 1. Bid Request Creation
```python
# When a bid request is created
POST /api/bidding/requests
# → Triggers AI Email Agent to send emails to all relevant suppliers
```

### 2. Supplier Communication
```python
# AI agents handle responses via:
POST /api/bidding/webhook/email     # Email responses
POST /api/bidding/webhook/whatsapp  # WhatsApp responses
```

### 3. Decision Making
```python
# AI evaluates bids and provides recommendations
POST /api/bidding/bids/{id}/decide
# → Triggers AI Confirmation Agent to notify suppliers
```

## 🗄️ Database Schema

The system uses the following main tables:

- **inventory_items** - Product inventory with batch tracking
- **inventory_transactions** - All add/subtract operations
- **suppliers** - Supplier information and ratings
- **bid_requests** - Procurement bid requests
- **bids** - Supplier bid responses
- **equipment** - Equipment monitoring
- **ai_agent_logs** - AI agent action logging

## 🔧 Core Features Implementation

### Inventory Add/Subtract (Your Requirement)
```python
# Add stock
POST /api/inventory/items/{id}/add-stock?quantity=100&reference_type=purchase

# Subtract stock  
POST /api/inventory/items/{id}/subtract-stock?quantity=50&reference_type=usage
```

### AI Bidding Workflow (Your Requirement)
1. Create bid request → AI sends emails to suppliers
2. AI monitors email/WhatsApp responses
3. AI parses responses and creates bid entries
4. AI provides decision recommendations
5. User selects yes/no → AI confirms with suppliers

## 🚀 Frontend Integration

Replace your frontend mock data by updating the API base URL:

```typescript
// In your React app
const API_BASE_URL = 'http://localhost:8000/api';

// Replace mock inventory calls
const getInventoryItems = async () => {
  const response = await fetch(`${API_BASE_URL}/inventory/items`);
  return response.json();
};

// Add/subtract inventory
const addInventoryStock = async (itemId: string, quantity: number) => {
  const response = await fetch(
    `${API_BASE_URL}/inventory/items/${itemId}/add-stock?quantity=${quantity}`,
    { method: 'POST' }
  );
  return response.json();
};
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest

# Test specific endpoint
curl http://localhost:8000/api/inventory/items
```

## 📚 Development

### Project Structure
```
backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── config.py         # Settings
│   ├── database.py       # Supabase connection
│   ├── models/           # Pydantic models
│   ├── api/              # API endpoints
│   ├── services/         # Business logic
│   └── agents/           # AI agents (future)
├── requirements.txt      # Dependencies
├── init_database.sql     # Database schema
└── start_server.py       # Server startup
```

### Adding New Features

1. **Create Pydantic models** in `app/models/`
2. **Add database operations** in `app/database.py`
3. **Create API endpoints** in `app/api/`
4. **Update database schema** in `init_database.sql`

## 🤖 Next Steps: AI Agent Implementation

After the basic backend is working:

1. **Email Agent**: Implement actual email sending with OpenAI parsing
2. **WhatsApp Agent**: Integrate Twilio for WhatsApp communication
3. **Decision Agent**: Build AI-powered bid evaluation
4. **Background Tasks**: Add Celery for async AI processing

## 🐛 Troubleshooting

### Common Issues

1. **"Command 'python' not found" Error**
   ```bash
   # Use python3 instead of python on Ubuntu/Linux
   python3 -m venv venv
   python3 start_server.py
   ```

2. **"Could not find a version that satisfies the requirement supabase==1.3.0"**
   ```bash
   # Use the minimal requirements file first
   pip install -r requirements-minimal.txt
   # This includes the correct supabase version (2.17.0)
   ```

3. **"ModuleNotFoundError: No module named 'uvicorn'"**
   ```bash
   # Make sure virtual environment is activated and dependencies installed
   source venv/bin/activate
   pip install -r requirements-minimal.txt
   ```

4. **Database Connection Failed**
   - Check Supabase URL and keys in `.env`
   - Ensure database schema is created

5. **Import Errors**
   - Activate virtual environment: `source venv/bin/activate`
   - Install requirements: `pip install -r requirements-minimal.txt`

6. **CORS Issues**
   - Frontend URL is configured in `app/main.py` CORS settings

### Quick Fix Commands
```bash
# Complete reset if having issues
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-minimal.txt
python3 start_server.py
```

### Logs
The API logs all operations. Check console output for debugging information.

## 📞 Support

For implementation questions or issues, check:
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health
- **Logs**: Console output when running the server
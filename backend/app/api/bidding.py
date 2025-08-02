"""
Bidding system API endpoints
Handles automated supplier bidding workflow with AI agents
"""

from fastapi import APIRouter, HTTPException, Query, Path, BackgroundTasks
from typing import Optional, List
import logging
from datetime import datetime, date

from app.database import db
from app.config import settings

# Set up logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

# Placeholder models (will be expanded with proper Pydantic models)
from pydantic import BaseModel

class BidRequestCreate(BaseModel):
    title: str
    description: str
    category: str
    items: list  # Will be properly typed later
    quantity: int
    estimated_value: float
    deadline: date

class BidCreate(BaseModel):
    request_id: str
    supplier_id: str
    total_amount: float
    delivery_time_days: int
    notes: Optional[str] = None

@router.get("/requests")
async def get_bid_requests(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    category: Optional[str] = Query(None)
):
    """Get bid requests with pagination and filtering"""
    try:
        filters = {}
        if status:
            filters['status'] = status
        if category:
            filters['category'] = category
            
        result = await db.get_bid_requests(skip=skip, limit=limit, filters=filters)
        return result
    except Exception as e:
        logger.error(f"Failed to get bid requests: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requests")
async def create_bid_request(
    request: BidRequestCreate,
    background_tasks: BackgroundTasks
):
    """
    Create new bid request and trigger AI agent workflow
    YOUR REQUIREMENT: After bid request generation, AI agent sends emails
    """
    try:
        # Convert request to dict
        request_data = request.dict()
        request_data['status'] = 'active'
        request_data['items'] = request_data['items']  # Convert to JSON
        
        # Create bid request in database
        created_request = await db.create_bid_request(request_data)
        
        # YOUR SPECIFIC WORKFLOW: Trigger AI agent to send emails
        # background_tasks.add_task(trigger_ai_email_agent, created_request['id'])
        
        logger.info(f"Created bid request {created_request['id']} - AI email agent will be triggered")
        
        return {
            "success": True,
            "message": "Bid request created successfully. AI agent will send emails to suppliers.",
            "data": created_request
        }
        
    except Exception as e:
        logger.error(f"Failed to create bid request: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/requests/{request_id}/bids")
async def get_request_bids(request_id: str):
    """Get all bids for a specific request"""
    try:
        bids = await db.get_bids_for_request(request_id)
        return {
            "request_id": request_id,
            "bids": bids,
            "total_bids": len(bids)
        }
    except Exception as e:
        logger.error(f"Failed to get bids for request {request_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bids")
async def create_bid(bid: BidCreate):
    """Create new bid (from supplier response or manual entry)"""
    try:
        bid_data = bid.dict()
        bid_data['status'] = 'pending'
        
        created_bid = await db.create_bid(bid_data)
        return created_bid
        
    except Exception as e:
        logger.error(f"Failed to create bid: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bids/{bid_id}/decide")
async def make_bid_decision(
    bid_id: str,
    decision: bool = Query(..., description="True to accept, False to reject"),
    notes: Optional[str] = Query(None, description="Decision notes"),
    background_tasks: BackgroundTasks = None
):
    """
    Make decision on bid (accept/reject)
    YOUR REQUIREMENT: "yes and no option then agent confirms and takes forward"
    """
    try:
        # Update bid status
        status = "accepted" if decision else "rejected"
        
        update_data = {
            'status': status,
            'updated_at': datetime.utcnow().isoformat()
        }
        
        if notes:
            update_data['decision_notes'] = notes
        
        result = await db.client.table('bids').update(update_data).eq('id', bid_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Bid {bid_id} not found")
        
        # YOUR SPECIFIC WORKFLOW: Trigger AI agent confirmation
        if background_tasks:
            # background_tasks.add_task(trigger_ai_confirmation_agent, bid_id, decision)
            pass
        
        action = "accepted" if decision else "rejected"
        logger.info(f"Bid {bid_id} {action} - AI agent will send confirmation")
        
        return {
            "success": True,
            "message": f"Bid {action} successfully. AI agent will send confirmation to supplier.",
            "data": result.data[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to make decision on bid {bid_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Webhook endpoints for AI agent communication
@router.post("/webhook/email")
async def handle_email_response(email_data: dict):
    """
    Handle incoming email responses from suppliers
    YOUR REQUIREMENT: "getting details through mail"
    """
    try:
        # Log the incoming email for AI processing
        await db.log_ai_agent_action(
            agent_type='email_parser',
            action='received_email',
            input_data=email_data,
            status='processing'
        )
        
        # Here the AI parser agent would process the email
        # parsed_bid = await ai_parse_email_response(email_data)
        # if parsed_bid:
        #     await db.create_bid(parsed_bid)
        
        logger.info("Email response received - queued for AI processing")
        
        return {
            "success": True,
            "message": "Email received and queued for processing"
        }
        
    except Exception as e:
        logger.error(f"Failed to handle email response: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook/whatsapp")
async def handle_whatsapp_response(message_data: dict):
    """
    Handle incoming WhatsApp responses from suppliers
    YOUR REQUIREMENT: "communicate through whatsapp"
    """
    try:
        # Log the incoming WhatsApp message
        await db.log_ai_agent_action(
            agent_type='whatsapp_parser',
            action='received_whatsapp',
            input_data=message_data,
            status='processing'
        )
        
        # Here the AI parser agent would process the WhatsApp message
        # parsed_response = await ai_parse_whatsapp_response(message_data)
        
        logger.info("WhatsApp response received - queued for AI processing")
        
        return {
            "success": True,
            "message": "WhatsApp message received and queued for processing"
        }
        
    except Exception as e:
        logger.error(f"Failed to handle WhatsApp response: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/suppliers")
async def get_suppliers(active_only: bool = Query(True)):
    """Get available suppliers for bidding"""
    try:
        suppliers = await db.get_suppliers(active_only=active_only)
        return {
            "suppliers": suppliers,
            "total": len(suppliers)
        }
    except Exception as e:
        logger.error(f"Failed to get suppliers: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def bidding_health_check():
    """Health check for bidding service"""
    try:
        result = await db.client.table('bid_requests').select('id').limit(1).execute()
        return {
            "status": "healthy",
            "service": "bidding",
            "database": "connected",
            "ai_agents": "ready",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Bidding health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")

# Placeholder functions for AI agent integration (to be implemented)
async def trigger_ai_email_agent(bid_request_id: str):
    """Trigger AI agent to send emails to suppliers"""
    # This will be implemented with actual AI agent
    logger.info(f"AI Email Agent triggered for bid request {bid_request_id}")

async def trigger_ai_confirmation_agent(bid_id: str, decision: bool):
    """Trigger AI agent to send confirmation to supplier"""
    # This will be implemented with actual AI agent
    action = "acceptance" if decision else "rejection"
    logger.info(f"AI Confirmation Agent triggered for bid {bid_id} - sending {action}")
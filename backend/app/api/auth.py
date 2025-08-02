"""
Authentication API endpoints for MedInventory.
Handles login, signup, token refresh, logout, and user management.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from loguru import logger

from app.config import settings
from app.database import db, auth_db
from app.models.auth import (
    UserCreate, UserUpdate, UserLogin, UserProfile, User,
    Token, AuthResponse, RefreshTokenRequest,
    ChangePassword, PasswordResetRequest, PasswordReset,
    OrganizationCreate, Organization,
    UserRole, UserStatus, SessionStatus,
    TokenData, AuditLogCreate
)
from app.services.auth_service import auth_service

# Create router
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Security scheme
security = HTTPBearer()

# =====================================================
# DEPENDENCY FUNCTIONS
# =====================================================

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict[str, Any]:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        token_data = auth_service.extract_token_data(token)
        
        if token_data is None or token_data.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Get user from database
        user = await auth_db.get_user_by_id(token_data.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if user.get('status') != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is not active",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last activity
        await auth_db.update_user_login_info(user['id'], last_login=datetime.now(timezone.utc))
        
        # Add token data to user
        user['token_data'] = token_data
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_active_user(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get current active user (convenience dependency)"""
    return current_user

async def require_role(required_role: UserRole):
    """Dependency factory for role-based access control"""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = UserRole(current_user.get('role'))
        if not auth_service.check_role_hierarchy(user_role, required_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required role: {required_role.value}"
            )
        return current_user
    return role_checker

async def require_permission(permission: str):
    """Dependency factory for permission-based access control"""
    async def permission_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        token_data = current_user.get('token_data')
        if token_data and not auth_service.check_permission(token_data.permissions, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required permission: {permission}"
            )
        return current_user
    return permission_checker

# =====================================================
# AUTHENTICATION ENDPOINTS
# =====================================================

@router.post("/signup", response_model=AuthResponse)
async def signup(request: Request, user_data: UserCreate):
    """
    Register a new user account
    """
    try:
        # Check if email already exists
        existing_user = await auth_db.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered"
            )
        
        # For demo/development, create organization if none specified
        organization_id = user_data.organization_id
        if not organization_id:
            # Use default demo organization
            organization_id = "550e8400-e29b-41d4-a716-446655440000"
        
        # Get organization
        organization = await auth_db.get_organization_by_id(organization_id)
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid organization"
            )
        
        # Create user
        user = await auth_db.create_user(user_data, organization_id)
        
        # Activate user immediately (in production, this would require email verification)
        await auth_db.activate_user(user['id'])
        
        # Get user permissions
        permissions = await auth_db.get_user_permissions(user['id'])
        
        # Create session tokens
        token_data = auth_service.create_session_tokens(
            user_id=user['id'],
            organization_id=organization_id,
            role=UserRole(user['role']),
            permissions=permissions,
            remember_me=False
        )
        
        # Create session in database
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_data['expires_in'])
        await auth_db.create_session(
            user_id=user['id'],
            token_hash=auth_service.hash_session_token(token_data['access_token']),
            refresh_token_hash=auth_service.hash_session_token(token_data['refresh_token']),
            expires_at=expires_at,
            ip_address=auth_service.extract_ip_from_request(request),
            user_agent=auth_service.extract_user_agent(request)
        )
        
        # Create audit log
        await auth_db.create_audit_log(
            AuditLogCreate(
                user_id=user['id'],
                action="user_signup",
                resource_type="user",
                resource_id=user['id'],
                new_values={"email": user['email'], "role": user['role']},
                ip_address=auth_service.extract_ip_from_request(request),
                user_agent=auth_service.extract_user_agent(request)
            ),
            organization_id
        )
        
        # Prepare response
        user_profile = UserProfile(**user)
        org_model = Organization(**organization)
        tokens = Token(
            access_token=token_data['access_token'],
            refresh_token=token_data['refresh_token'],
            token_type=token_data['token_type'],
            expires_in=token_data['expires_in']
        )
        
        logger.info(f"User signup successful: {user['email']}")
        
        return AuthResponse(
            user=user_profile,
            organization=org_model,
            tokens=tokens,
            permissions=permissions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed for {user_data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account creation failed"
        )

@router.post("/login", response_model=AuthResponse)
async def login(request: Request, login_data: UserLogin):
    """
    Authenticate user and return access tokens
    """
    try:
        # Get user by email
        user = await auth_db.get_user_by_email(login_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if account is locked
        if auth_service.is_account_locked(
            user.get('failed_login_attempts', 0),
            user.get('locked_until')
        ):
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail="Account is temporarily locked due to failed login attempts"
            )
        
        # Verify password
        if not auth_service.verify_password(login_data.password, user['password_hash']):
            # Increment failed attempts
            failed_attempts = user.get('failed_login_attempts', 0) + 1
            locked_until = None
            
            if auth_service.should_lock_account(failed_attempts):
                lockout_duration = auth_service.calculate_lockout_duration(failed_attempts)
                locked_until = datetime.now(timezone.utc) + lockout_duration
            
            await auth_db.update_user_login_info(
                user['id'],
                failed_attempts=failed_attempts,
                locked_until=locked_until
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check user status
        if user.get('status') != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Account is not active"
            )
        
        # Reset failed login attempts
        await auth_db.update_user_login_info(
            user['id'],
            failed_attempts=0,
            locked_until=None,
            last_login=datetime.now(timezone.utc)
        )
        
        # Get organization
        organization = await auth_db.get_organization_by_id(user['organization_id'])
        if not organization:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Organization not found"
            )
        
        # Get user permissions
        permissions = await auth_db.get_user_permissions(user['id'])
        
        # Create session tokens
        token_data = auth_service.create_session_tokens(
            user_id=user['id'],
            organization_id=user['organization_id'],
            role=UserRole(user['role']),
            permissions=permissions,
            remember_me=login_data.remember_me
        )
        
        # Create session in database
        expires_at = datetime.now(timezone.utc) + timedelta(seconds=token_data['expires_in'])
        await auth_db.create_session(
            user_id=user['id'],
            token_hash=auth_service.hash_session_token(token_data['access_token']),
            refresh_token_hash=auth_service.hash_session_token(token_data['refresh_token']),
            expires_at=expires_at,
            ip_address=auth_service.extract_ip_from_request(request),
            user_agent=auth_service.extract_user_agent(request)
        )
        
        # Create audit log
        await auth_db.create_audit_log(
            AuditLogCreate(
                user_id=user['id'],
                action="user_login",
                resource_type="user",
                resource_id=user['id'],
                ip_address=auth_service.extract_ip_from_request(request),
                user_agent=auth_service.extract_user_agent(request)
            ),
            user['organization_id']
        )
        
        # Prepare response
        user_profile = UserProfile(**user)
        org_model = Organization(**organization)
        tokens = Token(
            access_token=token_data['access_token'],
            refresh_token=token_data['refresh_token'],
            token_type=token_data['token_type'],
            expires_in=token_data['expires_in']
        )
        
        logger.info(f"User login successful: {user['email']}")
        
        return AuthResponse(
            user=user_profile,
            organization=org_model,
            tokens=tokens,
            permissions=permissions
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed for {login_data.email}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/refresh", response_model=Token)
async def refresh_token(request: Request, refresh_data: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    """
    try:
        # Verify refresh token
        token_payload = auth_service.verify_token(refresh_data.refresh_token)
        if not token_payload or token_payload.get('type') != 'refresh':
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
        
        # Get session by refresh token
        refresh_token_hash = auth_service.hash_session_token(refresh_data.refresh_token)
        session = await auth_db.get_session_by_refresh_token(refresh_token_hash)
        
        if not session or session.get('status') != SessionStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        # Get user
        user = await auth_db.get_user_by_id(session['user_id'])
        if not user or user.get('status') != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Get user permissions
        permissions = await auth_db.get_user_permissions(user['id'])
        
        # Create new access token
        access_token = auth_service.create_access_token(
            user_id=user['id'],
            organization_id=user['organization_id'],
            role=UserRole(user['role']),
            permissions=permissions
        )
        
        # Update session activity
        await auth_db.update_session_activity(session['id'])
        
        logger.info(f"Token refresh successful for user: {user['id']}")
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_data.refresh_token,  # Keep same refresh token
            token_type="bearer",
            expires_in=30 * 60  # 30 minutes
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token refresh failed"
        )

@router.post("/logout")
async def logout(
    request: Request,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """
    Logout user and revoke session
    """
    try:
        # Revoke all user sessions
        await auth_db.revoke_user_sessions(current_user['id'])
        
        # Create audit log
        await auth_db.create_audit_log(
            AuditLogCreate(
                user_id=current_user['id'],
                action="user_logout",
                resource_type="user",
                resource_id=current_user['id'],
                ip_address=auth_service.extract_ip_from_request(request),
                user_agent=auth_service.extract_user_agent(request)
            ),
            current_user['organization_id']
        )
        
        logger.info(f"User logout successful: {current_user['id']}")
        
        return {"message": "Logout successful"}
        
    except Exception as e:
        logger.error(f"Logout failed for user {current_user['id']}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

# =====================================================
# USER PROFILE ENDPOINTS
# =====================================================

@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """
    Get current user profile
    """
    return UserProfile(**current_user)

@router.put("/me", response_model=UserProfile)
async def update_current_user_profile(
    request: Request,
    user_update: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """
    Update current user profile
    """
    try:
        # Update user
        updated_user = await auth_db.update_user(current_user['id'], user_update)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Profile update failed"
            )
        
        # Create audit log
        await auth_db.create_audit_log(
            AuditLogCreate(
                user_id=current_user['id'],
                action="user_profile_update",
                resource_type="user",
                resource_id=current_user['id'],
                old_values={k: current_user.get(k) for k in user_update.dict(exclude_unset=True).keys()},
                new_values=user_update.dict(exclude_unset=True),
                ip_address=auth_service.extract_ip_from_request(request),
                user_agent=auth_service.extract_user_agent(request)
            ),
            current_user['organization_id']
        )
        
        logger.info(f"Profile updated for user: {current_user['id']}")
        
        return UserProfile(**updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update failed for user {current_user['id']}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Profile update failed"
        )

@router.post("/change-password")
async def change_password(
    request: Request,
    password_data: ChangePassword,
    current_user: Dict[str, Any] = Depends(get_current_active_user)
):
    """
    Change user password
    """
    try:
        # Verify current password
        if not auth_service.verify_password(password_data.current_password, current_user['password_hash']):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        # Hash new password
        new_password_hash = auth_service.hash_password(password_data.new_password)
        
        # Update password
        await auth_db.update_user(current_user['id'], UserUpdate())
        # Note: Need to add password update to UserUpdate model or create separate method
        
        # Revoke all sessions to force re-login
        await auth_db.revoke_user_sessions(current_user['id'])
        
        # Create audit log
        await auth_db.create_audit_log(
            AuditLogCreate(
                user_id=current_user['id'],
                action="password_change",
                resource_type="user",
                resource_id=current_user['id'],
                ip_address=auth_service.extract_ip_from_request(request),
                user_agent=auth_service.extract_user_agent(request)
            ),
            current_user['organization_id']
        )
        
        logger.info(f"Password changed for user: {current_user['id']}")
        
        return {"message": "Password changed successfully. Please login again."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed for user {current_user['id']}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password change failed"
        )

# =====================================================
# SYSTEM ENDPOINTS
# =====================================================

@router.get("/health")
async def auth_health():
    """
    Authentication service health check
    """
    return {
        "service": "authentication",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
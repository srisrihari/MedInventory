"""
Authentication service for MedInventory.
Handles password hashing, JWT tokens, sessions, and user authentication.
"""

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt
from loguru import logger
import uuid

from app.config import settings
from app.models.auth import UserRole, UserStatus, SessionStatus, TokenData

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class AuthService:
    """Service class for authentication operations"""
    
    def __init__(self):
        self.secret_key = settings.SECRET_KEY
        self.algorithm = ALGORITHM
    
    # =====================================================
    # PASSWORD MANAGEMENT
    # =====================================================
    
    def hash_password(self, password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def generate_password_reset_token(self) -> str:
        """Generate a secure password reset token"""
        return secrets.token_urlsafe(32)
    
    def hash_token(self, token: str) -> str:
        """Hash a token for secure storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    # =====================================================
    # JWT TOKEN MANAGEMENT
    # =====================================================
    
    def create_access_token(
        self, 
        user_id: str, 
        organization_id: str,
        role: UserRole,
        permissions: List[str] = None,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {
            "sub": user_id,  # Subject (user ID)
            "org_id": organization_id,
            "role": role.value,
            "permissions": permissions or [],
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        }
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(
        self, 
        user_id: str, 
        organization_id: str,
        session_id: str,
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT refresh token"""
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode = {
            "sub": user_id,
            "org_id": organization_id,
            "session_id": session_id,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh"
        }
        
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            return None
    
    def extract_token_data(self, token: str) -> Optional[TokenData]:
        """Extract token data from JWT"""
        payload = self.verify_token(token)
        if payload is None:
            return None
        
        try:
            return TokenData(
                user_id=payload.get("sub"),
                organization_id=payload.get("org_id"),
                role=UserRole(payload.get("role")) if payload.get("role") else None,
                permissions=payload.get("permissions", [])
            )
        except Exception as e:
            logger.warning(f"Failed to extract token data: {e}")
            return None
    
    def is_token_expired(self, token: str) -> bool:
        """Check if token is expired"""
        payload = self.verify_token(token)
        if payload is None:
            return True
        
        exp = payload.get("exp")
        if exp is None:
            return True
        
        return datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc)
    
    # =====================================================
    # SESSION MANAGEMENT
    # =====================================================
    
    def generate_session_id(self) -> str:
        """Generate a unique session ID"""
        return str(uuid.uuid4())
    
    def create_session_tokens(
        self,
        user_id: str,
        organization_id: str,
        role: UserRole,
        permissions: List[str] = None,
        remember_me: bool = False
    ) -> Dict[str, Any]:
        """Create both access and refresh tokens for a session"""
        session_id = self.generate_session_id()
        
        # Adjust token expiration based on remember_me
        access_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS if remember_me else 1)
        
        access_token = self.create_access_token(
            user_id=user_id,
            organization_id=organization_id,
            role=role,
            permissions=permissions,
            expires_delta=access_expires
        )
        
        refresh_token = self.create_refresh_token(
            user_id=user_id,
            organization_id=organization_id,
            session_id=session_id,
            expires_delta=refresh_expires
        )
        
        return {
            "session_id": session_id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": int(access_expires.total_seconds()),
            "refresh_expires_in": int(refresh_expires.total_seconds())
        }
    
    def hash_session_token(self, token: str) -> str:
        """Hash session token for database storage"""
        return hashlib.sha256(token.encode()).hexdigest()
    
    # =====================================================
    # PERMISSION CHECKING
    # =====================================================
    
    def check_permission(self, user_permissions: List[str], required_permission: str) -> bool:
        """Check if user has required permission"""
        return required_permission in user_permissions
    
    def check_role_hierarchy(self, user_role: UserRole, required_role: UserRole) -> bool:
        """Check if user role has sufficient privileges"""
        role_hierarchy = {
            UserRole.SUPER_ADMIN: 9,
            UserRole.HOSPITAL_ADMIN: 8,
            UserRole.INVENTORY_MANAGER: 7,
            UserRole.PROCUREMENT_MANAGER: 7,
            UserRole.EQUIPMENT_MANAGER: 7,
            UserRole.DEPARTMENT_MANAGER: 6,
            UserRole.STAFF_USER: 5,
            UserRole.VIEWER: 4,
            UserRole.AUDITOR: 4
        }
        
        user_level = role_hierarchy.get(user_role, 0)
        required_level = role_hierarchy.get(required_role, 0)
        
        return user_level >= required_level
    
    # =====================================================
    # SECURITY UTILITIES
    # =====================================================
    
    def is_account_locked(self, failed_attempts: int, locked_until: Optional[Union[datetime, str]]) -> bool:
        """Check if account is locked due to failed login attempts"""
        if locked_until is None:
            return False
        
        # Handle string dates from database
        if isinstance(locked_until, str):
            try:
                locked_until = datetime.fromisoformat(locked_until.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return False
        
        # Ensure timezone awareness
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=timezone.utc)
        
        return datetime.now(timezone.utc) < locked_until
    
    def calculate_lockout_duration(self, failed_attempts: int) -> timedelta:
        """Calculate account lockout duration based on failed attempts"""
        if failed_attempts < 3:
            return timedelta(0)
        elif failed_attempts < 5:
            return timedelta(minutes=15)
        elif failed_attempts < 10:
            return timedelta(hours=1)
        else:
            return timedelta(hours=24)
    
    def should_lock_account(self, failed_attempts: int) -> bool:
        """Determine if account should be locked"""
        return failed_attempts >= 3
    
    def generate_mfa_secret(self) -> str:
        """Generate MFA secret for TOTP"""
        return secrets.token_hex(16)
    
    def extract_ip_from_request(self, request) -> Optional[str]:
        """Extract IP address from request"""
        # Check for forwarded IP first (behind proxy)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to client host
        if hasattr(request, 'client') and request.client:
            return request.client.host
        
        return None
    
    def extract_user_agent(self, request) -> Optional[str]:
        """Extract user agent from request"""
        return request.headers.get("User-Agent")
    
    # =====================================================
    # EMAIL VERIFICATION
    # =====================================================
    
    def generate_verification_token(self) -> str:
        """Generate email verification token"""
        return secrets.token_urlsafe(32)
    
    def verify_email_token(self, token: str, stored_hash: str) -> bool:
        """Verify email verification token"""
        token_hash = self.hash_token(token)
        return token_hash == stored_hash
    
    # =====================================================
    # AUDIT LOGGING HELPERS
    # =====================================================
    
    def create_audit_context(
        self,
        user_id: Optional[str],
        organization_id: str,
        action: str,
        resource_type: Optional[str] = None,
        resource_id: Optional[str] = None,
        old_values: Optional[Dict] = None,
        new_values: Optional[Dict] = None,
        request = None
    ) -> Dict[str, Any]:
        """Create audit log context"""
        context = {
            "user_id": user_id,
            "organization_id": organization_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "old_values": old_values,
            "new_values": new_values
        }
        
        if request:
            context["ip_address"] = self.extract_ip_from_request(request)
            context["user_agent"] = self.extract_user_agent(request)
        
        return context

# =====================================================
# SINGLETON INSTANCE
# =====================================================

# Create singleton instance
auth_service = AuthService()

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def get_password_hash(password: str) -> str:
    """Get password hash - convenience function"""
    return auth_service.hash_password(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password - convenience function"""
    return auth_service.verify_password(plain_password, hashed_password)

def create_access_token(
    user_id: str, 
    organization_id: str,
    role: UserRole,
    permissions: List[str] = None,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Create access token - convenience function"""
    return auth_service.create_access_token(
        user_id=user_id,
        organization_id=organization_id,
        role=role,
        permissions=permissions,
        expires_delta=expires_delta
    )

def verify_token(token: str) -> Optional[TokenData]:
    """Verify token - convenience function"""
    return auth_service.extract_token_data(token)
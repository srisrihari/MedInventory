"""
Authentication and user management models for MedInventory.
"""

from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
from enum import Enum

# Enums to match database types
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    HOSPITAL_ADMIN = "hospital_admin"
    INVENTORY_MANAGER = "inventory_manager"
    PROCUREMENT_MANAGER = "procurement_manager"
    EQUIPMENT_MANAGER = "equipment_manager"
    DEPARTMENT_MANAGER = "department_manager"
    STAFF_USER = "staff_user"
    VIEWER = "viewer"
    AUDITOR = "auditor"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"

class SessionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

# =====================================================
# ORGANIZATION MODELS
# =====================================================

class OrganizationBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Organization name")
    type: str = Field(default="hospital", description="Organization type")
    address: Optional[str] = Field(None, description="Full address")
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    country: str = Field(default="India", max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    email: Optional[EmailStr] = Field(None, description="Organization contact email")
    website: Optional[str] = Field(None, description="Organization website")

class OrganizationCreate(OrganizationBase):
    subscription_plan: str = Field(default="trial", description="Subscription plan")
    
class OrganizationUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None

class Organization(OrganizationBase):
    id: str
    subscription_plan: str
    subscription_status: str
    trial_ends_at: Optional[datetime] = None
    settings: Dict[str, Any] = {}
    features: List[str] = []
    created_at: datetime
    updated_at: datetime
    is_active: bool = True

    class Config:
        from_attributes = True

# =====================================================
# USER MODELS
# =====================================================

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User email address")
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: str = Field(..., min_length=1, max_length=100, description="Last name")
    phone: Optional[str] = Field(None, max_length=50, description="Phone number")
    role: UserRole = Field(default=UserRole.STAFF_USER, description="User role")
    department: Optional[str] = Field(None, max_length=100, description="Department")
    job_title: Optional[str] = Field(None, max_length=150, description="Job title")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Password (minimum 6 characters)")
    confirm_password: str = Field(..., description="Password confirmation")
    organization_id: Optional[str] = Field(None, description="Organization ID (for invited users)")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isalpha() for c in v):
            raise ValueError('Password must contain at least one letter')
        return v

class UserUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=50)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=150)
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    preferences: Optional[Dict[str, Any]] = None
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, max_length=10)

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")
    remember_me: bool = Field(default=False, description="Remember login for longer session")

class UserProfile(UserBase):
    id: str
    organization_id: str
    status: UserStatus
    email_verified_at: Optional[datetime]
    last_login_at: Optional[datetime]
    mfa_enabled: bool = False
    preferences: Dict[str, Any] = {}
    timezone: str = "Asia/Kolkata"
    language: str = "en"
    created_at: datetime
    updated_at: datetime
    last_activity_at: datetime

    class Config:
        from_attributes = True

class User(UserProfile):
    """Full user model including sensitive information (for internal use)"""
    password_changed_at: datetime
    failed_login_attempts: int = 0
    locked_until: Optional[datetime] = None

# =====================================================
# AUTHENTICATION MODELS
# =====================================================

class Token(BaseModel):
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class TokenData(BaseModel):
    user_id: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[UserRole] = None
    permissions: List[str] = []

class AuthResponse(BaseModel):
    user: UserProfile
    organization: Organization
    tokens: Token
    permissions: List[str] = []

class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Refresh token")

class PasswordResetRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address for password reset")

class PasswordReset(BaseModel):
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., description="Password confirmation")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class ChangePassword(BaseModel):
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., description="Password confirmation")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# =====================================================
# SESSION MODELS
# =====================================================

class UserSession(BaseModel):
    id: str
    user_id: str
    status: SessionStatus
    ip_address: Optional[str]
    user_agent: Optional[str]
    device_info: Optional[Dict[str, Any]]
    location_info: Optional[Dict[str, Any]]
    expires_at: datetime
    last_activity_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    user_id: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    device_info: Optional[Dict[str, Any]] = None
    location_info: Optional[Dict[str, Any]] = None
    expires_in_hours: int = Field(default=24, description="Session duration in hours")

# =====================================================
# PERMISSION MODELS
# =====================================================

class Permission(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class RolePermission(BaseModel):
    role: UserRole
    permissions: List[str]

# =====================================================
# AUDIT LOG MODELS
# =====================================================

class AuditLogEntry(BaseModel):
    id: str
    user_id: Optional[str]
    organization_id: str
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    old_values: Optional[Dict[str, Any]]
    new_values: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class AuditLogCreate(BaseModel):
    user_id: Optional[str] = None
    action: str = Field(..., description="Action performed")
    resource_type: Optional[str] = Field(None, description="Type of resource affected")
    resource_id: Optional[str] = Field(None, description="ID of resource affected")
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# =====================================================
# USER INVITATION MODELS
# =====================================================

class UserInvitation(BaseModel):
    email: EmailStr = Field(..., description="Email address to invite")
    role: UserRole = Field(..., description="Role to assign")
    department: Optional[str] = Field(None, description="Department")
    message: Optional[str] = Field(None, description="Custom invitation message")

class UserInvitationResponse(BaseModel):
    id: str
    email: str
    role: UserRole
    department: Optional[str]
    invited_by: str
    expires_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# =====================================================
# API RESPONSE MODELS
# =====================================================

class AuthSuccess(BaseModel):
    success: bool = True
    message: str
    user: UserProfile
    tokens: Token

class AuthError(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None

class UserListResponse(BaseModel):
    users: List[UserProfile]
    total: int
    page: int
    limit: int

class OrganizationUsers(BaseModel):
    organization: Organization
    users: List[UserProfile]
    total_users: int
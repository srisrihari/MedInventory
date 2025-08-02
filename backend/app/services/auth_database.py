"""
Authentication database service for MedInventory.
Handles all database operations related to authentication, users, sessions, and permissions.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List, Union
from loguru import logger
import uuid

from app.config import settings
from app.models.auth import (
    UserRole, UserStatus, SessionStatus,
    UserCreate, UserUpdate, UserProfile, User,
    OrganizationCreate, Organization,
    SessionCreate, UserSession,
    AuditLogCreate, AuditLogEntry,
    TokenData
)
from app.services.auth_service import auth_service

class AuthDatabaseService:
    """Database service for authentication operations"""
    
    def __init__(self, supabase_client):
        self.client = supabase_client
    
    # =====================================================
    # USER OPERATIONS
    # =====================================================
    
    async def create_user(self, user_data: UserCreate, organization_id: str) -> Dict[str, Any]:
        """Create a new user"""
        try:
            # Hash the password
            password_hash = auth_service.hash_password(user_data.password)
            
            # Prepare user data
            user_dict = {
                "organization_id": organization_id,
                "email": user_data.email,
                "password_hash": password_hash,
                "first_name": user_data.first_name,
                "last_name": user_data.last_name,
                "phone": user_data.phone,
                "role": user_data.role.value,
                "department": user_data.department,
                "job_title": user_data.job_title,
                "status": UserStatus.PENDING.value,
                "password_changed_at": datetime.now(timezone.utc).isoformat(),
                "preferences": {},
                "timezone": "Asia/Kolkata",
                "language": "en"
            }
            
            # Insert user
            result = self.client.table('users').insert(user_dict).execute()
            
            if result.data:
                logger.info(f"Created user: {user_data.email}")
                return result.data[0]
            else:
                raise Exception("Failed to create user")
                
        except Exception as e:
            logger.error(f"Failed to create user {user_data.email}: {e}")
            raise
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Get user by email address"""
        try:
            result = self.client.table('users').select('*').eq('email', email).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user by email {email}: {e}")
            return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user by ID"""
        try:
            result = self.client.table('users').select('*').eq('id', user_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get user by ID {user_id}: {e}")
            return None
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[Dict[str, Any]]:
        """Update user information"""
        try:
            update_dict = {}
            
            # Add fields that are not None
            for field, value in user_data.dict(exclude_unset=True).items():
                if value is not None:
                    if field == 'role' and isinstance(value, UserRole):
                        update_dict[field] = value.value
                    elif field == 'status' and isinstance(value, UserStatus):
                        update_dict[field] = value.value
                    else:
                        update_dict[field] = value
            
            update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
            
            result = self.client.table('users').update(update_dict).eq('id', user_id).execute()
            
            if result.data:
                logger.info(f"Updated user: {user_id}")
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to update user {user_id}: {e}")
            raise
    
    async def update_user_login_info(
        self, 
        user_id: str, 
        failed_attempts: int = None,
        locked_until: datetime = None,
        last_login: datetime = None
    ) -> bool:
        """Update user login-related information"""
        try:
            update_dict = {}
            
            if failed_attempts is not None:
                update_dict['failed_login_attempts'] = failed_attempts
            
            if locked_until is not None:
                update_dict['locked_until'] = locked_until.isoformat()
            else:
                update_dict['locked_until'] = None
            
            if last_login is not None:
                update_dict['last_login_at'] = last_login.isoformat()
            
            update_dict['last_activity_at'] = datetime.now(timezone.utc).isoformat()
            update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
            
            result = self.client.table('users').update(update_dict).eq('id', user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to update user login info {user_id}: {e}")
            return False
    
    async def activate_user(self, user_id: str) -> bool:
        """Activate a user account"""
        try:
            result = self.client.table('users').update({
                'status': UserStatus.ACTIVE.value,
                'email_verified_at': datetime.now(timezone.utc).isoformat(),
                'updated_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', user_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to activate user {user_id}: {e}")
            return False
    
    async def get_users_by_organization(
        self, 
        organization_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get users by organization with pagination"""
        try:
            # Get total count
            count_result = self.client.table('users').select('id', count='exact').eq('organization_id', organization_id).execute()
            total = count_result.count if count_result.count is not None else 0
            
            # Get users
            result = self.client.table('users').select('*').eq('organization_id', organization_id).range(skip, skip + limit - 1).execute()
            
            return {
                'users': result.data or [],
                'total': total,
                'skip': skip,
                'limit': limit
            }
            
        except Exception as e:
            logger.error(f"Failed to get users for organization {organization_id}: {e}")
            return {'users': [], 'total': 0, 'skip': skip, 'limit': limit}
    
    # =====================================================
    # ORGANIZATION OPERATIONS
    # =====================================================
    
    async def get_organization_by_id(self, organization_id: str) -> Optional[Dict[str, Any]]:
        """Get organization by ID"""
        try:
            result = self.client.table('organizations').select('*').eq('id', organization_id).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get organization {organization_id}: {e}")
            return None
    
    async def create_organization(self, org_data: OrganizationCreate) -> Dict[str, Any]:
        """Create a new organization"""
        try:
            org_dict = org_data.dict()
            org_dict['created_at'] = datetime.now(timezone.utc).isoformat()
            org_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
            
            result = self.client.table('organizations').insert(org_dict).execute()
            
            if result.data:
                logger.info(f"Created organization: {org_data.name}")
                return result.data[0]
            else:
                raise Exception("Failed to create organization")
                
        except Exception as e:
            logger.error(f"Failed to create organization {org_data.name}: {e}")
            raise
    
    # =====================================================
    # SESSION OPERATIONS
    # =====================================================
    
    async def create_session(
        self, 
        user_id: str, 
        token_hash: str, 
        refresh_token_hash: str,
        expires_at: datetime,
        ip_address: str = None,
        user_agent: str = None,
        device_info: Dict = None
    ) -> Optional[Dict[str, Any]]:
        """Create a new user session"""
        try:
            session_data = {
                "user_id": user_id,
                "token_hash": token_hash,
                "refresh_token_hash": refresh_token_hash,
                "status": SessionStatus.ACTIVE.value,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "device_info": device_info,
                "expires_at": expires_at.isoformat(),
                "last_activity_at": datetime.now(timezone.utc).isoformat()
            }
            
            result = self.client.table('user_sessions').insert(session_data).execute()
            
            if result.data:
                logger.info(f"Created session for user: {user_id}")
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to create session for user {user_id}: {e}")
            return None
    
    async def get_session_by_token(self, token_hash: str) -> Optional[Dict[str, Any]]:
        """Get session by token hash"""
        try:
            result = self.client.table('user_sessions').select('*').eq('token_hash', token_hash).eq('status', SessionStatus.ACTIVE.value).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get session by token: {e}")
            return None
    
    async def get_session_by_refresh_token(self, refresh_token_hash: str) -> Optional[Dict[str, Any]]:
        """Get session by refresh token hash"""
        try:
            result = self.client.table('user_sessions').select('*').eq('refresh_token_hash', refresh_token_hash).eq('status', SessionStatus.ACTIVE.value).execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            logger.error(f"Failed to get session by refresh token: {e}")
            return None
    
    async def update_session_activity(self, session_id: str) -> bool:
        """Update session last activity time"""
        try:
            result = self.client.table('user_sessions').update({
                'last_activity_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', session_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to update session activity {session_id}: {e}")
            return False
    
    async def revoke_session(self, session_id: str) -> bool:
        """Revoke a user session"""
        try:
            result = self.client.table('user_sessions').update({
                'status': SessionStatus.REVOKED.value,
                'last_activity_at': datetime.now(timezone.utc).isoformat()
            }).eq('id', session_id).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to revoke session {session_id}: {e}")
            return False
    
    async def revoke_user_sessions(self, user_id: str) -> bool:
        """Revoke all sessions for a user"""
        try:
            result = self.client.table('user_sessions').update({
                'status': SessionStatus.REVOKED.value,
                'last_activity_at': datetime.now(timezone.utc).isoformat()
            }).eq('user_id', user_id).eq('status', SessionStatus.ACTIVE.value).execute()
            
            logger.info(f"Revoked all sessions for user: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to revoke sessions for user {user_id}: {e}")
            return False
    
    async def cleanup_expired_sessions(self) -> int:
        """Clean up expired sessions"""
        try:
            now = datetime.now(timezone.utc).isoformat()
            
            result = self.client.table('user_sessions').update({
                'status': SessionStatus.EXPIRED.value
            }).lt('expires_at', now).eq('status', SessionStatus.ACTIVE.value).execute()
            
            count = len(result.data) if result.data else 0
            logger.info(f"Cleaned up {count} expired sessions")
            return count
            
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")
            return 0
    
    # =====================================================
    # PERMISSION OPERATIONS
    # =====================================================
    
    async def get_user_permissions(self, user_id: str) -> List[str]:
        """Get permissions for a user based on their role"""
        try:
            # Get user's role
            user = await self.get_user_by_id(user_id)
            if not user:
                return []
            
            role = user.get('role')
            if not role:
                return []
            
            # Get permissions for the role
            result = self.client.table('role_permissions').select('permissions(name)').eq('role', role).execute()
            
            permissions = []
            if result.data:
                for item in result.data:
                    if item.get('permissions') and item['permissions'].get('name'):
                        permissions.append(item['permissions']['name'])
            
            return permissions
            
        except Exception as e:
            logger.error(f"Failed to get permissions for user {user_id}: {e}")
            return []
    
    async def check_user_permission(self, user_id: str, permission: str) -> bool:
        """Check if user has a specific permission"""
        try:
            permissions = await self.get_user_permissions(user_id)
            return permission in permissions
            
        except Exception as e:
            logger.error(f"Failed to check permission {permission} for user {user_id}: {e}")
            return False
    
    # =====================================================
    # AUDIT LOG OPERATIONS
    # =====================================================
    
    async def create_audit_log(self, audit_data: Union[AuditLogCreate, Dict], organization_id: str) -> bool:
        """Create an audit log entry"""
        try:
            # Handle both AuditLogCreate objects and dictionaries
            if hasattr(audit_data, 'dict'):
                log_dict = audit_data.dict()
            else:
                log_dict = audit_data.copy()
            
            log_dict['organization_id'] = organization_id
            log_dict['created_at'] = datetime.now(timezone.utc).isoformat()
            
            result = self.client.table('user_audit_log').insert(log_dict).execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to create audit log: {e}")
            return False
    
    async def get_audit_logs(
        self, 
        organization_id: str,
        user_id: Optional[str] = None,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Get audit logs with filters"""
        try:
            query = self.client.table('user_audit_log').select('*').eq('organization_id', organization_id)
            
            # Apply filters
            if user_id:
                query = query.eq('user_id', user_id)
            if action:
                query = query.eq('action', action)
            if resource_type:
                query = query.eq('resource_type', resource_type)
            if start_date:
                query = query.gte('created_at', start_date.isoformat())
            if end_date:
                query = query.lte('created_at', end_date.isoformat())
            
            # Get total count
            count_result = query.select('id', count='exact').execute()
            total = count_result.count if count_result.count is not None else 0
            
            # Get logs with pagination
            result = query.order('created_at', desc=True).range(skip, skip + limit - 1).execute()
            
            return {
                'logs': result.data or [],
                'total': total,
                'skip': skip,
                'limit': limit
            }
            
        except Exception as e:
            logger.error(f"Failed to get audit logs: {e}")
            return {'logs': [], 'total': 0, 'skip': skip, 'limit': limit}
    
    # =====================================================
    # UTILITY OPERATIONS
    # =====================================================
    
    async def check_email_exists(self, email: str, exclude_user_id: str = None) -> bool:
        """Check if email already exists"""
        try:
            query = self.client.table('users').select('id').eq('email', email)
            
            if exclude_user_id:
                query = query.neq('id', exclude_user_id)
            
            result = query.execute()
            
            return bool(result.data)
            
        except Exception as e:
            logger.error(f"Failed to check email exists {email}: {e}")
            return False
/**
 * Protected Route Component for MedInventory
 * Handles route protection based on authentication, roles, and permissions
 */

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  allowedRoles?: string[];
  allowedPermissions?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  requiredPermission,
  allowedRoles,
  allowedPermissions,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { state, hasPermission, hasRole } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being checked
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!state.isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check for specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return fallback || <AccessDenied requiredRole={requiredRole} />;
  }

  // Check for specific permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <AccessDenied requiredPermission={requiredPermission} />;
  }

  // Check for allowed roles
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some(role => hasRole(role))) {
    return fallback || <AccessDenied allowedRoles={allowedRoles} />;
  }

  // Check for allowed permissions
  if (allowedPermissions && allowedPermissions.length > 0 && !allowedPermissions.some(permission => hasPermission(permission))) {
    return fallback || <AccessDenied allowedPermissions={allowedPermissions} />;
  }

  // All checks passed, render the protected content
  return <>{children}</>;
}

// Access Denied Component
interface AccessDeniedProps {
  requiredRole?: string;
  requiredPermission?: string;
  allowedRoles?: string[];
  allowedPermissions?: string[];
}

function AccessDenied({ requiredRole, requiredPermission, allowedRoles, allowedPermissions }: AccessDeniedProps) {
  const { state } = useAuth();

  let message = 'You do not have permission to access this page.';
  
  if (requiredRole) {
    message = `This page requires ${requiredRole} role.`;
  } else if (requiredPermission) {
    message = `This page requires ${requiredPermission} permission.`;
  } else if (allowedRoles) {
    message = `This page requires one of the following roles: ${allowedRoles.join(', ')}.`;
  } else if (allowedPermissions) {
    message = `This page requires one of the following permissions: ${allowedPermissions.join(', ')}.`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        
        <div className="space-y-3">
          <div className="text-xs text-gray-500">
            <p><strong>Your Role:</strong> {state.user?.role}</p>
            <p><strong>Your Organization:</strong> {state.organization?.name}</p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={() => window.history.back()}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Higher-order component for role-based access
export function withRoleProtection<P extends object>(
  Component: React.ComponentType<P>,
  allowedRoles: string[]
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute allowedRoles={allowedRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Higher-order component for permission-based access
export function withPermissionProtection<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedRoute requiredPermission={requiredPermission}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Role-based access control helpers
export const RoleGuard = {
  SuperAdmin: (children: ReactNode) => (
    <ProtectedRoute requiredRole="super_admin">{children}</ProtectedRoute>
  ),
  HospitalAdmin: (children: ReactNode) => (
    <ProtectedRoute allowedRoles={["super_admin", "hospital_admin"]}>{children}</ProtectedRoute>
  ),
  InventoryManager: (children: ReactNode) => (
    <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager"]}>{children}</ProtectedRoute>
  ),
  ProcurementManager: (children: ReactNode) => (
    <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "procurement_manager"]}>{children}</ProtectedRoute>
  ),
  EquipmentManager: (children: ReactNode) => (
    <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "equipment_manager"]}>{children}</ProtectedRoute>
  ),
  StaffUser: (children: ReactNode) => (
    <ProtectedRoute allowedRoles={["super_admin", "hospital_admin", "inventory_manager", "procurement_manager", "equipment_manager", "department_manager", "staff_user"]}>{children}</ProtectedRoute>
  ),
  AnyAuthenticated: (children: ReactNode) => (
    <ProtectedRoute>{children}</ProtectedRoute>
  ),
};

// Permission-based access control helpers
export const PermissionGuard = {
  InventoryRead: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="inventory:read">{children}</ProtectedRoute>
  ),
  InventoryCreate: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="inventory:create">{children}</ProtectedRoute>
  ),
  InventoryUpdate: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="inventory:update">{children}</ProtectedRoute>
  ),
  InventoryDelete: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="inventory:delete">{children}</ProtectedRoute>
  ),
  SupplierManage: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="supplier:manage">{children}</ProtectedRoute>
  ),
  EquipmentManage: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="equipment:manage">{children}</ProtectedRoute>
  ),
  ReportsView: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="reports:view">{children}</ProtectedRoute>
  ),
  UserManage: (children: ReactNode) => (
    <ProtectedRoute requiredPermission="users:manage">{children}</ProtectedRoute>
  ),
};
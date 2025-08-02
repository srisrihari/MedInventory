/**
 * Authentication Context for MedInventory
 * Handles user authentication state, JWT tokens, and auth-related operations
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  organization_id: string;
  department?: string;
  job_title?: string;
  phone?: string;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  subscription_plan: string;
  subscription_status: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthState {
  user: User | null;
  organization: Organization | null;
  tokens: AuthTokens | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; organization: Organization; tokens: AuthTokens; permissions: string[] } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: AuthState = {
  user: null,
  organization: null,
  tokens: null,
  permissions: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Auth reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        organization: action.payload.organization,
        tokens: action.payload.tokens,
        permissions: action.payload.permissions,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        organization: null,
        tokens: null,
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
}

// Context
const AuthContext = createContext<{
  state: AuthState;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
} | null>(null);

// Signup data interface
export interface SignupData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  role: string;
  department?: string;
  job_title?: string;
  phone?: string;
}

// Token storage utilities
const TOKEN_STORAGE_KEY = 'medInventory_tokens';
const USER_STORAGE_KEY = 'medInventory_user';
const ORG_STORAGE_KEY = 'medInventory_organization';

const saveToStorage = (tokens: AuthTokens, user: User, organization: Organization) => {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(organization));
  } catch (error) {
    console.error('Failed to save auth data to localStorage:', error);
  }
};

const getFromStorage = () => {
  try {
    const tokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    const user = localStorage.getItem(USER_STORAGE_KEY);
    const organization = localStorage.getItem(ORG_STORAGE_KEY);
    
    if (tokens && user && organization) {
      return {
        tokens: JSON.parse(tokens) as AuthTokens,
        user: JSON.parse(user) as User,
        organization: JSON.parse(organization) as Organization,
      };
    }
  } catch (error) {
    console.error('Failed to get auth data from localStorage:', error);
  }
  return null;
};

const clearStorage = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ORG_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear auth data from localStorage:', error);
  }
};

// Auth Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { toast } = useToast();

  // Setup axios interceptor for authentication
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (state.tokens?.access_token) {
          config.headers.Authorization = `Bearer ${state.tokens.access_token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            await refreshToken();
            if (state.tokens?.access_token) {
              originalRequest.headers.Authorization = `Bearer ${state.tokens.access_token}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            await logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [state.tokens]);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuth = getFromStorage();
      
      if (storedAuth) {
        // Check if tokens are still valid by making a request to /me
        try {
          const response = await api.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${storedAuth.tokens.access_token}`,
            },
          });
          
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data,
              organization: storedAuth.organization,
              tokens: storedAuth.tokens,
              permissions: [], // Will be loaded separately
            },
          });
        } catch (error) {
          // Token is invalid, try to refresh
          try {
            await refreshTokenInternal(storedAuth.tokens.refresh_token);
          } catch (refreshError) {
            // Refresh failed, clear storage and logout
            clearStorage();
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    };

    initializeAuth();
  }, []);

  // Helper function for token refresh
  const refreshTokenInternal = async (refreshToken: string) => {
    const response = await api.post('/api/auth/refresh', {
      refresh_token: refreshToken,
    });
    
    const newTokens = response.data;
    dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
    
    // Update storage with new tokens
    const storedAuth = getFromStorage();
    if (storedAuth) {
      saveToStorage(newTokens, storedAuth.user, storedAuth.organization);
    }
  };

  // Auth functions
  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post('/api/auth/login', {
        email,
        password,
        remember_me: rememberMe,
      });
      
      const { user, organization, tokens, permissions } = response.data;
      
      saveToStorage(tokens, user, organization);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, organization, tokens, permissions },
      });
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.first_name}!`,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      
      const response = await api.post('/api/auth/signup', userData);
      
      const { user, organization, tokens, permissions } = response.data;
      
      saveToStorage(tokens, user, organization);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, organization, tokens, permissions },
      });
      
      toast({
        title: "Account Created",
        description: `Welcome to MedInventory, ${user.first_name}!`,
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Signup failed';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (state.tokens?.access_token) {
        await api.post('/api/auth/logout');
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      clearStorage();
      dispatch({ type: 'AUTH_LOGOUT' });
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    }
  };

  const refreshToken = async () => {
    if (!state.tokens?.refresh_token) {
      throw new Error('No refresh token available');
    }
    
    await refreshTokenInternal(state.tokens.refresh_token);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await api.put('/api/auth/me', userData);
      
      dispatch({ type: 'UPDATE_USER', payload: response.data });
      
      // Update storage
      const storedAuth = getFromStorage();
      if (storedAuth) {
        saveToStorage(storedAuth.tokens, response.data, storedAuth.organization);
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Profile update failed';
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage,
      });
      
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const hasPermission = (permission: string): boolean => {
    return state.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    return state.user?.role === role;
  };

  const value = {
    state,
    login,
    signup,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
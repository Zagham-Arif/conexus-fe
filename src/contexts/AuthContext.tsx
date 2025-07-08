import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { authApi } from '../services/api';
import { LoginData, RegisterData, User } from '../types';

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  message: string | null;
  messageType: 'success' | 'error' | null;
}

// Auth Actions
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string; message?: string } }
  | { type: 'AUTH_FAILURE'; payload: { message: string } }
  | { type: 'LOGOUT'; payload: { message?: string } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'CLEAR_MESSAGE' };

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  message: null,
  messageType: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        message: null,
        messageType: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        message: action.payload.message || 'Authentication successful',
        messageType: 'success',
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        message: action.payload.message,
        messageType: 'error',
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        message: action.payload.message || 'Logged out successfully',
        messageType: 'success',
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_MESSAGE':
      return {
        ...state,
        message: null,
        messageType: null,
      };
    default:
      return state;
  }
};

// Context type
interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearMessage: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.login(data);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          message: 'Login successful! Welcome back.',
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: { message } 
      });
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authApi.register(data);
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          message: 'Account created successfully! Welcome to the platform.',
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: { message } 
      });
      throw error;
    }
  };

  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout API (optional, since JWT is stateless)
    authApi.logout().catch(() => {
      // Ignore error, we're logging out anyway
    });
    
    dispatch({ 
      type: 'LOGOUT', 
      payload: { message: 'You have been logged out successfully.' } 
    });
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const savedUser = JSON.parse(userStr);
        
        // Verify token with server
        try {
          const response = await authApi.me();
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.user,
              token,
            },
          });
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ 
            type: 'AUTH_FAILURE', 
            payload: { message: 'Session expired. Please login again.' } 
          });
        }
      } else {
        dispatch({ 
          type: 'AUTH_FAILURE', 
          payload: { message: '' } 
        });
      }
    } catch (error) {
      dispatch({ 
        type: 'AUTH_FAILURE', 
        payload: { message: 'Authentication check failed.' } 
      });
    }
  };

  const clearMessage = () => {
    dispatch({ type: 'CLEAR_MESSAGE' });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    clearMessage,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

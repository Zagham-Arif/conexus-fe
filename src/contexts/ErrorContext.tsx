import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Error types
export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
}

// Error State
interface ErrorState {
  errors: AppError[];
}

// Error Actions
type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<AppError, 'id' | 'timestamp'> }
  | { type: 'REMOVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERRORS' };

// Initial state
const initialState: ErrorState = {
  errors: [],
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

// Reducer
const errorReducer = (state: ErrorState, action: ErrorAction): ErrorState => {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [
          ...state.errors,
          {
            ...action.payload,
            id: generateId(),
            timestamp: Date.now(),
          },
        ],
      };
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload),
      };
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: [],
      };
    default:
      return state;
  }
};

// Context type
interface ErrorContextType extends ErrorState {
  addError: (message: string, type?: AppError['type']) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

// Create context
const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

// Provider component
interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (message: string, type: AppError['type'] = 'error') => {
    dispatch({
      type: 'ADD_ERROR',
      payload: { message, type },
    });

    // Auto-remove after 5 seconds for success/info messages
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        // Find the most recent error with this message and remove it
        const errorToRemove = state.errors
          .filter(e => e.message === message && e.type === type)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        if (errorToRemove) {
          dispatch({ type: 'REMOVE_ERROR', payload: errorToRemove.id });
        }
      }, 5000);
    }
  };

  const removeError = (id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: id });
  };

  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const showSuccess = (message: string) => addError(message, 'success');
  const showError = (message: string) => addError(message, 'error');
  const showWarning = (message: string) => addError(message, 'warning');
  const showInfo = (message: string) => addError(message, 'info');

  const value: ErrorContextType = {
    ...state,
    addError,
    removeError,
    clearErrors,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>;
};

// Hook to use error context
export const useError = (): ErrorContextType => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

// Hook for API error handling
export const useApiError = () => {
  const { showError } = useError();

  const handleApiError = (error: any) => {
    if (error.response?.data?.message) {
      showError(error.response.data.message);
    } else if (error.message) {
      showError(error.message);
    } else {
      showError('An unexpected error occurred');
    }
  };

  return { handleApiError };
};

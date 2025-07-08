import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Entry, CreateEntryData } from '../types';
import { entriesApi } from '../services/api';

// Entry State
interface EntryState {
  entries: Entry[];
  currentEntry: Entry | null;
  loading: boolean;
  message: string | null;
  messageType: 'success' | 'error' | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: {
    totalEntries: number;
    movieCount: number;
    tvShowCount: number;
    averageRating: number;
  } | null;
}

// Entry Actions
type EntryAction =
  | { type: 'LOADING_START' }
  | { type: 'FETCH_ENTRIES_SUCCESS'; payload: { entries: Entry[]; pagination: any; message?: string } }
  | { type: 'FETCH_ENTRY_SUCCESS'; payload: { entry: Entry; message?: string } }
  | { type: 'CREATE_ENTRY_SUCCESS'; payload: { entry: Entry; message: string } }
  | { type: 'UPDATE_ENTRY_SUCCESS'; payload: { entry: Entry; message: string } }
  | { type: 'DELETE_ENTRY_SUCCESS'; payload: { entryId: string; message: string } }
  | { type: 'FETCH_STATS_SUCCESS'; payload: { stats: any; message?: string } }
  | { type: 'ENTRY_ERROR'; payload: { message: string } }
  | { type: 'CLEAR_MESSAGE' }
  | { type: 'CLEAR_CURRENT_ENTRY' }
  | { type: 'RESET_ENTRIES' };

// Initial state
const initialState: EntryState = {
  entries: [],
  currentEntry: null,
  loading: false,
  message: null,
  messageType: null,
  pagination: null,
  stats: null,
};

// Reducer
const entryReducer = (state: EntryState, action: EntryAction): EntryState => {
  switch (action.type) {
    case 'LOADING_START':
      return {
        ...state,
        loading: true,
        message: null,
        messageType: null,
      };
    case 'FETCH_ENTRIES_SUCCESS':
      return {
        ...state,
        entries: action.payload.entries,
        pagination: action.payload.pagination,
        loading: false,
        message: action.payload.message || null,
        messageType: action.payload.message ? 'success' : null,
      };
    case 'FETCH_ENTRY_SUCCESS':
      return {
        ...state,
        currentEntry: action.payload.entry,
        loading: false,
        message: action.payload.message || null,
        messageType: action.payload.message ? 'success' : null,
      };
    case 'CREATE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: [action.payload.entry, ...state.entries],
        loading: false,
        message: action.payload.message,
        messageType: 'success',
      };
    case 'UPDATE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: state.entries.map(entry =>
          entry.id === action.payload.entry.id ? action.payload.entry : entry
        ),
        currentEntry: action.payload.entry,
        loading: false,
        message: action.payload.message,
        messageType: 'success',
      };
    case 'DELETE_ENTRY_SUCCESS':
      return {
        ...state,
        entries: state.entries.filter(entry => entry.id !== action.payload.entryId),
        loading: false,
        message: action.payload.message,
        messageType: 'success',
      };
    case 'FETCH_STATS_SUCCESS':
      return {
        ...state,
        stats: action.payload.stats,
        loading: false,
        message: action.payload.message || null,
        messageType: action.payload.message ? 'success' : null,
      };
    case 'ENTRY_ERROR':
      return {
        ...state,
        loading: false,
        message: action.payload.message,
        messageType: 'error',
      };
    case 'CLEAR_MESSAGE':
      return {
        ...state,
        message: null,
        messageType: null,
      };
    case 'CLEAR_CURRENT_ENTRY':
      return {
        ...state,
        currentEntry: null,
      };
    case 'RESET_ENTRIES':
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

// Context type
interface EntryContextType extends EntryState {
  fetchEntries: (params?: any) => Promise<void>;
  fetchEntry: (id: string) => Promise<void>;
  createEntry: (data: CreateEntryData) => Promise<void>;
  updateEntry: (id: string, data: Partial<CreateEntryData>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getStatistics: () => Promise<void>;
  clearMessage: () => void;
  clearCurrentEntry: () => void;
  resetEntries: () => void;
}

// Create context
const EntryContext = createContext<EntryContextType | undefined>(undefined);

// Provider component
interface EntryProviderProps {
  children: ReactNode;
}

export const EntryProvider: React.FC<EntryProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(entryReducer, initialState);

  const fetchEntries = async (params: any = {}) => {
    try {
      dispatch({ type: 'LOADING_START' });
      const response = await entriesApi.getAll(params);
      dispatch({
        type: 'FETCH_ENTRIES_SUCCESS',
        payload: {
          entries: response.data,
          pagination: response.pagination,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch entries';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
    }
  };

  const fetchEntry = async (id: string) => {
    try {
      dispatch({ type: 'LOADING_START' });
      const entry = await entriesApi.getById(id);
      dispatch({
        type: 'FETCH_ENTRY_SUCCESS',
        payload: { entry },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch entry';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
    }
  };

  const createEntry = async (data: CreateEntryData) => {
    try {
      dispatch({ type: 'LOADING_START' });
      const entry = await entriesApi.create(data);
      dispatch({
        type: 'CREATE_ENTRY_SUCCESS',
        payload: {
          entry,
          message: `"${entry.title}" has been added to your collection successfully!`,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to create entry';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
      throw error;
    }
  };

  const updateEntry = async (id: string, data: Partial<CreateEntryData>) => {
    try {
      dispatch({ type: 'LOADING_START' });
      const entry = await entriesApi.update(id, data);
      dispatch({
        type: 'UPDATE_ENTRY_SUCCESS',
        payload: {
          entry,
          message: `"${entry.title}" has been updated successfully!`,
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to update entry';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
      throw error;
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      dispatch({ type: 'LOADING_START' });
      await entriesApi.delete(id);
      dispatch({
        type: 'DELETE_ENTRY_SUCCESS',
        payload: {
          entryId: id,
          message: 'Entry has been deleted successfully!',
        },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to delete entry';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
      throw error;
    }
  };

  const getStatistics = async () => {
    try {
      dispatch({ type: 'LOADING_START' });
      const stats = await entriesApi.getStatistics();
      dispatch({
        type: 'FETCH_STATS_SUCCESS',
        payload: { stats },
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch statistics';
      dispatch({
        type: 'ENTRY_ERROR',
        payload: { message },
      });
    }
  };

  const clearMessage = () => {
    dispatch({ type: 'CLEAR_MESSAGE' });
  };

  const clearCurrentEntry = () => {
    dispatch({ type: 'CLEAR_CURRENT_ENTRY' });
  };

  const resetEntries = () => {
    dispatch({ type: 'RESET_ENTRIES' });
  };

  const value: EntryContextType = {
    ...state,
    fetchEntries,
    fetchEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    getStatistics,
    clearMessage,
    clearCurrentEntry,
    resetEntries,
  };

  return <EntryContext.Provider value={value}>{children}</EntryContext.Provider>;
};

// Hook to use entry context
export const useEntry = (): EntryContextType => {
  const context = useContext(EntryContext);
  if (context === undefined) {
    throw new Error('useEntry must be used within an EntryProvider');
  }
  return context;
};

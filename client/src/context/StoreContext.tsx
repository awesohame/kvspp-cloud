import { createContext, useReducer, ReactNode, useCallback } from 'react';
import { Store } from '../types/api';
import { apiService } from '../services/api';

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  loading: boolean;
  error: string | null;
}

interface StoreContextType extends StoreState {
  fetchStores: () => Promise<void>;
  createStore: (name: string, description: string) => Promise<void>;
  updateStore: (token: string, name: string, description: string) => Promise<void>;
  deleteStore: (token: string) => Promise<void>;
  setCurrentStore: (store: Store | null) => void;
}

type StoreAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STORES'; payload: Store[] }
  | { type: 'SET_CURRENT_STORE'; payload: Store | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_STORE'; payload: Store }
  | { type: 'UPDATE_STORE'; payload: Store }
  | { type: 'REMOVE_STORE'; payload: string };

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const storeReducer = (state: StoreState, action: StoreAction): StoreState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STORES':
      return { ...state, stores: action.payload, loading: false, error: null };
    case 'SET_CURRENT_STORE':
      return { ...state, currentStore: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_STORE':
      return { ...state, stores: [...state.stores, action.payload] };
    case 'UPDATE_STORE':
      return {
        ...state,
        stores: state.stores.map(store =>
          store.token === action.payload.token ? action.payload : store
        ),
        currentStore: state.currentStore?.token === action.payload.token
          ? action.payload
          : state.currentStore,
      };
    case 'REMOVE_STORE':
      return {
        ...state,
        stores: state.stores.filter(store => store.token !== action.payload),
        currentStore: state.currentStore?.token === action.payload
          ? null
          : state.currentStore,
      };
    default:
      return state;
  }
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, {
    stores: [],
    currentStore: null,
    loading: false,
    error: null,
  });

  const fetchStores = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const stores = await apiService.getStores();
      dispatch({ type: 'SET_STORES', payload: stores });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch stores' });
      console.error('Failed to fetch stores', error);
    }
  }, []);

  const createStore = async (name: string, description: string) => {
    try {
      const store = await apiService.createStore(name, description);
      dispatch({ type: 'ADD_STORE', payload: store });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create store' });
      console.error('Failed to create store', error);
    }
  };

  const updateStore = async (token: string, name: string, description: string) => {
    try {
      const store = await apiService.updateStore(token, name, description);
      dispatch({ type: 'UPDATE_STORE', payload: store });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update store' });
      console.error('Failed to update store', error);
    }
  };

  const deleteStore = async (token: string) => {
    try {
      await apiService.deleteStore(token);
      dispatch({ type: 'REMOVE_STORE', payload: token });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete store' });
      console.error('Failed to delete store', error);
    }
  };

  const setCurrentStore = (store: Store | null) => {
    dispatch({ type: 'SET_CURRENT_STORE', payload: store });
  };

  return (
    <StoreContext.Provider
      value={{
        ...state,
        fetchStores,
        createStore,
        updateStore,
        deleteStore,
        setCurrentStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
import { User, Store } from './api';

// Auth types
export interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: () => void;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

// Store types
export interface StoreState {
    stores: Store[];
    currentStore: Store | null;
    loading: boolean;
    error: string | null;
}

export interface StoreContextType extends StoreState {
    fetchStores: () => Promise<void>;
    createStore: (name: string, description: string) => Promise<void>;
    updateStore: (token: string, name: string, description: string) => Promise<void>;
    deleteStore: (token: string) => Promise<void>;
    setCurrentStore: (store: Store | null) => void;
}

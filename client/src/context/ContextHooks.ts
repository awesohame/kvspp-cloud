import { useContext } from 'react';
import { AuthContext, StoreContext } from './ContextValues';
import { AuthContextType, StoreContextType } from '../types/ContextTypes';

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export function useStore(): StoreContextType {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
}

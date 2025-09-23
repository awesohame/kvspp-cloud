import { createContext } from 'react';
import { AuthContextType, StoreContextType } from '../types/ContextTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const StoreContext = createContext<StoreContextType | undefined>(undefined);

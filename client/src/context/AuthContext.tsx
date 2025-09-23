import { useReducer, useEffect, ReactNode } from 'react';
import { apiService } from '../services/api';
import { AuthContext } from './ContextValues';
import { AuthState } from '../types/ContextTypes';

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: AuthState['user'] }
  | { type: 'SET_ERROR'; payload: string | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const user = await apiService.getUser();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: unknown) {
      dispatch({ type: 'SET_USER', payload: null });
      console.error('Failed to fetch user', error);
    }
  };

  const login = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  const logout = async () => {
    try {
      await apiService.logout();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to logout' });
      console.error('Failed to logout', error);
    }
  };

  const deleteAccount = async () => {
    try {
      await apiService.deleteAccount();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error: unknown) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete account' });
      console.error('Failed to delete account', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
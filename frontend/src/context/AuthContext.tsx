import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, HealthStatus } from '../types';
import { api, hasBackendApi } from '../services/api';
import {
  getUser,
  login as identityLogin,
  logout as identityLogout,
  onAuthChange,
  signup,
} from '@netlify/identity';
import { authErrorMessage, restoreIdentityUser, toAppUser } from '../services/identity';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  health: HealthStatus | null;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshHealth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => hasBackendApi ? localStorage.getItem('ps_token') : null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const fetchHealth = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch {
      setHealth({ status: 'offline', gemini_configured: false, version: '1.0.0' });
    }
  };

  const refreshUser = async () => {
    if (!hasBackendApi) {
      const currentUser = await getUser();
      setUser(currentUser ? toAppUser(currentUser) : null);
      setIsLoading(false);
      return;
    }
    const currentToken = localStorage.getItem('ps_token');
    if (!currentToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const u = await api.getCurrentUser();
      setUser(u);
      localStorage.setItem('ps_user', JSON.stringify(u));
    } catch {
      // Token expired or invalid
      localStorage.removeItem('ps_token');
      localStorage.removeItem('ps_user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    if (hasBackendApi) {
      refreshUser();
      return;
    }

    let active = true;
    const unsubscribe = onAuthChange((_event, currentUser) => {
      if (active) {
        setUser(currentUser ? toAppUser(currentUser) : null);
      }
    });

    restoreIdentityUser()
      .then((currentUser) => {
        if (active) setUser(currentUser);
      })
      .catch((error: unknown) => {
        if (active) setAuthError(authErrorMessage(error));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    if (!hasBackendApi) {
      const currentUser = await identityLogin(email.trim(), password);
      setUser(toAppUser(currentUser));
      return;
    }
    const resp = await api.login({ email: email.trim(), password });
    localStorage.setItem('ps_token', resp.access_token);
    localStorage.setItem('ps_user', JSON.stringify(resp.user));
    setToken(resp.access_token);
    setUser(resp.user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setAuthError(null);
    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    if (!hasBackendApi) {
      const currentUser = await signup(email.trim(), password, { full_name: name.trim() });
      if (!currentUser.confirmedAt) return false;
      setUser(toAppUser(currentUser));
      return true;
    }
    const resp = await api.register({
      name: name.trim(),
      email: email.trim(),
      password,
      confirm_password: confirmPassword,
    });
    localStorage.setItem('ps_token', resp.access_token);
    localStorage.setItem('ps_user', JSON.stringify(resp.user));
    setToken(resp.access_token);
    setUser(resp.user);
    return true;
  };

  const logout = async () => {
    try {
      if (hasBackendApi) await api.logout();
      else await identityLogout();
    } finally {
      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        health,
        authError,
        login,
        register,
        logout,
        refreshUser,
        refreshHealth: fetchHealth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

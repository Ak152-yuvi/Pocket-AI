import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, HealthStatus } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  health: HealthStatus | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshHealth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ps_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('ps_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const fetchHealth = async () => {
    try {
      const h = await api.getHealth();
      setHealth(h);
    } catch {
      setHealth({ status: 'offline', gemini_configured: false, version: '1.0.0' });
    }
  };

  const refreshUser = async () => {
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
    refreshUser();
    fetchHealth();
  }, []);

  const login = async (email: string, password: string) => {
    const resp = await api.login({ email, password });
    localStorage.setItem('ps_token', resp.access_token);
    localStorage.setItem('ps_user', JSON.stringify(resp.user));
    setToken(resp.access_token);
    setUser(resp.user);
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    const resp = await api.register({
      name,
      email,
      password,
      confirm_password: confirmPassword,
    });
    localStorage.setItem('ps_token', resp.access_token);
    localStorage.setItem('ps_user', JSON.stringify(resp.user));
    setToken(resp.access_token);
    setUser(resp.user);
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        health,
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

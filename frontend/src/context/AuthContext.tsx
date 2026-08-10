import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/auth';
import { api } from '../services/api';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (e) {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setAccessToken(accessToken);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password, confirmPassword });
      const { user, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setAccessToken(accessToken);
      setUser(user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.post('/auth/logout').catch(() => {});
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        accessToken,
        login,
        register,
        logout,
        refreshUser,
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

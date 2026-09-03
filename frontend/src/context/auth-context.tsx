
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      api.client.setToken(t);
      setToken(t);
      api.auth.getProfile()
        .then(u => setUser(u))
        .catch(() => {
          api.client.removeToken();
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (data: any) => {
    const res: any = await api.auth.login(data);
    const token = res?.access_token || res?.accessToken;
    if (token) {
      api.client.setToken(token);
      setToken(token);
    }
    const profile = await api.auth.getProfile();
    setUser(profile);
  };

  const register = async (data: any) => {
    await api.auth.register(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = () => {
    api.client.removeToken();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@taskman:token');
    const storedUser = localStorage.getItem('@taskman:user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('@taskman:token');
        localStorage.removeItem('@taskman:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const response = await authService.login(credentials);
    const loggedUser: User = {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    };

    localStorage.setItem('@taskman:token', response.token);
    localStorage.setItem('@taskman:user', JSON.stringify(loggedUser));
    setToken(response.token);
    setUser(loggedUser);
  };

  const register = async (data: { name: string; email: string; password: string }) => {
    const response = await authService.register(data);
    const registeredUser: User = {
      id: response.userId,
      name: response.name,
      email: response.email,
      role: response.role,
    };

    localStorage.setItem('@taskman:token', response.token);
    localStorage.setItem('@taskman:user', JSON.stringify(registeredUser));
    setToken(response.token);
    setUser(registeredUser);
  };

  const logout = () => {
    localStorage.removeItem('@taskman:token');
    localStorage.removeItem('@taskman:user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};

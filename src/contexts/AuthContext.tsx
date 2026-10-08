import React, { useState } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './authContextDef';
import type { User } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('@taskman:token'));
  const [user, setUser] = useState<User | null>(() => {
    const storedToken = localStorage.getItem('@taskman:token');
    const storedUser = localStorage.getItem('@taskman:user');
    if (storedToken && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem('@taskman:token');
        localStorage.removeItem('@taskman:user');
      }
    }
    return null;
  });
  const [loading] = useState(false);

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


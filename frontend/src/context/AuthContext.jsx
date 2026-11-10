import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getCurrentUserApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vacctrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('vacctrack_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          const res = await getCurrentUserApi();
          if (res.data) {
            setUser(res.data);
            localStorage.setItem('vacctrack_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (credentials) => {
    const res = await loginApi(credentials);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('vacctrack_token', res.data.token);
      localStorage.setItem('vacctrack_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerApi(userData);
    if (res.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('vacctrack_token', res.data.token);
      localStorage.setItem('vacctrack_user', JSON.stringify(res.data.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vacctrack_token');
    localStorage.removeItem('vacctrack_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
        role: user?.role || user?.Role || null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

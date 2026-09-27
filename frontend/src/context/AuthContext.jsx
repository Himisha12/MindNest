import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session on initial app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (emailOrUsername, password) => {
    const { data } = await api.post('/auth/login', { emailOrUsername, password });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/users/profile', profileData);
    setUser((prev) => ({ ...prev, ...data }));
    return data;
  };

  const verifyEmail = async (code) => {
    const { data } = await api.post('/auth/verify-email', { code });
    if (data.user) {
      setUser((prev) => ({ ...prev, ...data.user, isEmailVerified: true }));
    }
    return data;
  };

  const resendVerification = async () => {
    const { data } = await api.post('/auth/resend-verification');
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        verifyEmail,
        resendVerification,
        isAuthenticated: !!user
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

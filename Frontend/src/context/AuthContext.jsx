import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, getUser, getToken, isAuthenticated } from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      if (storedToken && storedUser) {
        // If offline or token starts with 'offline_', accept it without validation
        if (!navigator.onLine || storedToken.startsWith('offline_')) {
          setToken(storedToken);
          setUser(storedUser);
          setLoading(false);
          return;
        }
        
        try {
          // Validate token with backend only when online
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.ok) {
            // Token is valid
            setToken(storedToken);
            setUser(storedUser);
          } else {
            // Token is invalid, keep it for offline use
            console.log('Token validation failed, using offline mode');
            setToken(storedToken);
            setUser(storedUser);
          }
        } catch (error) {
          // Network error, use offline mode
          console.log('Network error, using offline mode');
          setToken(storedToken);
          setUser(storedUser);
        }
      }
      setLoading(false);
    };
    
    validateToken();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.login(email, password);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (name, email, password, confirmPassword) => {
    try {
      setError(null);
      setLoading(true);
      const response = await authAPI.signup(name, email, password, confirmPassword);
      setToken(response.token);
      setUser(response.user);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      if (token) {
        await authAPI.logout(token);
      }
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    isAuthenticated: isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

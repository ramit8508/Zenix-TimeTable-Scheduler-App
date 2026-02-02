import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
// ===== COMMENTED OUT: Traditional Login/Signup Authentication =====
// import { authAPI, getUser, getToken, isAuthenticated } from '../services/authService';
// ===== END COMMENTED OUT =====

// ===== NEW: Device-Based Authentication (Offline Mode) =====
import { 
  initializeDeviceAuth, 
  getDeviceUser, 
  getDeviceToken, 
  isDeviceAuthenticated 
} from '../utils/deviceAuth';
// ===== END NEW =====

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== NEW: Initialize device-based auth on mount =====
  useEffect(() => {
    const initDeviceAuth = async () => {
      try {
        // Initialize device authentication automatically
        const deviceUser = initializeDeviceAuth();
        const deviceToken = getDeviceToken();
        
        setUser(deviceUser);
        setToken(deviceToken);
        setLoading(false);
        
        console.log('Device authentication initialized:', deviceUser);
      } catch (error) {
        console.error('Device auth initialization error:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    initDeviceAuth();
  }, []);
  // ===== END NEW =====

  // ===== COMMENTED OUT: Original token validation for login/signup =====
  /*
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
          // Validate token with backend only when online (with timeout)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${storedToken}`
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
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
          // Network error or timeout, use offline mode
          console.log('Network error or timeout, using offline mode');
          setToken(storedToken);
          setUser(storedUser);
        }
      }
      setLoading(false);
    };
    
    validateToken();
  }, []);
  */
  // ===== END COMMENTED OUT =====

  // ===== COMMENTED OUT: Login/Signup Functions =====
  /*
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
  */
  // ===== END COMMENTED OUT =====

  // ===== NEW: Device-based stub functions (no-op for device auth) =====
  const login = async (email, password) => {
    // Device auth doesn't need login - automatically authenticated
    console.log('Device auth: login not needed');
    return { user, token };
  };

  const signup = async (name, email, password, confirmPassword) => {
    // Device auth doesn't need signup - automatically authenticated
    console.log('Device auth: signup not needed');
    return { user, token };
  };
  // ===== END NEW =====

  // Logout function
  const logout = async () => {
    try {
      setError(null);
      // ===== COMMENTED OUT: Backend logout =====
      // if (token) {
      //   await authAPI.logout(token);
      // }
      // ===== END COMMENTED OUT =====
      
      // ===== NEW: Keep device auth but clear user data if needed =====
      // For device auth, logout doesn't remove device ID, just clears session
      console.log('Device auth: logout called (device auth persists)');
      // We keep the device authenticated, but you could clear if needed
      // ===== END NEW =====
      
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      error,
      login,
      signup,
      logout,
      isAuthenticated: isDeviceAuthenticated(), // ===== NEW: Use device auth check =====
    }),
    [user, token, loading, error]
  );

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

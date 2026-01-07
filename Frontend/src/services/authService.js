// API service for authentication (Offline Mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if online
const isOnline = () => navigator.onLine;

// Get offline users database
const getOfflineUsers = () => {
  const users = localStorage.getItem('offline_users');
  return users ? JSON.parse(users) : [];
};

// Save offline users database
const saveOfflineUsers = (users) => {
  localStorage.setItem('offline_users', JSON.stringify(users));
};

export const authAPI = {
  // Signup
  signup: async (name, email, password, confirmPassword) => {
    try {
      // OFFLINE MODE: Handle signup locally
      if (!isOnline()) {
        const offlineUsers = getOfflineUsers();
        
        // Check if user already exists
        if (offlineUsers.find(u => u.email === email)) {
          throw new Error('User already exists');
        }
        
        // Validate passwords match
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        // Create new user
        const newUser = {
          id: Date.now().toString(),
          name,
          email,
          password, // In production, this should be hashed
          createdAt: new Date().toISOString(),
        };
        
        offlineUsers.push(newUser);
        saveOfflineUsers(offlineUsers);
        
        // Generate offline token
        const token = 'offline_' + Date.now();
        const userData = { id: newUser.id, name: newUser.name, email: newUser.email };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { token, user: userData, offline: true };
      }
      
      // ONLINE MODE: Use backend API
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // Store token and user
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  // Login
  login: async (email, password) => {
    try {
      // OFFLINE MODE: Handle login locally
      if (!isOnline()) {
        const offlineUsers = getOfflineUsers();
        const user = offlineUsers.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Invalid email or password');
        }
        
        // Generate offline token
        const token = 'offline_' + Date.now();
        const userData = { id: user.id, name: user.name, email: user.email };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { token, user: userData, offline: true };
      }
      
      // ONLINE MODE: Use backend API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Get current user
  getMe: async (token) => {
    try {
      // OFFLINE MODE: Return user from localStorage
      if (!isOnline() || token.startsWith('offline_')) {
        const userData = localStorage.getItem('user');
        if (userData) {
          return { user: JSON.parse(userData), offline: true };
        }
        throw new Error('User not found');
      }
      
      // ONLINE MODE: Validate with backend
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }

      return data;
    } catch (error) {
      console.error('GetMe error:', error);
      throw error;
    }
  },

  // Logout
  logout: async (token) => {
    try {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // OFFLINE MODE: Just return success
      if (!isOnline() || (token && token.startsWith('offline_'))) {
        return { message: 'Logged out successfully', offline: true };
      }
      
      // ONLINE MODE: Notify backend
      try {
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        return data;
      } catch (error) {
        // If backend logout fails, still return success since local storage is cleared
        console.log('Backend logout failed, but local logout successful');
        return { message: 'Logged out successfully (offline)' };
      }
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

// Helper function to get auth header
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }
  return {};
};

// Helper function to get token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get user
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

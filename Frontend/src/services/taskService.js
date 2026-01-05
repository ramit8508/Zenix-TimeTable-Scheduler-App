// API service for tasks (Offline Mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/tasks`;

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  };
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create task');
    }

    return data;
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

// Get all tasks
export const getAllTasks = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks');
    }

    return data;
  } catch (error) {
    console.error('Get tasks error:', error);
    throw error;
  }
};

// Get today's tasks
export const getTodayTasks = async () => {
  try {
    const response = await fetch(`${API_URL}/today`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch today tasks');
    }

    return data;
  } catch (error) {
    console.error('Get today tasks error:', error);
    throw error;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    const response = await fetch(`${API_URL}/stats`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch task stats');
    }

    return data;
  } catch (error) {
    console.error('Get task stats error:', error);
    throw error;
  }
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    const response = await fetch(
      `${API_URL}/date-range?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        method: 'GET',
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch tasks by date');
    }

    return data;
  } catch (error) {
    console.error('Get tasks by date error:', error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId, updates) => {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update task');
    }

    return data;
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    const response = await fetch(`${API_URL}/${taskId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete task');
    }

    return data;
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};

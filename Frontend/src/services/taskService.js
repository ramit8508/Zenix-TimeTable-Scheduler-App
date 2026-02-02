// API service for tasks (Offline Mode)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${API_BASE_URL}/tasks`;

// Simple cache to reduce API calls
const cache = {
  data: null,
  timestamp: null,
  ttl: 5000, // Cache for 5 seconds
};

const isCacheValid = () => {
  return cache.data && cache.timestamp && (Date.now() - cache.timestamp < cache.ttl);
};

const updateCache = (data) => {
  cache.data = data;
  cache.timestamp = Date.now();
};

const clearCache = () => {
  cache.data = null;
  cache.timestamp = null;
};

// Check if online
const isOnline = () => navigator.onLine;

// Get offline tasks from localStorage
const getOfflineTasks = () => {
  const tasks = localStorage.getItem('offline_tasks');
  return tasks ? JSON.parse(tasks) : [];
};

// Save offline tasks to localStorage
const saveOfflineTasks = (tasks) => {
  localStorage.setItem('offline_tasks', JSON.stringify(tasks));
};

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
    clearCache(); // Clear cache on create

    // OFFLINE MODE: Save task locally
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const newTask = {
        ...taskData,
        _id: 'offline_' + Date.now(),
        createdAt: new Date().toISOString(),
        offline: true,
      };
      tasks.push(newTask);
      saveOfflineTasks(tasks);
      return { task: newTask, offline: true };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode
      console.log('Backend unreachable, using offline mode');
      const tasks = getOfflineTasks();
      const newTask = {
        ...taskData,
        _id: 'offline_' + Date.now(),
        createdAt: new Date().toISOString(),
        offline: true,
      };
      tasks.push(newTask);
      saveOfflineTasks(tasks);
      return { task: newTask, offline: true };
    }
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

// Get all tasks
export const getAllTasks = async () => {
  try {
    // Return cached data if valid
    if (isCacheValid()) {
      return cache.data;
    }

    // OFFLINE MODE: Get tasks from localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const result = { tasks, offline: true };
      updateCache(result);
      return result;
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tasks');
      }

      updateCache(data);
      return data;
    } catch (networkError) {
      // Backend unreachable, use offline mode silently
      const tasks = getOfflineTasks();
      const result = { tasks, offline: true };
      updateCache(result);
      return result;
    }
  } catch (error) {
    // Return offline data instead of throwing
    const tasks = getOfflineTasks();
    const result = { tasks, offline: true };
    updateCache(result);
    return result;
  }
};

// Get today's tasks
export const getTodayTasks = async () => {
  try {
    // OFFLINE MODE: Filter today's tasks from localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      return { tasks: todayTasks, offline: true };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode
      console.log('Backend unreachable, using offline mode');
      const tasks = getOfflineTasks();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate.getTime() === today.getTime();
      });
      return { tasks: todayTasks, offline: true };
    }
  } catch (error) {
    console.error('Get today tasks error:', error);
    throw error;
  }
};

// Get task statistics
export const getTaskStats = async () => {
  try {
    // OFFLINE MODE: Calculate stats from localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      
      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate < tomorrow;
      });
      const todayTotal = todayTasks.length;
      const todayCompleted = todayTasks.filter(t => t.completed).length;
      
      // Calculate weekly hours
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weeklyTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate < weekEnd;
      });
      const weeklyHours = weeklyTasks.reduce((total, task) => total + (task.duration || 0), 0) / 60;
      
      return {
        stats: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
          totalTasks,
          completedTasks,
          todayTotal,
          todayCompleted,
          weeklyHours: Math.round(weeklyHours),
        },
        offline: true,
      };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode silently
      const tasks = getOfflineTasks();
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.completed).length;
      
      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate < tomorrow;
      });
      const todayTotal = todayTasks.length;
      const todayCompleted = todayTasks.filter(t => t.completed).length;
      
      // Calculate weekly hours
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
      
      const weeklyTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= weekStart && taskDate < weekEnd;
      });
      const weeklyHours = weeklyTasks.reduce((total, task) => total + (task.duration || 0), 0) / 60;
      
      return {
        stats: {
          total: totalTasks,
          completed: completedTasks,
          pending: totalTasks - completedTasks,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
          totalTasks,
          completedTasks,
          todayTotal,
          todayCompleted,
          weeklyHours: Math.round(weeklyHours),
        },
        offline: true,
      };
    }
  } catch (error) {
    // Return offline stats instead of throwing
    const tasks = getOfflineTasks();
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    
    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= today && taskDate < tomorrow;
    });
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(t => t.completed).length;
    
    // Calculate weekly hours
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weeklyTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= weekStart && taskDate < weekEnd;
    });
    const weeklyHours = weeklyTasks.reduce((total, task) => total + (task.duration || 0), 0) / 60;
    
    return {
      stats: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0,
        totalTasks,
        completedTasks,
        todayTotal,
        todayCompleted,
        weeklyHours: Math.round(weeklyHours),
      },
      offline: true,
    };
  }
};

// Get tasks by date range
export const getTasksByDateRange = async (startDate, endDate) => {
  try {
    // OFFLINE MODE: Filter tasks by date range from localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
      
      return { tasks: filteredTasks, offline: true };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode silently
      const tasks = getOfflineTasks();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const filteredTasks = tasks.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= start && taskDate <= end;
      });
      
      return { tasks: filteredTasks, offline: true };
    }
  } catch (error) {
    // Return offline data instead of throwing
    const tasks = getOfflineTasks();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const filteredTasks = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return taskDate >= start && taskDate <= end;
    });
    
    return { tasks: filteredTasks, offline: true };
  }
};

// Update a task
export const updateTask = async (taskId, updates) => {
  try {
    clearCache(); // Clear cache on update

    // OFFLINE MODE: Update task in localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const taskIndex = tasks.findIndex(t => t._id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      saveOfflineTasks(tasks);
      
      return { task: tasks[taskIndex], offline: true };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode
      console.log('Backend unreachable, using offline mode');
      const tasks = getOfflineTasks();
      const taskIndex = tasks.findIndex(t => t._id === taskId);
      
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      saveOfflineTasks(tasks);
      
      return { task: tasks[taskIndex], offline: true };
    }
  } catch (error) {
    console.error('Update task error:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    clearCache(); // Clear cache on delete

    // OFFLINE MODE: Delete task from localStorage
    if (!isOnline()) {
      const tasks = getOfflineTasks();
      const filteredTasks = tasks.filter(t => t._id !== taskId);
      
      if (filteredTasks.length === tasks.length) {
        throw new Error('Task not found');
      }
      
      saveOfflineTasks(filteredTasks);
      return { message: 'Task deleted successfully', offline: true };
    }
    
    // ONLINE MODE: Try backend API, fallback to offline on error
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
    } catch (networkError) {
      // Backend unreachable, use offline mode
      console.log('Backend unreachable, using offline mode');
      const tasks = getOfflineTasks();
      const filteredTasks = tasks.filter(t => t._id !== taskId);
      
      if (filteredTasks.length === tasks.length) {
        throw new Error('Task not found');
      }
      
      saveOfflineTasks(filteredTasks);
      return { message: 'Task deleted successfully', offline: true };
    }
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};

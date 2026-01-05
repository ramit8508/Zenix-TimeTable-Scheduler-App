const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { taskName, duration, priority, category, notes, date } = req.body;
    
    // Create task with userId from authenticated user
    const task = Task.create({
      taskName,
      duration,
      priority,
      category,
      notes,
      date: date || new Date(),
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message,
    });
  }
};

// Get all tasks for a user
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = Task.findByUserId(req.userId);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

// Get tasks by date range
exports.getTasksByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const tasks = Task.findByDateRange(
      req.userId,
      new Date(startDate),
      new Date(endDate)
    );

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get tasks by date error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message,
    });
  }
};

// Get today's tasks
exports.getTodayTasks = async (req, res) => {
  try {
    const tasks = Task.findTodayTasks(req.userId);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error('Get today tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today tasks',
      error: error.message,
    });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const task = Task.update(id, req.userId, updates);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message,
    });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = Task.delete(id, req.userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message,
    });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    const stats = Task.getStats(req.userId);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task statistics',
      error: error.message,
    });
  }
};

const Task = require('../models/Task');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { taskName, duration, priority, category, notes, date } = req.body;
    
    // Create task with userId from authenticated user
    const task = await Task.create({
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
    const tasks = await Task.find({ userId: req.userId }).sort({ date: -1 });

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
    
    const tasks = await Task.find({
      userId: req.userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    }).sort({ date: 1 });

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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const tasks = await Task.find({
      userId: req.userId,
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

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

    const task = await Task.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updates,
      { new: true, runValidators: true }
    );

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

    const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });

    if (!task) {
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
    const userId = req.userId;
    
    // Total tasks
    const totalTasks = await Task.countDocuments({ userId });
    
    // Completed tasks
    const completedTasks = await Task.countDocuments({ userId, completed: true });
    
    // Today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = await Task.find({
      userId,
      date: { $gte: today, $lt: tomorrow },
    });
    
    const todayTotal = todayTasks.length;
    const todayCompleted = todayTasks.filter(task => task.completed).length;
    
    // Weekly hours
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weekTasks = await Task.find({
      userId,
      date: { $gte: weekStart },
    });
    
    const weeklyMinutes = weekTasks.reduce((sum, task) => sum + task.duration, 0);
    const weeklyHours = Math.round(weeklyMinutes / 60);

    res.status(200).json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        todayTotal,
        todayCompleted,
        weeklyHours,
      },
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

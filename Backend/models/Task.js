const { getDB, saveDB } = require('../db/connection');

class Task {
  // Helper to convert DB result to object array
  static _resultToObjects(result) {
    if (!result || result.length === 0 || !result[0].values || result[0].values.length === 0) {
      return [];
    }
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const obj = {};
      columns.forEach((col, idx) => {
        obj[col] = values[idx];
      });
      return this.formatTask(obj);
    });
  }

  // Helper to convert single DB result to object
  static _resultToObject(result) {
    const objects = this._resultToObjects(result);
    return objects.length > 0 ? objects[0] : null;
  }

  // Create a new task
  static create({ taskName, duration, priority = 'Medium', category = 'General', notes = '', date, userId }) {
    const db = getDB();
    
    // Validate input
    if (!taskName || taskName.trim().length === 0) {
      throw new Error('Please provide a task name');
    }
    if (taskName.length > 100) {
      throw new Error('Task name cannot be more than 100 characters');
    }
    if (!duration || duration < 1) {
      throw new Error('Duration must be at least 1 minute');
    }
    if (!['Low', 'Medium', 'High'].includes(priority)) {
      throw new Error('Priority must be Low, Medium, or High');
    }
    if (userId === undefined || userId === null) {
      throw new Error('User ID is required');
    }
    
    const taskDate = date ? new Date(date).toISOString() : new Date().toISOString();
    
    db.run(
      `INSERT INTO tasks (taskName, duration, priority, category, notes, date, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [taskName.trim(), duration, priority, category, notes || '', taskDate, userId]
    );
    
    saveDB(); // Save after modification
    
    // Query the inserted task by userId and date (ORDER BY id DESC to get latest)
    const taskResult = db.exec(
      'SELECT * FROM tasks WHERE userId = ? AND date = ? ORDER BY id DESC LIMIT 1',
      [userId, taskDate]
    );
    if (taskResult.length === 0 || taskResult[0].values.length === 0) {
      throw new Error('Failed to create task');
    }
    
    const columns = taskResult[0].columns;
    const values = taskResult[0].values[0];
    const task = {};
    columns.forEach((col, idx) => {
      task[col] = values[idx];
    });
    
    return this.formatTask(task);
  }

  // Find task by ID
  static findById(id) {
    const db = getDB();
    const result = db.exec('SELECT * FROM tasks WHERE id = ?', [Number(id)]);
    return this._resultToObject(result);
  }

  // Find all tasks for a user
  static findByUserId(userId, options = {}) {
    const db = getDB();
    let query = 'SELECT * FROM tasks WHERE userId = ?';
    const params = [userId];
    
    if (options.completed !== undefined) {
      query += ' AND completed = ?';
      params.push(options.completed ? 1 : 0);
    }
    
    query += ' ORDER BY date DESC, createdAt DESC';
    
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }
    
    const result = db.exec(query, params);
    return this._resultToObjects(result);
  }

  // Find tasks by date range
  static findByDateRange(userId, startDate, endDate) {
    const db = getDB();
    const result = db.exec(
      `SELECT * FROM tasks 
       WHERE userId = ? AND date >= ? AND date <= ?
       ORDER BY date ASC`,
      [userId, new Date(startDate).toISOString(), new Date(endDate).toISOString()]
    );
    
    return this._resultToObjects(result);
  }

  // Get today's tasks
  static findTodayTasks(userId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.findByDateRange(userId, today, tomorrow);
  }

  // Update task
  static update(id, userId, updates) {
    const db = getDB();
    
    // First verify task belongs to user
    const checkResult = db.exec('SELECT id FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      return null;
    }
    
    const allowedFields = ['taskName', 'duration', 'priority', 'category', 'notes', 'date', 'completed'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        if (key === 'date') {
          values.push(new Date(value).toISOString());
        } else if (key === 'completed') {
          values.push(value ? 1 : 0);
        } else {
          values.push(value);
        }
      }
    }
    
    if (fields.length === 0) {
      return this.findById(id);
    }
    
    values.push(id);
    db.run(
      `UPDATE tasks SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    saveDB(); // Save after modification
    
    return this.findById(id);
  }

  // Delete task
  static delete(id, userId) {
    const db = getDB();
    db.run('DELETE FROM tasks WHERE id = ? AND userId = ?', [id, userId]);
    saveDB(); // Save after modification
    return true;
  }

  // Get task statistics
  static getStats(userId) {
    const db = getDB();
    
    // Total and completed tasks
    const totalResult = db.exec('SELECT COUNT(*) as count FROM tasks WHERE userId = ?', [userId]);
    const totalTasks = totalResult[0].values[0][0];
    
    const completedResult = db.exec('SELECT COUNT(*) as count FROM tasks WHERE userId = ? AND completed = 1', [userId]);
    const completedTasks = completedResult[0].values[0][0];
    
    // Today's tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayResult = db.exec(
      `SELECT COUNT(*) as total, 
              SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE userId = ? AND date >= ? AND date < ?`,
      [userId, today.toISOString(), tomorrow.toISOString()]
    );
    const todayTotal = todayResult[0].values[0][0] || 0;
    const todayCompleted = todayResult[0].values[0][1] || 0;
    
    // Weekly hours
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const weeklyResult = db.exec(
      `SELECT SUM(duration) as totalMinutes
       FROM tasks
       WHERE userId = ? AND date >= ?`,
      [userId, weekStart.toISOString()]
    );
    const weeklyMinutes = weeklyResult[0].values[0][0] || 0;
    
    return {
      totalTasks,
      completedTasks,
      todayTotal,
      todayCompleted,
      weeklyHours: Math.round(weeklyMinutes / 60)
    };
  }

  // Count tasks
  static count(userId) {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM tasks WHERE userId = ?', [userId]);
    return result[0].values[0][0];
  }

  // Format task (convert SQLite integers to booleans)
  static formatTask(task) {
    if (!task) return null;
    return {
      ...task,
      completed: Boolean(task.completed),
      _id: task.id // Add MongoDB-style _id for frontend compatibility
    };
  }
}

module.exports = Task;

const bcrypt = require('bcryptjs');
const { getDB, saveDB } = require('../db/connection');

class User {
  // Create a new user
  static create({ name, email, password, role = 'student' }) {
    const db = getDB();
    
    // Validate input
    if (!name || name.trim().length === 0) {
      throw new Error('Please provide a name');
    }
    if (name.length > 50) {
      throw new Error('Name cannot be more than 50 characters');
    }
    if (!email || !email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
      throw new Error('Please provide a valid email');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    db.run(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase(), hashedPassword, role]
    );
    
    saveDB(); // Save after modification
    
    // Get the inserted user (sql.js last_insert_rowid doesn't work reliably)
    const result = db.exec('SELECT id, name, email, role, isActive, createdAt, updatedAt FROM users WHERE email = ?', [email.toLowerCase()]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      throw new Error('Failed to create user');
    }
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });
    
    return user;
  }

  // Find user by email
  static findByEmail(email, includePassword = false) {
    const db = getDB();
    const fields = includePassword 
      ? 'id, name, email, password, role, isActive, createdAt, updatedAt'
      : 'id, name, email, role, isActive, createdAt, updatedAt';
    
    const result = db.exec(`SELECT ${fields} FROM users WHERE email = ?`, [email.toLowerCase()]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });
    
    return user;
  }

  // Find user by ID
  static findById(id, includePassword = false) {
    const db = getDB();
    const fields = includePassword 
      ? 'id, name, email, password, role, isActive, createdAt, updatedAt'
      : 'id, name, email, role, isActive, createdAt, updatedAt';
    
    const result = db.exec(`SELECT ${fields} FROM users WHERE id = ?`, [id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return null;
    }
    
    const columns = result[0].columns;
    const values = result[0].values[0];
    const user = {};
    columns.forEach((col, idx) => {
      user[col] = values[idx];
    });
    
    return user;
  }

  // Update user
  static update(id, updates) {
    const db = getDB();
    const allowedFields = ['name', 'email', 'role', 'isActive'];
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    db.run(
      `UPDATE users SET ${fields.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
    
    saveDB(); // Save after modification
    
    return this.findById(id);
  }

  // Delete user
  static delete(id) {
    const db = getDB();
    db.run('DELETE FROM users WHERE id = ?', [id]);
    saveDB(); // Save after modification
    return true;
  }

  // Compare password
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (for admin)
  static findAll() {
    const db = getDB();
    const result = db.exec('SELECT id, name, email, role, isActive, createdAt, updatedAt FROM users');
    
    if (result.length === 0) {
      return [];
    }
    
    const columns = result[0].columns;
    return result[0].values.map(values => {
      const user = {};
      columns.forEach((col, idx) => {
        user[col] = values[idx];
      });
      return user;
    });
  }

  // Count users
  static count() {
    const db = getDB();
    const result = db.exec('SELECT COUNT(*) as count FROM users');
    return result[0].values[0][0];
  }
}

module.exports = User;

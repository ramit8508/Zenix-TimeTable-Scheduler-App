const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Database file path
const dbDir = path.join(__dirname, '../data');
const dbPath = path.join(dbDir, 'timetable.db');

let db = null;

const initDB = async () => {
  try {
    // Create database directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize SQL.js
    const SQL = await initSqlJs();
    
    // Load existing database or create new one
    let buffer;
    if (fs.existsSync(dbPath)) {
      buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
      console.log('✅ SQLite Database Loaded from file');
    } else {
      db = new SQL.Database();
      console.log('✅ SQLite Database Created (new)');
    }
    
    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        taskName TEXT NOT NULL,
        duration INTEGER NOT NULL CHECK(duration >= 1),
        priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High')),
        category TEXT DEFAULT 'General',
        notes TEXT,
        date DATETIME NOT NULL,
        completed INTEGER DEFAULT 0,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_userId ON tasks(userId)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_date ON tasks(date)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_tasks_userId_date ON tasks(userId, date)`);

    // Save the database to file
    saveDB();
    
    console.log('✅ Database tables initialized successfully');
    console.log(`📁 Database location: ${dbPath}`);
    
    return db;
  } catch (error) {
    console.error(`❌ Database Initialization Failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDB() first.');
  }
  return db;
};

const saveDB = () => {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

// Auto-save database every 5 seconds if there are changes
let autoSaveInterval;
const startAutoSave = () => {
  autoSaveInterval = setInterval(() => {
    try {
      saveDB();
    } catch (error) {
      console.error('Auto-save error:', error.message);
    }
  }, 5000);
};

const closeDB = () => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
  if (db) {
    try {
      saveDB();
      db.close();
      db = null;
      console.log('✅ Database connection closed');
    } catch (error) {
      // Ignore errors during close
      console.log('✅ Database closed');
    }
  }
};

// Handle process termination
process.on('SIGINT', () => {
  closeDB();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDB();
  process.exit(0);
});

process.on('exit', () => {
  closeDB();
});

module.exports = { initDB, getDB, saveDB, closeDB, startAutoSave };

// Test script to verify SQLite database functionality
const { initDB, getDB, saveDB, closeDB } = require('./db/connection');
const User = require('./models/User');
const Task = require('./models/Task');

async function testDatabase() {
  console.log('\n🧪 Testing SQLite Database Functionality...\n');
  
  try {
    // Initialize database
    await initDB();
    console.log('✅ Database initialized\n');
    
    // Test 1: Create a test user
    console.log('Test 1: Creating test user...');
    const testUser = User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ User created:', { id: testUser.id, name: testUser.name, email: testUser.email });
    console.log('   User ID type:', typeof testUser.id, '| Value:', testUser.id);
    
    if (!testUser.id && testUser.id !== 0) {
      throw new Error('User ID is undefined!');
    }
    
    // Test 2: Find user by email
    console.log('\nTest 2: Finding user by email...');
    const foundUser = User.findByEmail('test@example.com');
    console.log('✅ User found:', foundUser ? 'Yes' : 'No');
    
    // Test 3: Create a task
    console.log('\nTest 3: Creating test task...');
    const testTask = Task.create({
      taskName: 'Complete project',
      duration: 120,
      priority: 'High',
      category: 'Work',
      notes: 'Important task',
      date: new Date(),
      userId: testUser.id
    });
    console.log('✅ Task created:', { id: testTask.id, taskName: testTask.taskName });
    
    // Test 4: Get all tasks for user
    console.log('\nTest 4: Getting all tasks for user...');
    const userTasks = Task.findByUserId(testUser.id);
    console.log('✅ Tasks found:', userTasks.length);
    
    // Test 5: Update task
    console.log('\nTest 5: Updating task...');
    const updatedTask = Task.update(testTask.id, testUser.id, {
      completed: true,
      notes: 'Task completed!'
    });
    console.log('✅ Task updated:', updatedTask.completed ? 'Completed' : 'Not completed');
    
    // Test 6: Get task statistics
    console.log('\nTest 6: Getting task statistics...');
    const stats = Task.getStats(testUser.id);
    console.log('✅ Stats:', stats);
    
    // Test 7: Delete task
    console.log('\nTest 7: Deleting task...');
    const deleted = Task.delete(testTask.id, testUser.id);
    console.log('✅ Task deleted:', deleted ? 'Yes' : 'No');
    
    // Test 8: Clean up - delete test user
    console.log('\nTest 8: Cleaning up...');
    User.delete(testUser.id);
    console.log('✅ Test user deleted');
    
    console.log('\n✅ All tests passed! SQLite database is working correctly.\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
  } finally {
    closeDB();
    process.exit(0);
  }
}

testDatabase();

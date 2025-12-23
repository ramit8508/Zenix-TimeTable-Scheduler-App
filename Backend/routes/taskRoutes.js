const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// Task routes
router.post('/', taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/today', taskController.getTodayTasks);
router.get('/stats', taskController.getTaskStats);
router.get('/date-range', taskController.getTasksByDateRange);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;

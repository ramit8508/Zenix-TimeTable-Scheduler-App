const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { auth } = require('../middlewares/auth');

// All routes require authentication
router.use(auth);

// AI routes
router.post('/generate-plan', aiController.generatePlan);

module.exports = router;

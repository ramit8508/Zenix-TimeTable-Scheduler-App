// AI Controller - Stubbed for Future Implementation
// This will be implemented by your developer later with proper AI integration

/**
 * @route   POST /api/ai/generate-plan
 * @desc    Generate AI-powered schedule plan (OFFLINE - To be implemented)
 * @access  Private
 * 
 * This endpoint is currently stubbed to work offline.
 * Future implementation will include AI-powered schedule generation.
 * 
 * For now, it returns a basic template plan structure.
 */
exports.generatePlan = async (req, res) => {
  try {
    const { 
      availableHours = 6, 
      startTime = '09:00', 
      goals = ['Study', 'Work'], 
      startDate, 
      daysToPlan = 7, 
      deadline, 
      activeTasks = 0, 
      customTasks = [] 
    } = req.body;
    
    // Validation
    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required'
      });
    }

    // Generate a basic template plan (offline mode)
    const plan = {
      title: `Your ${daysToPlan}-Day Plan`,
      description: `A basic ${daysToPlan}-day schedule template. AI-powered generation will be available in future updates.`,
      schedule: []
    };

    // Create schedule template for each day
    for (let i = 0; i < daysToPlan; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + i);
      
      // Create basic task template
      const tasksTemplate = [
        `${startTime} - Morning Planning (30 min)`,
        `${addMinutes(startTime, 30)} - ${goals[0] || 'Focus Work'} (2 hours)`,
        `${addMinutes(startTime, 150)} - Break (15 min)`,
        `${addMinutes(startTime, 165)} - ${goals[1] || 'Learning'} (1.5 hours)`,
        `${addMinutes(startTime, 255)} - Review & Planning (30 min)`
      ];
      
      // Add custom tasks if provided
      if (customTasks.length > 0 && i < customTasks.length) {
        tasksTemplate.push(`${addMinutes(startTime, 300)} - ${customTasks[i]} (1 hour)`);
      }
      
      plan.schedule.push({
        day: i + 1,
        date: dayDate.toISOString().split('T')[0],
        tasks: tasksTemplate.join('\n'),
        totalHours: Math.min(availableHours, 6),
        taskCount: tasksTemplate.length
      });
    }

    res.status(200).json({
      success: true,
      plan,
      message: 'Basic plan generated (offline mode). AI features coming soon!',
      offline: true
    });

  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating plan',
      error: error.message
    });
  }
};

/**
 * Helper function to add minutes to a time string
 * @param {string} time - Time in HH:MM format
 * @param {number} minutes - Minutes to add
 * @returns {string} - New time in HH:MM format
 */
function addMinutes(time, minutes) {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes, 0, 0);
  return date.toTimeString().slice(0, 5);
}

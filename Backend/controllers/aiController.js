const Groq = require('groq-sdk');

// Initialize Groq client - API key will be stored in .env file
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

exports.generatePlan = async (req, res) => {
  try {
    const { availableHours, startTime, goals, startDate, daysToPlan, deadline, activeTasks, customTasks } = req.body;
    
    // Parse start time to create schedule
    const [startHour, startMinute] = (startTime || '09:00').split(':').map(Number);
    
    // Create prompt for Groq AI
    const prompt = `You are an expert time management and productivity assistant. Generate a detailed ${daysToPlan}-day schedule plan.

User Details:
- Available hours per day: ${availableHours} hours
- Daily start time: ${startTime || '09:00'} (tasks should start from this time)
- Goals: ${goals.join(', ')}
${customTasks && customTasks.length > 0 ? `- Custom tasks to include: ${customTasks.join(', ')}` : ''}
- Start date: ${startDate}
- ${deadline ? `Deadline: ${deadline}` : 'No specific deadline'}
- Currently has ${activeTasks} active tasks

Create a smart, balanced schedule that:
1. Starts each day at ${startTime || '09:00'} (important: respect this start time)
2. Distributes tasks evenly across ${daysToPlan} days
3. Respects the ${availableHours}h daily limit
4. Includes breaks and buffer time
5. Prioritizes based on goals: ${goals.join(', ')}
${customTasks && customTasks.length > 0 ? `6. Includes all custom tasks: ${customTasks.join(', ')}` : ''}
6. Provides specific time slots for each task

Format your response as JSON with this structure:
{
  "title": "Your Smart ${daysToPlan}-Day Plan",
  "description": "Brief overview of the plan approach",
  "schedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "tasks": "${startTime || '09:00'} - First task\\n10:30 - Break\\n11:00 - Second task",
      "totalHours": 6,
      "taskCount": 3
    }
  ]
}

IMPORTANT: 
- The "tasks" field MUST be a single string with tasks separated by \\n (newline)
- Format tasks starting from ${startTime || '09:00'} as "HH:MM - Task description"
- Use 24-hour format (e.g., 14:00 for 2 PM) or 12-hour with AM/PM
- Do NOT use arrays or objects for tasks
- Make the plan realistic, motivating, and achievable.
- ALL tasks must start from ${startTime || '09:00'} or later`;

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a professional productivity coach and time management expert. You create realistic, achievable schedule plans that help people balance their goals and maintain work-life balance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2048,
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    let plan;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        plan = JSON.parse(jsonMatch[0]);
        
        // Add dates to schedule if not provided by AI
        const start = new Date(startDate);
        plan.schedule = plan.schedule.map((day, index) => {
          const dayDate = new Date(start);
          dayDate.setDate(start.getDate() + index);
          
          // Ensure tasks is a string, not an array or object
          let tasksString = day.tasks;
          if (Array.isArray(day.tasks)) {
            tasksString = day.tasks.map(t => {
              if (typeof t === 'object') {
                return `${t.time || ''} - ${t.task || t.description || ''}`;
              }
              return String(t);
            }).join('\n');
          } else if (typeof day.tasks === 'object') {
            tasksString = JSON.stringify(day.tasks, null, 2);
          } else {
            tasksString = String(day.tasks || 'No tasks specified');
          }
          
          return {
            ...day,
            date: day.date || dayDate.toISOString().split('T')[0],
            tasks: tasksString,
            totalHours: day.totalHours || availableHours,
            taskCount: day.taskCount || 3
          };
        });
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback plan structure
      plan = {
        title: `Your Smart ${daysToPlan}-Day Plan`,
        description: aiResponse.substring(0, 200),
        schedule: Array.from({ length: daysToPlan }, (_, i) => {
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + i);
          return {
            day: i + 1,
            date: dayDate.toISOString().split('T')[0],
            tasks: `Day ${i + 1} tasks from AI`,
            totalHours: Math.min(availableHours, 6),
            taskCount: 3
          };
        })
      };
    }

    res.status(200).json({
      success: true,
      plan,
      message: 'Plan generated successfully'
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

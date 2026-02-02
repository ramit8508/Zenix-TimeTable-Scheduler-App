const { Ollama } = require('ollama');
const ollama = new Ollama();

exports.generatePlan = async (req, res) => {
  try {
    const { 
      availableHours = 6, 
      startTime = '09:00', 
      goals = ['Study', 'Work'], 
      startDate, 
      daysToPlan = 7, 
      customTasks = [] 
    } = req.body;

    if (!startDate) {
      return res.status(400).json({ success: false, message: 'Start date is required' });
    }

    // 1. Construct the AI Prompt
    const systemPrompt = `You are a scheduling assistant. Generate a ${daysToPlan}-day plan starting from ${startDate}.
    Constraints: 
    - Max ${availableHours} hours per day.
    - Starting at ${startTime}.
    - Focus goals: ${goals.join(', ')}.
    - Include these specific tasks: ${customTasks.join(', ')}.
    
    Response format: Provide ONLY a JSON object with this structure:
    {
      "title": "String",
      "description": "String",
      "schedule": [
        { "day": 1, "date": "YYYY-MM-DD", "tasks": "String with newlines", "totalHours": number, "taskCount": number }
      ]
    }`;

    // 2. Call local Ollama model
    const response = await ollama.chat({
      model: 'llama3.1:8b-instruct-q8_0', // Ensure you have pulled this: 'ollama pull llama3'
      messages: [{ role: 'user', content: systemPrompt }],
      format: 'json', // Forces Ollama to output valid JSON
      options: { temperature: 0.7 }
    });

    // 3. Parse the AI response
    const planData = JSON.parse(response.message.content);

    res.status(200).json({
      success: true,
      plan: planData,
      message: 'AI plan generated locally via Ollama',
      offline: false
    });

  } catch (error) {
    console.error('Ollama Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'AI generation failed. Ensure Ollama is running.',
      error: error.message
    });
  }
};

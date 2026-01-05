import React, { useState } from 'react';
import { FiX, FiCalendar, FiTarget, FiClock, FiTrendingUp, FiPlus, FiTrash2 } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import '../Styles/AIPlanGenerator.css';

export default function AIPlanGenerator({ isOpen, onClose, activeTasks, onPlanGenerated }) {
  const [formData, setFormData] = useState({
    availableHours: 6,
    startTime: '09:00',
    goals: [],
    customTasks: [],
    startDate: new Date().toISOString().split('T')[0],
    daysToPlan: 7,
    deadline: '',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');

  const goalOptions = [
    'Study / Learning',
    'Work Projects',
    'Fitness / Health',
    'Revision / Review',
    'Personal Development',
    'Creative Projects'
  ];

  const handleGoalToggle = (goal) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addCustomTask = () => {
    if (newTaskName.trim()) {
      setFormData(prev => ({
        ...prev,
        customTasks: [...prev.customTasks, newTaskName.trim()]
      }));
      setNewTaskName('');
    }
  };

  const removeCustomTask = (index) => {
    setFormData(prev => ({
      ...prev,
      customTasks: prev.customTasks.filter((_, i) => i !== index)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomTask();
    }
  };

  const generatePlan = async () => {
    if (formData.goals.length === 0 && formData.customTasks.length === 0) {
      alert('Please select at least one goal or add custom tasks');
      return;
    }

    setIsGenerating(true);
    
    try {
      const totalTasksToSchedule = activeTasks + formData.customTasks.length;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${API_BASE_URL}/ai/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          activeTasks,
          totalTasksToSchedule
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGeneratedPlan(data.plan);
      } else {
        alert('Failed to generate plan: ' + data.message);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlanEdit = (dayIndex, field, value) => {
    setGeneratedPlan(prev => {
      const updated = { ...prev };
      updated.schedule[dayIndex][field] = value;
      return updated;
    });
  };

  const savePlan = () => {
    if (onPlanGenerated) {
      onPlanGenerated(generatedPlan);
    }
    onClose();
  };

  const regeneratePlan = async () => {
    setGeneratedPlan(null);
    await generatePlan();
  };

  if (!isOpen) return null;

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-modal-title">
            <MdAutoAwesome className="ai-icon" />
            <h2>AI Plan Generator</h2>
          </div>
          <button className="ai-close-btn" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="ai-modal-body">
          {!generatedPlan ? (
            <>
              <p className="ai-subtitle">Configure your schedule preferences</p>

              {/* Available Hours */}
              <div className="ai-form-section">
                <label className="ai-form-label">
                  <FiClock /> Available Hours per Day
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    name="availableHours"
                    min="1"
                    max="16"
                    value={formData.availableHours}
                    onChange={handleInputChange}
                    className="ai-slider"
                  />
                  <span className="slider-value">{formData.availableHours}h</span>
                </div>
              </div>

              {/* Start Time */}
              <div className="ai-form-section">
                <label className="ai-form-label">
                  <FiClock /> Start Time (e.g., after school/work)
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="ai-input"
                />
                <p className="ai-helper-text">Tasks will be scheduled starting from this time</p>
              </div>

              {/* Goals */}
              <div className="ai-form-section">
                <label className="ai-form-label">
                  <FiTarget /> Your Goals
                </label>
                <div className="goals-grid">
                  {goalOptions.map(goal => (
                    <button
                      key={goal}
                      className={`goal-btn ${formData.goals.includes(goal) ? 'active' : ''}`}
                      onClick={() => handleGoalToggle(goal)}
                    >
                      <div className="goal-radio"></div>
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="ai-form-row">
                <div className="ai-form-group">
                  <label className="ai-form-label">
                    <FiCalendar /> Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="ai-input"
                  />
                </div>

                <div className="ai-form-group">
                  <label className="ai-form-label">Days to Plan</label>
                  <input
                    type="number"
                    name="daysToPlan"
                    value={formData.daysToPlan}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className="ai-input"
                  />
                </div>
              </div>

              <div className="ai-form-section">
                <label className="ai-form-label">Deadline (optional)</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="ai-input"
                />
              </div>

              {/* Custom Tasks */}
              <div className="ai-form-section">
                <label className="ai-form-label">
                  <FiPlus /> Add Custom Tasks
                </label>
                <div className="custom-task-input-group">
                  <input
                    type="text"
                    placeholder="Type a task name..."
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="ai-input custom-task-input"
                  />
                  <button 
                    className="add-task-btn"
                    onClick={addCustomTask}
                    type="button"
                  >
                    <FiPlus /> Add
                  </button>
                </div>

                {formData.customTasks.length > 0 && (
                  <div className="custom-tasks-list">
                    {formData.customTasks.map((task, index) => (
                      <div key={index} className="custom-task-item">
                        <span>{task}</span>
                        <button 
                          className="remove-task-btn"
                          onClick={() => removeCustomTask(index)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Tasks Info */}
              <div className="active-tasks-info">
                <FiTrendingUp />
                <div className="tasks-count-info">
                  <span className="task-count-primary">
                    {activeTasks + formData.customTasks.length} total task{(activeTasks + formData.customTasks.length) !== 1 ? 's' : ''} to schedule
                  </span>
                  <div className="task-count-breakdown">
                    <span>{activeTasks} existing</span>
                    {formData.customTasks.length > 0 && (
                      <span> + {formData.customTasks.length} custom</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button 
                className="generate-plan-btn" 
                onClick={generatePlan}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="spinner"></div>
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <MdAutoAwesome />
                    Generate Smart Plan
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Generated Plan Display */}
              <div className="generated-plan">
                <div className="plan-header">
                  <h3>{generatedPlan.title}</h3>
                  <button 
                    className="edit-toggle-btn"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Preview' : 'Edit Plan'}
                  </button>
                </div>

                <p className="plan-description">{generatedPlan.description}</p>

                <div className="plan-schedule">
                  {generatedPlan.schedule?.map((day, index) => (
                    <div key={index} className="plan-day-card">
                      <div className="plan-day-header">
                        <h4>Day {day.day}</h4>
                        <span className="plan-day-date">{day.date}</span>
                      </div>
                      {editMode ? (
                        <textarea
                          value={day.tasks}
                          onChange={(e) => handlePlanEdit(index, 'tasks', e.target.value)}
                          className="plan-edit-textarea"
                          rows="4"
                        />
                      ) : (
                        <p className="plan-day-tasks" style={{ whiteSpace: 'pre-line' }}>
                          {typeof day.tasks === 'string' ? day.tasks : JSON.stringify(day.tasks, null, 2)}
                        </p>
                      )}
                      <div className="plan-day-meta">
                        <span>⏱ {day.totalHours}h</span>
                        <span>📝 {day.taskCount} tasks</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="plan-actions">
                  <button className="change-settings-btn" onClick={() => setGeneratedPlan(null)}>
                    Change Settings
                  </button>
                  <button className="regenerate-btn" onClick={regeneratePlan} disabled={isGenerating}>
                    {isGenerating ? (
                      <>
                        <div className="spinner-small"></div>
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <MdAutoAwesome />
                        Regenerate Different Plan
                      </>
                    )}
                  </button>
                  <button className="save-plan-btn" onClick={savePlan}>
                    Save & Apply Plan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

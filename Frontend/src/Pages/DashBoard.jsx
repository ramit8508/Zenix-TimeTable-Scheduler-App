import React, { useState, useEffect, useCallback, useMemo, memo } from 'react'
import NavBarForDash from '../Components/NavBarForDash'
import AIPlanGenerator from '../Components/AIPlanGenerator'
import { useAuth } from '../context/AuthContext'
import '../Styles/DashBoard.css'
import { FiTarget } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { CiClock1 } from "react-icons/ci";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { createTask, getTaskStats, getTasksByDateRange, getAllTasks, updateTask, deleteTask } from '../services/taskService';


export default function DashBoard({ theme, toggleTheme }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')
  const [weekOffset, setWeekOffset] = useState(0)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDayModal, setShowDayModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [taskStats, setTaskStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    todayTotal: 0,
    todayCompleted: 0,
    weeklyHours: 0,
  })
  const [weeklyTasks, setWeeklyTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [showAIPlanModal, setShowAIPlanModal] = useState(false)
  const [taskForm, setTaskForm] = useState({
    taskName: '',
    duration: 30,
    priority: 'Medium',
    category: 'General',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  })

  // Fetch task statistics and weekly tasks
  useEffect(() => {
    fetchTaskStats()
    fetchWeeklyTasks()
    fetchAllTasks()
  }, [weekOffset])

  // Desktop notification system for Electron app - hourly task reminders
  useEffect(() => {
    // Only run if there are tasks
    if (allTasks.length === 0) return

    const isElectron = window.electron !== undefined
    
    if (!isElectron && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const sendNotification = (title, body, tasks = []) => {
      if (isElectron && window.electron?.sendNotification) {
        window.electron.sendNotification({
          title,
          body,
          icon: '/vite.svg',
          tasks: tasks.slice(0, 3).map(t => ({
            name: t.taskName,
            priority: t.priority,
            duration: t.duration
          })),
          timestamp: new Date().toISOString()
        })
      } else if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/vite.svg',
          badge: '/vite.svg',
          tag: 'zenix-task-reminder',
          requireInteraction: false,
          silent: false,
          timestamp: Date.now()
        })
      }
    }

    const checkIncompleteTasks = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const todayIncompleteTasks = allTasks.filter(task => {
        const taskDate = new Date(task.date)
        return taskDate >= today && taskDate < tomorrow && !task.completed
      })
      
      if (todayIncompleteTasks.length > 0) {
        let notificationBody = `You have ${todayIncompleteTasks.length} incomplete task${todayIncompleteTasks.length > 1 ? 's' : ''} today:\\n\\n`
        
        todayIncompleteTasks.slice(0, 3).forEach((task, index) => {
          notificationBody += `${index + 1}. ${task.taskName} [${task.priority}] - ${task.duration}min\\n`
        })
        
        if (todayIncompleteTasks.length > 3) {
          notificationBody += `\\n+${todayIncompleteTasks.length - 3} more tasks...`
        }

        sendNotification('⏰ Zenix Task Reminder', notificationBody, todayIncompleteTasks)
      }
    }

    // Delay initial check to 10 seconds to avoid blocking on load
    const initialTimeout = setTimeout(checkIncompleteTasks, 10000)
    const reminderInterval = setInterval(checkIncompleteTasks, 1 * 60 * 60 * 1000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(reminderInterval)
    }
  }, [allTasks.length]) // Only re-run when task count changes, not on every task update

  const fetchTaskStats = useCallback(async () => {
    try {
      const response = await getTaskStats()
      if (response.success || response.offline) {
        const stats = response.stats
        setTaskStats({
          totalTasks: stats.total || stats.totalTasks || 0,
          completedTasks: stats.completed || stats.completedTasks || 0,
          todayTotal: stats.todayTotal || 0,
          todayCompleted: stats.todayCompleted || 0,
          weeklyHours: stats.weeklyHours || 0,
        })
      }
    } catch (error) {
      console.error('Error fetching task stats:', error)
      setTaskStats({
        totalTasks: 0,
        completedTasks: 0,
        todayTotal: 0,
        todayCompleted: 0,
        weeklyHours: 0,
      })
    }
  }, [])

  const fetchAllTasks = useCallback(async () => {
    try {
      const response = await getAllTasks()
      if (response.success || response.offline) {
        setAllTasks(response.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching all tasks:', error)
      setAllTasks([])
    }
  }, [])

  const fetchWeeklyTasks = useCallback(async () => {
    try {
      const weekDates = getWeekDates(weekOffset)
      const startDate = weekDates[0]
      const endDate = new Date(weekDates[6])
      endDate.setHours(23, 59, 59, 999)

      const response = await getTasksByDateRange(startDate, endDate)
      if (response.success || response.offline) {
        setWeeklyTasks(response.tasks || [])
      }
    } catch (error) {
      console.error('Error fetching weekly tasks:', error)
      setWeeklyTasks([])
    }
  }, [weekOffset])

  const handleCreateTask = useCallback(async (e) => {
    e.preventDefault()
    
    if (!taskForm.taskName.trim()) {
      alert('Please enter a task name')
      return
    }

    try {
      const response = await createTask(taskForm)
      if (response.success || response.offline || response.task) {
        alert('Task created successfully!')
        setShowTaskModal(false)
        setTaskForm({
          taskName: '',
          duration: 30,
          priority: 'Medium',
          category: 'General',
          notes: '',
          date: new Date().toISOString().split('T')[0],
        })
        fetchTaskStats()
        fetchWeeklyTasks()
        fetchAllTasks()
      }
    } catch (error) {
      alert('Error creating task: ' + error.message)
    }
  }, [taskForm, fetchTaskStats, fetchWeeklyTasks, fetchAllTasks])

  const handleToggleComplete = useCallback(async (taskId, currentStatus) => {
    try {
      const response = await updateTask(taskId, { completed: !currentStatus })
      if (response.success || response.offline || response.task) {
        fetchTaskStats()
        fetchWeeklyTasks()
        fetchAllTasks()
      }
    } catch (error) {
      alert('Error updating task: ' + error.message)
    }
  }, [fetchTaskStats, fetchWeeklyTasks, fetchAllTasks])

  const handleDeleteTask = useCallback(async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      const response = await deleteTask(taskId)
      if (response.success || response.offline || response.message) {
        alert('Task deleted successfully!')
        fetchTaskStats()
        fetchWeeklyTasks()
        fetchAllTasks()
      }
    } catch (error) {
      alert('Error deleting task: ' + error.message)
    }
  }, [fetchTaskStats, fetchWeeklyTasks, fetchAllTasks])

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setShowDayModal(true)
  }

  const getSelectedDateTasks = () => {
    if (!selectedDate) return []
    return getTasksForDate(selectedDate)
  }

  const handlePlanGenerated = async (plan) => {
    try {
      console.log('Creating tasks from AI plan:', plan);
      
      // Create individual tasks from each day in the schedule
      const allTaskPromises = [];
      
      plan.schedule.forEach((day) => {
        // Split tasks by newline and parse each task
        const tasksArray = day.tasks.split('\n').filter(t => t.trim());
        
        tasksArray.forEach((taskLine, idx) => {
          // Parse task: "09:00 - Study Math" or "Study Math"
          const timeMatch = taskLine.match(/^(\d{1,2}:\d{2})\s*(?:AM|PM|am|pm)?\s*-\s*(.+)$/);
          
          let taskName, taskTime;
          if (timeMatch) {
            taskTime = timeMatch[1];
            taskName = timeMatch[2].trim();
          } else {
            // No time format found, use the whole line
            taskName = taskLine.trim();
          }
          
          // Skip empty tasks or just break mentions
          if (!taskName || taskName.toLowerCase() === 'break') return;
          
          // Estimate duration (divide available hours by number of tasks)
          const estimatedDuration = Math.floor((day.totalHours * 60) / day.taskCount);
          
          const taskPromise = createTask({
            taskName: `${taskName}${taskTime ? ` (${taskTime})` : ''}`,
            duration: estimatedDuration || 60,
            priority: idx === 0 ? 'High' : idx < tasksArray.length / 2 ? 'Medium' : 'Low',
            category: 'AI Generated',
            notes: `From: ${plan.title}\nDay ${day.day} schedule${taskTime ? `\nScheduled at: ${taskTime}` : ''}`,
            date: day.date,
          });
          
          allTaskPromises.push(taskPromise);
        });
      });

      await Promise.all(allTaskPromises);
      
      // Refresh dashboard data
      await fetchTaskStats();
      await fetchWeeklyTasks();
      await fetchAllTasks();
      
      alert(`Success! Created ${allTaskPromises.length} tasks from your AI plan.`);
    } catch (error) {
      console.error('Error creating tasks from plan:', error);
      alert('Error creating tasks. Please try again.');
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setTaskForm(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    return weeklyTasks.filter(task => {
      const taskDate = new Date(task.date)
      return taskDate.toDateString() === date.toDateString()
    })
  }

  // Get week dates with offset
  const getWeekDates = (offset = 0) => {
    const today = new Date()
    const currentDay = today.getDay()
    const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
    const startDate = new Date(today.setDate(diff + (offset * 7)))
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const handlePrevWeek = () => {
    setWeekOffset(weekOffset - 1)
  }

  const handleNextWeek = () => {
    setWeekOffset(weekOffset + 1)
  }

  const handleToday = () => {
    setWeekOffset(0)
  }

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const currentWeek = getWeekDates(weekOffset)
  const today = new Date()
  const isCurrentWeek = weekOffset === 0

  // Calculate overall progress percentage
  const overallProgress = taskStats.totalTasks > 0 
    ? Math.round((taskStats.completedTasks / taskStats.totalTasks) * 100) 
    : 0

  // Get active (not completed) and completed tasks
  const activeTasks = allTasks.filter(task => !task.completed)
  const completedTasks = allTasks.filter(task => task.completed)

  return (
   
    <>
    <NavBarForDash theme={theme} toggleTheme={toggleTheme} />
    <div className="home-dash">
      <h1 className='dash-heading'>Welcome Back, {user?.name || 'User'}!</h1>
      <h2 className='dash-subheading'>Let's make today productive. Here's your overview.</h2>
    </div>
    <div className="achieve-boxes">
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Total Tasks</h1>
          <h1 className='subheading-achive'>{taskStats.totalTasks}</h1>
        </div>
        <FiTarget className='icon-achieve1' />

      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Completed</h1>
          <h1 className='subheading-achive'>{taskStats.completedTasks}</h1>
        </div>
        <FaRegCircleCheck className='icon-achieve2' />
      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Today</h1>
          <h1 className='subheading-achive'>{taskStats.todayCompleted}/{taskStats.todayTotal}</h1>
        </div>
        <SlCalender className='icon-achieve3' />
      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Weekly Hours</h1>
          <h1 className='subheading-achive'>{taskStats.weeklyHours}h</h1>
        </div>
        <CiClock1 className='icon-achieve4' />
      </div>
    </div>

    {/* Overall Progress Bar */}
    <div className="progress-section">
      <div className="progress-header">
        <h3 className="progress-title">📈 Overall Progress</h3>
        <span className="progress-percentage">{overallProgress}%</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>
    </div>

    <div className="buttons-dash">
      <button className="ai-mode" onClick={() => setShowAIPlanModal(true)}>Generate AI Plan</button>
      <button className="add-task-btn" onClick={() => setActiveTab('tasks')}>Manage Tasks</button>
    </div>

    {/* Tabs Section */}
    <div className="tabs-section">
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <SlCalender className="tab-icon" />
          Calendar
        </button>
        <button 
          className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <FiTarget className="tab-icon" />
          Tasks
        </button>
      </div>
    </div>

    {/* Weekly Schedule Section */}
    {activeTab === 'calendar' && (
      <div className="weekly-schedule">
        <div className="schedule-header">
          <h2 className="schedule-title">Weekly Schedule</h2>
          <div className="schedule-controls">
            <button className="today-btn" onClick={handleToday}>Today</button>
            <button className="nav-btn" onClick={handlePrevWeek}><MdNavigateBefore size={20} /></button>
            <span className="date-range">
              {currentWeek[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {currentWeek[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <button className="nav-btn" onClick={handleNextWeek}><MdNavigateNext size={20} /></button>
          </div>
        </div>

        <div className="week-grid">
          {currentWeek.map((date, index) => {
            const isToday = isCurrentWeek && date.toDateString() === today.toDateString()
            const dayTasks = getTasksForDate(date)
            return (
              <div 
                key={index} 
                className="day-column"
                onClick={() => handleDayClick(date)}
                style={{ cursor: 'pointer' }}
              >
                <div className="day-header">
                  <div className="day-info">
                    <span className="day-name">{weekDays[index]}</span>
                    <span className={`day-number ${isToday ? 'today' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                </div>
                <div className="day-tasks">
                  {dayTasks.length > 0 ? (
                    dayTasks.slice(0, 3).map((task) => (
                      <div key={task._id} className={`task-item ${task.completed ? 'task-completed' : ''}`}>
                        <div className="task-name">
                          {task.completed && <FaRegCircleCheck className="task-check-icon" />}
                          {task.taskName}
                        </div>
                        <div className="task-duration">{task.duration} min</div>
                        <div className={`task-priority priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-tasks">No tasks</p>
                  )}
                  {dayTasks.length > 3 && (
                    <p className="more-tasks">+{dayTasks.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )}

    {/* AI Plan Generator Modal */}
    <AIPlanGenerator 
      isOpen={showAIPlanModal}
      onClose={() => setShowAIPlanModal(false)}
      activeTasks={activeTasks.length}
      onPlanGenerated={handlePlanGenerated}
    />

    {/* Day Detail Modal */}
    {showDayModal && selectedDate && (
      <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
        <div className="modal-content day-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h2>
            <button className="close-btn" onClick={() => setShowDayModal(false)}>×</button>
          </div>
          
          <div className="day-modal-content">
            {getSelectedDateTasks().length > 0 ? (
              <div className="day-tasks-list">
                {getSelectedDateTasks().map((task) => (
                  <div key={task._id} className={`day-task-card ${task.completed ? 'completed-task' : ''}`}>
                    <div className="task-card-left">
                      <button 
                        className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                        onClick={() => handleToggleComplete(task._id, task.completed)}
                      >
                        <div className="checkbox-circle">
                          {task.completed && <FaRegCircleCheck />}
                        </div>
                      </button>
                      <div className="task-details">
                        <h4 className={`task-card-name ${task.completed ? 'completed-text' : ''}`}>
                          {task.taskName}
                        </h4>
                        <div className="task-meta">
                          <span className="task-card-duration">⏱ {task.duration} min</span>
                          <span className="task-card-category">{task.category}</span>
                          <span className={`task-card-priority priority-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.notes && <p className="task-notes">{task.notes}</p>}
                      </div>
                    </div>
                    <div className="task-card-actions">
                      <button 
                        className="task-action-btn delete-btn"
                        onClick={() => {
                          handleDeleteTask(task._id)
                          setShowDayModal(false)
                        }}
                        title="Delete task"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-tasks-day">
                <p>No tasks scheduled for this day</p>
                <button 
                  className="add-task-for-day-btn"
                  onClick={() => {
                    setTaskForm({
                      ...taskForm,
                      date: selectedDate.toISOString().split('T')[0]
                    })
                    setShowDayModal(false)
                    setShowTaskModal(true)
                  }}
                >
                  + Add Task for This Day
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* Tasks Tab Section */}
    {activeTab === 'tasks' && (
      <div className="tasks-section">
        <button className="add-new-task-btn" onClick={() => setShowTaskModal(true)}>
          + Add New Task
        </button>

        {/* Active Tasks */}
        <div className="task-list-section">
          <h3 className="task-list-title">
            <FiTarget className="task-list-icon" />
            Active Tasks ({activeTasks.length})
          </h3>
          
          {activeTasks.length > 0 ? (
            <>
              {Object.entries(
                activeTasks.reduce((groups, task) => {
                  const taskDate = new Date(task.date);
                  const dateKey = taskDate.toISOString().split('T')[0];
                  if (!groups[dateKey]) groups[dateKey] = [];
                  groups[dateKey].push(task);
                  return groups;
                }, {})
              )
              .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
              .map(([dateKey, tasks]) => {
                const displayDate = new Date(dateKey).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric'
                });
                return (
                  <div key={dateKey} className="day-task-group">
                    <div className="day-task-header">
                      <SlCalender className="day-icon" />
                      <span className="day-date">{displayDate}</span>
                      <span className="day-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="task-list">
                      {tasks.map((task) => (
                        <div key={task._id} className="task-card">
                          <div className="task-card-left">
                            <button 
                              className="task-checkbox"
                              onClick={() => handleToggleComplete(task._id, task.completed)}
                            >
                              <div className="checkbox-circle"></div>
                            </button>
                            <div className="task-details">
                              <h4 className="task-card-name">{task.taskName}</h4>
                              <div className="task-meta">
                                <span className="task-card-duration">⏱ {task.duration} min</span>
                                <span className="task-card-category">{task.category}</span>
                                <span className={`task-card-priority priority-${task.priority.toLowerCase()}`}>
                                  {task.priority}
                                </span>
                              </div>
                              {task.notes && <p className="task-notes">{task.notes}</p>}
                            </div>
                          </div>
                          <div className="task-card-actions">
                            <button 
                              className="task-action-btn delete-btn"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete task"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="no-tasks-message">No active tasks. Create one to get started!</p>
          )}
        </div>

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="task-list-section">
            <h3 className="task-list-title completed-title">
              <FaRegCircleCheck className="task-list-icon" />
              Completed Tasks ({completedTasks.length})
            </h3>
            
            <>
              {Object.entries(
                completedTasks.reduce((groups, task) => {
                  const taskDate = new Date(task.date);
                  const dateKey = taskDate.toISOString().split('T')[0];
                  if (!groups[dateKey]) groups[dateKey] = [];
                  groups[dateKey].push(task);
                  return groups;
                }, {})
              )
              .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
              .map(([dateKey, tasks]) => {
                const displayDate = new Date(dateKey).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric'
                });
                return (
                  <div key={dateKey} className="day-task-group">
                    <div className="day-task-header completed-header">
                      <SlCalender className="day-icon" />
                      <span className="day-date">{displayDate}</span>
                      <span className="day-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="task-list">
                      {tasks.map((task) => (
                        <div key={task._id} className="task-card completed-task">
                          <div className="task-card-left">
                            <button 
                              className="task-checkbox checked"
                              onClick={() => handleToggleComplete(task._id, task.completed)}
                            >
                              <div className="checkbox-circle">
                                <FaRegCircleCheck />
                              </div>
                            </button>
                            <div className="task-details">
                              <h4 className="task-card-name completed-text">{task.taskName}</h4>
                              <div className="task-meta">
                                <span className="task-card-duration">⏱ {task.duration} min</span>
                                <span className="task-card-category">{task.category}</span>
                                <span className={`task-card-priority priority-${task.priority.toLowerCase()}`}>
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="task-card-actions">
                            <button 
                              className="task-action-btn delete-btn"
                              onClick={() => handleDeleteTask(task._id)}
                              title="Delete task"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          </div>
        )}
      </div>
    )}

    {/* Task Modal */}
    {showTaskModal && (
      <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Create New Task</h2>
            <button className="close-btn" onClick={() => setShowTaskModal(false)}>×</button>
          </div>
          
          <form onSubmit={handleCreateTask} className="task-form">
            <div className="form-group">
              <label htmlFor="taskName">Task Name *</label>
              <input
                type="text"
                id="taskName"
                name="taskName"
                value={taskForm.taskName}
                onChange={handleInputChange}
                placeholder="e.g., Study Mathematics"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="duration">Duration (minutes)</label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={taskForm.duration}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select
                  id="priority"
                  name="priority"
                  value={taskForm.priority}
                  onChange={handleInputChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={taskForm.category}
                  onChange={handleInputChange}
                  placeholder="General"
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={taskForm.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={taskForm.notes}
                onChange={handleInputChange}
                placeholder="Add any notes..."
                rows="3"
              ></textarea>
            </div>

            <div className="modal-actions">
              <button type="submit" className="create-task-btn">Create Task</button>
              <button type="button" className="cancel-btn" onClick={() => setShowTaskModal(false)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    )}

    </>
  )
}


import React, { useState, useEffect } from 'react'
import NavBarForDash from '../Components/NavBarForDash'
import { useAuth } from '../context/AuthContext'
import '../Styles/DashBoard.css'
import { FiTarget } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { SlCalender } from "react-icons/sl";
import { CiClock1 } from "react-icons/ci";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";


export default function DashBoard({ theme, toggleTheme }) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')
  const [weekOffset, setWeekOffset] = useState(0)

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
          <h1 className='subheading-achive'>0</h1>
        </div>
        <FiTarget className='icon-achieve1' />

      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Completed</h1>
          <h1 className='subheading-achive'>0</h1>
        </div>
        <FaRegCircleCheck className='icon-achieve2' />
      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Today</h1>
          <h1 className='subheading-achive'>0/0</h1>
        </div>
        <SlCalender className='icon-achieve3' />
      </div>
      <div className="achieve-box">
        <div className="heading-box">
          <h1 className='heading-achive'>Weekly Hours</h1>
          <h1 className='subheading-achive'>0h</h1>
        </div>
        <CiClock1 className='icon-achieve4' />
      </div>
    </div>
    <div className="buttons-dash">
      <button className="ai-mode">Generate AI Plan</button>
      <button className="add-task-btn">Manage Tasks</button>
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
            return (
              <div key={index} className="day-column">
                <div className="day-header">
                  <div className="day-info">
                    <span className="day-name">{weekDays[index]}</span>
                    <span className={`day-number ${isToday ? 'today' : ''}`}>
                      {date.getDate()}
                    </span>
                  </div>
                </div>
                <div className="day-tasks">
                  <p className="no-tasks">No tasks</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )}

    </>
  )
}


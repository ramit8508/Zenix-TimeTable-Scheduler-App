import React from "react";
import "../Styles/Home.css";
import HomeImage from "../../Assets/Home-image.jpeg";

function Home() {
  return (
    <>
      <div className="Home-container">
        <div className="text-container">
          <div className="ai-heading">
            <span className="sparkle-icon">✨</span>
            <span>AI-Powered Scheduling</span>
          </div>
          <h1 className="Home-heading">
            Master Your Time with <span className="highlight">Intelligent Planning</span>
          </h1>
          <p className="Home-para">
            Stop struggling with schedules. Let AI create personalized
            timetables that adapt to your goals, priorities, and lifestyle.
          </p>
          <div className="button-container">
            <button className="home-start">
              Start Free Today
              <span className="arrow">→</span>
            </button>
            <button className="home-demo">Log In</button>
          </div>
          <div className="users-section">
            <div className="user-avatars">
              <div className="avatar" style={{backgroundColor: '#E74C3C'}}>A</div>
              <div className="avatar" style={{backgroundColor: '#9B59B6'}}>B</div>
              <div className="avatar" style={{backgroundColor: '#3498DB'}}>C</div>
              <div className="avatar" style={{backgroundColor: '#8E44AD'}}>D</div>
            </div>
            <div className="users-text">
              <p className="users-count">1,000+ users</p>
              <p className="users-subtitle">Already scheduling smarter</p>
            </div>
          </div>
        </div>
        <div className="image-container">
          <img src={HomeImage} alt="Home Image" className="home-image" />
          
          {/* Notification Cards */}
          <div className="notification-card task-completed">
            <div className="notification-icon green-check">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="notification-content">
              <p className="notification-title">Task Completed</p>
              <p className="notification-subtitle">Study Math - 2h</p>
            </div>
          </div>
          
          <div className="notification-card ai-generated">
            <div className="notification-icon orange-sparkle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="notification-content">
              <p className="notification-title">AI Generated</p>
              <p className="notification-subtitle">Weekly Plan Ready</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;

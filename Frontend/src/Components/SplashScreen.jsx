import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CiClock1 } from "react-icons/ci";
import '../Styles/SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to dashboard after animation completes (2.5 seconds)
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="logo-container">
          <CiClock1 className="splash-logo" />
          <h1 className="app-name">Zenix</h1>
          <p className="app-tagline">Master Your Time with Intelligent Planning</p>
        </div>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;

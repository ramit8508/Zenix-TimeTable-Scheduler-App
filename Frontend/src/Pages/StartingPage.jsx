// ===== COMMENTED OUT: Traditional Starting/Landing Page (Device Auth + Splash Screen) =====
// This page is preserved for future use if you want to re-enable the landing page
// Currently using splash screen animation that navigates directly to dashboard
/*
import React from 'react'
import Navbar from '../Components/Navbar'
import Home from '../Components/Home'
import Features from '../Components/Features'
import Join from '../Components/Join'
import Footer from '../Components/Footer'

function StartingPage({ theme, toggleTheme }) {
  return (
    <>
    <Navbar theme={theme} toggleTheme={toggleTheme} />
    <Home/>
    <Features/>
    <Join/>
    <Footer />
    </>
  )
}

export default StartingPage
*/
// ===== END COMMENTED OUT =====

// ===== NEW: Redirect to Dashboard (Splash Screen handles initial load) =====
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function StartingPage() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/dashboard', { replace: true });
  }, [navigate]);
  
  return null;
}

export default StartingPage;
// ===== END NEW =====
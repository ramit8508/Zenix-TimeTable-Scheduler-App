import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../Styles/Navbar.css'
import Logo from '../../Assets/Logo.jpg'
import { MdLightMode, MdDarkMode } from 'react-icons/md'

function Navbar({ theme, toggleTheme }) {
  const navigate = useNavigate()

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <img src={Logo} alt="Zenix - Timetable Scheduler" className="logo-icon" />
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button className="mode-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>
        <button className="login-btn" onClick={() => navigate('/login')}>Log In</button>
        <button className="get-started-btn" onClick={() => navigate('/signup')}>Get Started</button>
      </div>
    </nav>
  )
}

export default Navbar

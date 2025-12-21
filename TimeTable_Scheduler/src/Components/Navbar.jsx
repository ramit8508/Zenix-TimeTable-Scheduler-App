import React from 'react'
import '../Styles/Navbar.css'
import logo from '../../Assets/Logo.jpg'

function Navbar() {
  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <img src={logo} alt="ChronoZen Logo" className="logo-icon" />
      </div>

      {/* RIGHT */}
      <div className="nav-right">
        <button className="mode-btn">🌞/🌙</button>
        <button className="login-btn">Log In</button>
        <button className="get-started-btn">Get Started</button>
      </div>
    </nav>
  )
}

export default Navbar

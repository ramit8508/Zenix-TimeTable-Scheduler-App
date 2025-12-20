import React from 'react'
import '../Styles/Navbar.css'

function Navbar() {
  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="nav-left">
        <span className="logo-icon">🕒</span>
        <span className="logo-text">ChronoZen</span>
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

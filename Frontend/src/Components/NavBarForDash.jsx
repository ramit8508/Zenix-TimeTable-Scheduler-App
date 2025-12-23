import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../../Assets/Logo.jpg'
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { FiChevronDown } from 'react-icons/fi'
import { MdDashboard, MdLogout } from 'react-icons/md'
import '../Styles/NavBarForDash.css'

export default function NavBarForDash({ theme, toggleTheme }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    setDropdownOpen(false)
    navigate('/')
  }

  const handleDashboard = () => {
    setDropdownOpen(false)
    navigate('/dashboard')
  }

  // Get initials from user name
  const getInitials = (name) => {
    if (!name || typeof name !== 'string') return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
    <nav className="navbar-dash">
      {/* LEFT */}
      <div className="nav-dash-left">
        <img src={Logo} alt="Zenix - Timetable Scheduler" className="logo" />
      </div>

      {/* RIGHT */}
      <div className="nav-dash-right">
        <button className="mode-btn" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
        </button>

        {user && (
          <div className="user-menu">
            <button 
              className="user-btn" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <div className="user-avatar">
                {getInitials(user.name)}
              </div>
              <span className="user-name">{user.name}</span>
              <FiChevronDown size={18} className={`chevron ${dropdownOpen ? 'open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-avatar-large">
                    {getInitials(user.name)}
                  </div>
                  <div className="user-info">
                    <p className="dropdown-user-name">{user.name}</p>
                    <p className="dropdown-user-email">{user.email}</p>
                  </div>
                </div>

                <div className="dropdown-items">
                  <button className="dropdown-item" onClick={handleDashboard}>
                    <MdDashboard size={18} />
                    <span>Dashboard</span>
                  </button>
                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <MdLogout size={18} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
    </>
  )
}

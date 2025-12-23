import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CiClock1 } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useAuth } from '../context/AuthContext'
import '../Styles/Login.css'

export default function Login({ theme, toggleTheme }) {
    const navigate = useNavigate()
    const { login, loading, error } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
    const [localError, setLocalError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Load saved email on mount
    useEffect(() => {
      const savedEmail = localStorage.getItem('savedEmail')
      const rememberMeValue = localStorage.getItem('rememberMe')
      if (savedEmail && rememberMeValue === 'true') {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    }, [])

    const handleLogin = async (e) => {
      e.preventDefault()
      setLocalError('')
      setSuccessMessage('')
      
      if (!email || !password) {
        setLocalError('Please fill in all fields')
        return
      }

      try {
        await login(email, password)
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true')
          localStorage.setItem('savedEmail', email)
        } else {
          localStorage.removeItem('rememberMe')
          localStorage.removeItem('savedEmail')
        }
        setSuccessMessage('Login successful! Navigating to dashboard...')
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } catch (err) {
        setLocalError(err.message || 'Login failed')
      }
    }

  return (
   
    <>
    <button className='back-button' onClick={() => navigate('/')}><IoIosArrowRoundBack className='logo-back' />
Back</button>
    <button className='theme-toggle-btn' onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
    </button>
    <div className="login-page">
      <div className="login-box">
<CiClock1  className='login-logo'/>

        <h2 className="login-heading">Welcome Back</h2>
        <p className='login-para'>login to your account</p>
        {successMessage && <p style={{ color: '#4CAF50', textAlign: 'center', fontWeight: 'bold' }}>{successMessage}</p>}
        {(error || localError) && <p style={{ color: 'red', textAlign: 'center' }}>{error || localError}</p>}
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="email" className="login-label">Email Address</label>
          <input type="email" id="email" className="login-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={loading} />

          <label htmlFor="password" className="login-label">Password</label>
          <input type="password" id="password" className="login-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} />
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', marginBottom: '15px' }}>
            <input 
              type="checkbox" 
              id="rememberMe" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              style={{ marginRight: '8px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ cursor: 'pointer', fontSize: '14px' }}>Remember Me</label>
          </div>

          <button type="submit" className="login-button" disabled={loading}>{loading ? 'Logging in...' : 'Log In'}</button>
        </form>
        <h1 className='login-tosignup'>Don't have an account?<button className='login-tosignup-button' onClick={() => navigate('/signup')}>Sign Up</button></h1>
      </div>
    </div>
    </>
  )
}



import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CiClock1 } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import '../Styles/Login.css'

export default function Login({ theme, toggleTheme }) {
    const navigate = useNavigate()
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = (e) => {
      e.preventDefault()
      if (fullName && email && password) {
        // Store user info in localStorage
        localStorage.setItem('user', JSON.stringify({ email, userName: fullName }))
        navigate('/dashboard')
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
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="fullname" className="login-label">Full Name</label>
          <input type="text" id="fullname" className="login-input" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />

          <label htmlFor="email" className="login-label">Email Address</label>
          <input type="email" id="email" className="login-input" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label htmlFor="password" className="login-label">Password</label>
          <input type="password" id="password" className="login-input" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit" className="login-button">Log In</button>
        </form>
        <h1 className='login-tosignup'>Don't have an account?<button className='login-tosignup-button' onClick={() => navigate('/signup')}>Sign Up</button></h1>
      </div>
    </div>
    </>
  )
}



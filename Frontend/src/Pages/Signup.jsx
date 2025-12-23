import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { useAuth } from "../context/AuthContext";
import "../Styles/Signup.css";

export default function Signup({ theme, toggleTheme }) {
  const navigate = useNavigate();
  const { signup, loading, error } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setLocalError("");
    setSuccessMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters");
      return;
    }

    try {
      await signup(name, email, password, confirmPassword);
      setSuccessMessage("Account created successfully! Navigating to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (err) {
      setLocalError(err.message || "Signup failed");
    }
  };

  return (
    <>
      <button className="back-button" onClick={() => navigate("/")}>
        <IoIosArrowRoundBack className="logo-back" />
        Back
      </button>
      <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'dark' ? <MdLightMode size={20} /> : <MdDarkMode size={20} />}
      </button>
      <div className="signup-page">
        <div className="signup-box">
          <CiClock1 className="signup-logo" />
          <h2 className="signup-heading">Create Account</h2>
          <p className="signup-para">Start your productivity journey</p>
          {successMessage && <p style={{ color: '#4CAF50', textAlign: 'center', fontWeight: 'bold' }}>{successMessage}</p>}
          {(error || localError) && <p style={{ color: 'red', textAlign: 'center' }}>{error || localError}</p>}
          <form className="signup-form" onSubmit={handleSignup}>
            <label htmlFor="fullname" className="signup-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              className="signup-input"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
            />
            <label htmlFor="email" className="signup-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="signup-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="password" className="signup-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="signup-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <label htmlFor="confirmPassword" className="signup-label">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="signup-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
          </form>
          <h1 className="signup-tologin">
            Already have an account?
            <button
              className="signup-tologin-button"
              onClick={() => navigate("/login")}
            >
              Log In
            </button>
          </h1>
        </div>
      </div>
    </>
  );
}

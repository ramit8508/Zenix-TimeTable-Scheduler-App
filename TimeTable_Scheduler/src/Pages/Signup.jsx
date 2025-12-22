import React from "react";
import { useNavigate } from "react-router-dom";
import { CiClock1 } from "react-icons/ci";
import { IoIosArrowRoundBack } from "react-icons/io";
import "../Styles/Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  return (
    <>
      <button className="back-button" onClick={() => navigate("/")}>
        <IoIosArrowRoundBack className="logo-back" />
        Back
      </button>
      <div className="signup-page">
        <div className="signup-box">
          <CiClock1 className="signup-logo" />
          <h2 className="signup-heading">Create Account</h2>
          <p className="signup-para">Start your productivity journey</p>
          <form className="signup-form">
            <label htmlFor="email" className="signup-label">
              Full Name
            </label>
            <input
              type="text"
              id="fullname"
              className="signup-input"
              placeholder="Enter your full name"
              required
            />
            <label htmlFor="email" className="signup-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="signup-input"
              placeholder="Enter your email"
              required
            />

            <label htmlFor="password" className="signup-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="signup-input"
              placeholder="Enter your password"
              required
            />
            <button type="submit" className="signup-button">
              Sign Up
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

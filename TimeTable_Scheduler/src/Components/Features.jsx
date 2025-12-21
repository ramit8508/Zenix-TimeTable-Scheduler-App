import React from "react";
import "../Styles/Features.css";
import { SlCalender } from "react-icons/sl";
import { FiTarget } from "react-icons/fi";
import { LuLayoutGrid } from "react-icons/lu";
import { FaRegCircleCheck } from "react-icons/fa6";

function Features() {
  return (
    <>
      <div className="Features-container">
        <h1 className="Features-heading">
          Everything You Need to Stay Productive
        </h1>
        <p className="Features-para">
          Powerful features designed to help you take control of your time and
          achieve more.
        </p>
        <div className="box-features">
        <div className="Features-box">
          <SlCalender  className="icon-features"/>

          <h1 className="box-heading">Smart Scheduling</h1>
          <p className="box-para">
            AI-powered schedule generation that adapts to your priorities and
            time availability.
          </p>
        </div>
        <div className="Features-box">
          <FiTarget  className="icon-features"/>

          <h1 className="box-heading">Goal-Oriented Planning</h1>
          <p className="box-para">
            Set your goals and let AI create the perfect roadmap to achieve
            them.
          </p>
        </div>
        <div className="Features-box">
          <LuLayoutGrid  className="icon-features"/>

          <h1 className="box-heading">Visual Timetable</h1>
          <p className="box-para">
            Drag and drop interface for easy schedule customization and
            management.
          </p>
        </div>
        <div className="Features-box">
          <FaRegCircleCheck  className="icon-features"/>

          <h1 className="box-heading">Progress Tracking</h1>
          <p className="box-para">Monitor your productivity and celebrate your accomplishments.</p>
        </div>
      </div>
      </div>
    </>
  );
}

export default Features;

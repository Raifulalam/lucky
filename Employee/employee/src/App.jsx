import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Salary from "./pages/Salary";
import Stats from "./pages/Stats";
import Login from "./pages/Login";
import "./App.css"; // Import manual CSS

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Sidebar */}
        <nav className="sidebar">
          <h2 className="logo">Employee App</h2>
          <ul className="menu">
            <li><Link to="/">Dashboard</Link></li>
            <li><Link to="/attendance">Attendance</Link></li>
            <li><Link to="/salary">Salary</Link></li>
            <li><Link to="/stats">Stats</Link></li>
            <li><Link to="/login">Logout</Link></li>
          </ul>
        </nav>

        {/* Main content */}
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/salary" element={<Salary />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

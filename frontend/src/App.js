import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Chatbot from './components/Chatbot';
import TimetableView from './components/TimetableView';
import AdminPanel from './components/AdminPanel';
import CoursesView from './components/CoursesView';
import { useTheme } from './context/ThemeContext';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('chatbot');
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    // Clear any previous session data on app load
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('chatbot');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="url(#gradient1)" />
                <path d="M20 14L26 17.5V24.5L20 28L14 24.5V17.5L20 14Z" fill="white" fillOpacity="0.3" />
                <defs>
                  <linearGradient id="gradient1" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e0e7ff" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="navbar-brand-text">
              <span className="brand-title">College Helpdesk</span>
              <span className="brand-subtitle">Your Academic Assistant</span>
            </div>
          </div>
          
          <div className="navbar-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.role === 'admin' ? '👑 Admin' : '🎓 Student'}</span>
              </div>
            </div>
            
            <button 
              className="theme-toggle" 
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            
            <button className="logout-btn" onClick={handleLogout}>
              <span>Logout</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Tabs */}
      <div className="nav-tabs">
        <div className="nav-tabs-content">
          <button
            className={`nav-tab ${activeTab === 'chatbot' ? 'active' : ''}`}
            onClick={() => setActiveTab('chatbot')}
          >
            💬 Chatbot
          </button>
          <button
            className={`nav-tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            📚 Courses
          </button>
          <button
            className={`nav-tab ${activeTab === 'timetable' ? 'active' : ''}`}
            onClick={() => setActiveTab('timetable')}
          >
            📅 Timetable
          </button>
          {user.role === 'admin' && (
            <button
              className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              ⚙️ Admin Panel
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'chatbot' && <Chatbot />}
        {activeTab === 'courses' && <CoursesView />}
        {activeTab === 'timetable' && <TimetableView />}
        {activeTab === 'admin' && user.role === 'admin' && <AdminPanel />}
      </main>
    </div>
  );
}

export default App;

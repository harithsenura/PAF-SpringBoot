"use client"

import React, { useContext, useState } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import NotificationList from './NotificationList';
import './NotificationBell.css';

const NotificationBell = () => {
  const { unreadCount } = useContext(NotificationContext);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  return (
    <div className="notification-bell-container">
      <button 
        className="notification-bell-button" 
        onClick={toggleNotifications}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="notification-bell-icon"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>
      
      {showNotifications && (
        <div className="notification-dropdown">
          <NotificationList onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
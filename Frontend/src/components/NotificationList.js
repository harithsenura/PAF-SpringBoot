"use client"

import React, { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';
import './NotificationList.css';

//notification function ...
const NotificationList = ({ onClose }) => {
  const { notifications, loading, markAllAsRead } = useContext(NotificationContext);
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };
  
  return (
    <div className="notification-list">
      <div className="notification-list-header">
        <h3>Notifications</h3>
        <div className="notification-list-actions">
          <button 
            className="mark-all-read-button" 
            onClick={handleMarkAllAsRead}
            disabled={loading || notifications.every(n => n.read)}
          >
            Mark all as read 
          </button>
          <button className="close-button" onClick={onClose}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="close-icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="notification-list-content">
        {loading ? (
          <div className="notification-loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications yet</div>
        ) : (
          notifications.map(notification => (
            <NotificationItem 
              key={notification.id} 
              notification={notification} 
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
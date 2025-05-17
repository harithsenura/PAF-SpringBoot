"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { NotificationService } from '../services/NotificationService';
import WebSocketService from '../services/WebSocketService';

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Load notifications when user changes
  useEffect(() => {
    if (currentUser) {
      loadNotifications();
      
      // Connect to WebSocket
      WebSocketService.connect(currentUser.id, () => {
        // Subscribe to notifications
        WebSocketService.subscribeToNotifications(currentUser.id, (notification) => {
          // Add new notification to the list
          setNotifications(prev => [notification, ...prev]);
          // Increment unread count
          setUnreadCount(prev => prev + 1);
        });
        
        // Subscribe to notification count updates
        WebSocketService.subscribeToNotificationCount(currentUser.id, (count) => {
          setUnreadCount(count);
        });
      });
      
      // Listen for custom events
      window.addEventListener('newNotification', handleNewNotification);
      window.addEventListener('notificationCountUpdate', handleCountUpdate);
      
      return () => {
        // Disconnect from WebSocket
        WebSocketService.disconnect();
        
        // Remove event listeners
        window.removeEventListener('newNotification', handleNewNotification);
        window.removeEventListener('notificationCountUpdate', handleCountUpdate);
      };
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [currentUser]);
  
  const handleNewNotification = (event) => {
    const notification = event.detail;
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };
  
  const handleCountUpdate = (event) => {
    const count = event.detail;
    setUnreadCount(count);
  };
  
  const loadNotifications = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      // Load all notifications
      const notifs = await NotificationService.getUserNotifications(currentUser.id);
      setNotifications(notifs);
      
      // Get unread count
      const count = await NotificationService.getUnreadCount(currentUser.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      await NotificationService.markAllAsRead(currentUser.id);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };
  
  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
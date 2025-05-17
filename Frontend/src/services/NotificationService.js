// Backend API URL
const API_URL = "http://localhost:8080/api/notifications";

export const NotificationService = {
  // Get all notifications for a user
  getUserNotifications: async (userId) => {
    try {
      console.log(`Fetching notifications for user ${userId}`);
      const response = await fetch(`${API_URL}/user/${userId}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const notifications = await response.json();
      console.log(`Received ${notifications.length} notifications for user ${userId}`);
      
      return notifications;
    } catch (error) {
      console.error("Error getting notifications:", error);
      return [];
    }
  },
  
  // Get unread notifications for a user
  getUnreadNotifications: async (userId) => {
    try {
      console.log(`Fetching unread notifications for user ${userId}`);
      const response = await fetch(`${API_URL}/user/${userId}/unread`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const notifications = await response.json();
      console.log(`Received ${notifications.length} unread notifications for user ${userId}`);
      
      return notifications;
    } catch (error) {
      console.error("Error getting unread notifications:", error);
      return [];
    }
  },
  
  // Get unread notification count for a user
  getUnreadCount: async (userId) => {
    try {
      console.log(`Fetching unread notification count for user ${userId}`);
      const response = await fetch(`${API_URL}/user/${userId}/count`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const count = await response.json();
      console.log(`Unread notification count for user ${userId}: ${count}`);
      
      return count;
    } catch (error) {
      console.error("Error getting unread notification count:", error);
      return 0;
    }
  },
  
  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      console.log(`Marking notification ${notificationId} as read`);
      const response = await fetch(`${API_URL}/${notificationId}/read`, {
        method: "PUT",
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const notification = await response.json();
      console.log(`Notification ${notificationId} marked as read`);
      
      return notification;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },
  
  // Mark all notifications as read for a user
  markAllAsRead: async (userId) => {
    try {
      console.log(`Marking all notifications as read for user ${userId}`);
      const response = await fetch(`${API_URL}/user/${userId}/read-all`, {
        method: "PUT",
        credentials: "include"
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      console.log(`All notifications marked as read for user ${userId}`);
      
      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }
};
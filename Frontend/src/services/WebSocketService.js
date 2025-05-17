import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = {};
  }
  
  connect(userId, onConnect = () => {}) {
    if (this.isConnected) {
      console.log('WebSocket already connected');
      onConnect();
      return;
    }
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      debug: function(str) {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        
        // Subscribe to user's notification channel
        this.subscribeToNotifications(userId);
        this.subscribeToNotificationCount(userId);
        
        onConnect();
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      }
    });
    
    this.client.activate();
  }
  
  disconnect() {
    if (this.client && this.isConnected) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions = {};
      console.log('WebSocket disconnected');
    }
  }
  
  subscribeToNotifications(userId, callback) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    
    const destination = `/topic/notifications/${userId}`;
    
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
    }
    
    this.subscriptions[destination] = this.client.subscribe(destination, (message) => {
      try {
        const notification = JSON.parse(message.body);
        console.log('Received notification:', notification);
        
        if (callback) {
          callback(notification);
        }
        
        // Dispatch a custom event
        const event = new CustomEvent('newNotification', { detail: notification });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });
    
    console.log(`Subscribed to ${destination}`);
  }
  
  subscribeToNotificationCount(userId, callback) {
    if (!this.isConnected) {
      console.error('WebSocket not connected');
      return;
    }
    
    const destination = `/topic/notifications/count/${userId}`;
    
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
    }
    
    this.subscriptions[destination] = this.client.subscribe(destination, (message) => {
      try {
        const count = JSON.parse(message.body);
        console.log('Received notification count:', count);
        
        if (callback) {
          callback(count);
        }
        
        // Dispatch a custom event
        const event = new CustomEvent('notificationCountUpdate', { detail: count });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error parsing notification count:', error);
      }
    });
    
    console.log(`Subscribed to ${destination}`);
  }
}

export default new WebSocketService();

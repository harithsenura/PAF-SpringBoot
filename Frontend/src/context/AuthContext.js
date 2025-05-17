import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

// API base URL
const API_URL = 'https://paf-backend-production.up.railway.app/api/auth';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Test API connection
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/test`);
        const data = await response.text();
        console.log('API Test Response:', data);
      } catch (error) {
        console.error('API Test Error:', error);
      }
    };
    
    testApiConnection();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Sending login request with:', { email, password });
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      console.log('Sending registration request with:', { firstName, lastName, email, password });
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          firstName, 
          lastName, 
          email, 
          password 
        }),
      });

      console.log('Register response status:', response.status);
      
      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
        console.log('Register response data:', data);
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        const text = await response.text();
        console.log('Response as text:', text);
        throw new Error('Invalid response from server');
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setCurrentUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

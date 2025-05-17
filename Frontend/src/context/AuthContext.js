"use client"

import { createContext, useState, useEffect } from "react"
import AuthService from "../services/authService"

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Error parsing stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Test API connection
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        await AuthService.testConnection()
      } catch (error) {
        console.error("API Test Error:", error)
      }
    }

    testApiConnection()
  }, [])

  const login = async (email, password) => {
    try {
      const data = await AuthService.login(email, password)

      setCurrentUser(data)
      localStorage.setItem("user", JSON.stringify(data))
      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (firstName, lastName, email, password) => {
    try {
      const data = await AuthService.register(firstName, lastName, email, password)

      setCurrentUser(data)
      localStorage.setItem("user", JSON.stringify(data))
      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem("user")
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

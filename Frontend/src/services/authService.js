import config from "./api"

// API base URL - Railway backend URL
const API_URL = `${config.API_BASE_URL}${config.endpoints.auth}`

export const AuthService = {
  // Test API connection
  testConnection: async () => {
    try {
      const response = await fetch(`${API_URL}/test`)
      const data = await response.text()
      console.log("API Test Response:", data)
      return data
    } catch (error) {
      console.error("API Test Error:", error)
      throw error
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log("Sending login request with:", { email, password })

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      console.log("Login response status:", response.status)

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Login failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          // If parsing JSON fails, use the status text
          errorMessage = `Login failed: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Login response data:", data)

      return data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  // Register user
  register: async (firstName, lastName, email, password) => {
    try {
      console.log("Sending registration request with:", { firstName, lastName, email, password })

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
        credentials: "include",
      })

      console.log("Register response status:", response.status)

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Registration failed"
        try {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || errorMessage
        } catch (e) {
          // If parsing JSON fails, use the status text
          errorMessage = `Registration failed: ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("Register response data:", data)

      return data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },
}

export default AuthService

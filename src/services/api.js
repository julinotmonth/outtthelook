import axios from 'axios'
import { API_BASE_URL } from '../utils/constants'

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage to avoid circular dependency
    const token = localStorage.getItem('outlook-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth state
          localStorage.removeItem('outlook-token')
          localStorage.removeItem('outlook-auth')
          // Redirect to login (avoid on login page)
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login'
          }
          break
        case 403:
          // Forbidden
          console.error('Access denied')
          break
        case 404:
          // Not found
          console.error('Resource not found')
          break
        case 500:
          // Server error
          console.error('Server error')
          break
        default:
          break
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - please check your connection')
    }
    return Promise.reject(error)
  }
)

export default api

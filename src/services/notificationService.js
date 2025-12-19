import api from './api'

export const notificationService = {
  // Get all notifications (admin)
  getAll: async (params = {}) => {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`)
    return response.data
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all')
    return response.data
  },

  // Delete notification
  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`)
    return response.data
  },

  // Clear all notifications
  clearAll: async () => {
    const response = await api.delete('/notifications')
    return response.data
  },
}

export default notificationService

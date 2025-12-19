import api from './api'

export const bookingService = {
  // Get all bookings (admin)
  getAll: async (params = {}) => {
    const response = await api.get('/bookings', { params })
    return response.data
  },

  // Get user's bookings
  getMyBookings: async (params = {}) => {
    const response = await api.get('/bookings/my-bookings', { params })
    return response.data
  },

  // Get single booking
  getById: async (id) => {
    const response = await api.get(`/bookings/${id}`)
    return response.data
  },

  // Create booking
  create: async (data) => {
    const response = await api.post('/bookings', data)
    return response.data
  },

  // Update booking status (admin)
  updateStatus: async (id, status) => {
    const response = await api.put(`/bookings/${id}/status`, { status })
    return response.data
  },

  // Cancel booking
  cancel: async (id) => {
    const response = await api.post(`/bookings/${id}/cancel`)
    return response.data
  },

  // Get booked time slots
  getBookedSlots: async (date, barberId) => {
    const response = await api.get('/bookings/booked-slots', {
      params: { date, barber_id: barberId }
    })
    return response.data
  },

  // Get booking statistics (admin)
  getStats: async () => {
    const response = await api.get('/bookings/stats')
    return response.data
  },
}

export default bookingService

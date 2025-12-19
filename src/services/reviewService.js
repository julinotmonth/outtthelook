import api from './api'

export const reviewService = {
  // Get all reviews
  getAll: async (params = {}) => {
    const response = await api.get('/reviews', { params })
    return response.data
  },

  // Get top reviews for homepage
  getTopReviews: async () => {
    const response = await api.get('/reviews/top')
    return response.data
  },

  // Get barber reviews
  getBarberReviews: async (barberId) => {
    const response = await api.get(`/reviews/barber/${barberId}`)
    return response.data
  },

  // Create review
  create: async (data) => {
    const response = await api.post('/reviews', data)
    return response.data
  },

  // Check if booking has review
  checkBookingReview: async (bookingId) => {
    const response = await api.get(`/reviews/booking/${bookingId}/check`)
    return response.data
  },

  // Delete review (admin)
  delete: async (id) => {
    const response = await api.delete(`/reviews/${id}`)
    return response.data
  },
}

export default reviewService

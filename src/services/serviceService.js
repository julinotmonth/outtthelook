import api from './api'

export const serviceService = {
  // Get all services
  getAll: async (params = {}) => {
    const response = await api.get('/services', { params })
    return response.data
  },

  // Get single service
  getById: async (id) => {
    const response = await api.get(`/services/${id}`)
    return response.data
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/services/categories')
    return response.data
  },

  // Create service (admin)
  create: async (data) => {
    const response = await api.post('/services', data)
    return response.data
  },

  // Update service (admin)
  update: async (id, data) => {
    const response = await api.put(`/services/${id}`, data)
    return response.data
  },

  // Delete service (admin)
  delete: async (id) => {
    const response = await api.delete(`/services/${id}`)
    return response.data
  },
}

export default serviceService

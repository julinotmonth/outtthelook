import api from './api'

export const barberService = {
  // Get all barbers
  getAll: async (params = {}) => {
    const response = await api.get('/barbers', { params })
    return response.data
  },

  // Get single barber
  getById: async (id) => {
    const response = await api.get(`/barbers/${id}`)
    return response.data
  },

  // Create barber (admin)
  create: async (data) => {
    const response = await api.post('/barbers', data)
    return response.data
  },

  // Update barber (admin)
  update: async (id, data) => {
    const response = await api.put(`/barbers/${id}`, data)
    return response.data
  },

  // Delete barber (admin)
  delete: async (id) => {
    const response = await api.delete(`/barbers/${id}`)
    return response.data
  },
}

export default barberService

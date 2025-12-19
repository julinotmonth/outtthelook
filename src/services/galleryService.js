import api from './api'

export const galleryService = {
  // Get all gallery items
  getAll: async (params = {}) => {
    const response = await api.get('/gallery', { params })
    return response.data
  },

  // Get categories
  getCategories: async () => {
    const response = await api.get('/gallery/categories')
    return response.data
  },

  // Create gallery item (admin)
  create: async (data) => {
    const response = await api.post('/gallery', data)
    return response.data
  },

  // Update gallery item (admin)
  update: async (id, data) => {
    const response = await api.put(`/gallery/${id}`, data)
    return response.data
  },

  // Delete gallery item (admin)
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`)
    return response.data
  },
}

export default galleryService

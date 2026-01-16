import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import api from '../services/api'

// ============================================
// AUTH STORE - Handles authentication
// ============================================
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        set({ token })
        if (token) {
          localStorage.setItem('outlook-token', token)
        } else {
          localStorage.removeItem('outlook-token')
        }
      },
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Register via API
      register: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/register', userData)
          if (response.data.success) {
            const { user, token } = response.data.data
            set({ user, token, isAuthenticated: true, isLoading: false })
            localStorage.setItem('outlook-token', token)
            return { success: true, user }
          }
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || error.message
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      // Login via API
      loginWithCredentials: async (email, password) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/login', { email, password })
          if (response.data.success) {
            const { user, token } = response.data.data
            set({ user, token, isAuthenticated: true, isLoading: false })
            localStorage.setItem('outlook-token', token)
            return { success: true, user }
          }
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || error.message
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      // Google OAuth via API
      googleLogin: async (userData) => {
        set({ isLoading: true, error: null })
        try {
          const response = await api.post('/auth/google', userData)
          if (response.data.success) {
            const { user, token } = response.data.data
            set({ user, token, isAuthenticated: true, isLoading: false })
            localStorage.setItem('outlook-token', token)
            return { success: true, user }
          }
          return { success: false, message: response.data.message }
        } catch (error) {
          const message = error.response?.data?.message || error.message
          set({ isLoading: false, error: message })
          return { success: false, message }
        }
      },

      // Direct login
      login: (user, token) => {
        set({ user, token, isAuthenticated: true, isLoading: false })
        if (token) localStorage.setItem('outlook-token', token)
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('outlook-token')
      },

      // Check email availability
      checkEmail: async (email) => {
        try {
          const response = await api.get(`/auth/check-email?email=${email}`)
          return !response.data.data?.available
        } catch (error) {
          return false
        }
      },

      // Fetch current user
      fetchUser: async () => {
        const token = localStorage.getItem('outlook-token')
        if (!token) return null
        try {
          const response = await api.get('/auth/me')
          if (response.data.success) {
            set({ user: response.data.data, isAuthenticated: true })
            return response.data.data
          }
        } catch (error) {
          set({ user: null, token: null, isAuthenticated: false })
          localStorage.removeItem('outlook-token')
        }
        return null
      },
    }),
    {
      name: 'outlook-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ============================================
// SERVICES STORE - Manages services data from API
// ============================================
export const useServicesStore = create((set, get) => ({
  services: [],
  loading: false,
  error: null,

  // Fetch all services from API
  fetchServices: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/services', { params })
      if (response.data.success) {
        set({ services: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Add service via API
  addService: async (serviceData) => {
    try {
      const response = await api.post('/services', serviceData)
      if (response.data.success) {
        const { services } = get()
        set({ services: [...services, response.data.data] })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Update service via API
  updateService: async (id, serviceData) => {
    try {
      const response = await api.put(`/services/${id}`, serviceData)
      if (response.data.success) {
        const { services } = get()
        set({ services: services.map(s => s.id === id ? response.data.data : s) })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Delete service via API
  deleteService: async (id) => {
    try {
      const response = await api.delete(`/services/${id}`)
      if (response.data.success) {
        const { services } = get()
        set({ services: services.filter(s => s.id !== id) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Get active services
  getActiveServices: () => {
    const { services } = get()
    return services.filter(s => s.is_active)
  },

  // Get services by category
  getServicesByCategory: (category) => {
    const { services } = get()
    if (category === 'all') return services
    return services.filter(s => s.category === category)
  },
}))

// ============================================
// TEAM STORE - Manages barbers data from API
// ============================================
export const useTeamStore = create((set, get) => ({
  barbers: [],
  loading: false,
  error: null,

  // Fetch all barbers from API
  fetchBarbers: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/barbers', { params })
      if (response.data.success) {
        set({ barbers: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Add barber via API
  addBarber: async (barberData) => {
    try {
      const response = await api.post('/barbers', barberData)
      if (response.data.success) {
        const { barbers } = get()
        set({ barbers: [...barbers, response.data.data] })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Update barber via API
  updateBarber: async (id, barberData) => {
    try {
      const response = await api.put(`/barbers/${id}`, barberData)
      if (response.data.success) {
        const { barbers } = get()
        set({ barbers: barbers.map(b => b.id === id ? response.data.data : b) })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Delete barber via API
  deleteBarber: async (id) => {
    try {
      const response = await api.delete(`/barbers/${id}`)
      if (response.data.success) {
        const { barbers } = get()
        set({ barbers: barbers.filter(b => b.id !== id) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Get available barbers
  getAvailableBarbers: () => {
    const { barbers } = get()
    return barbers.filter(b => b.is_available)
  },
}))

// ============================================
// GALLERY STORE - Manages gallery data from API
// ============================================
export const useGalleryStore = create((set, get) => ({
  items: [],
  loading: false,
  error: null,

  // Fetch all gallery items from API
  fetchGallery: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/gallery', { params })
      if (response.data.success) {
        set({ items: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Add gallery item via API
  addItem: async (itemData) => {
    try {
      const response = await api.post('/gallery', itemData)
      if (response.data.success) {
        const { items } = get()
        set({ items: [...items, response.data.data] })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Update gallery item via API
  updateItem: async (id, itemData) => {
    try {
      const response = await api.put(`/gallery/${id}`, itemData)
      if (response.data.success) {
        const { items } = get()
        set({ items: items.map(i => i.id === id ? response.data.data : i) })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Delete gallery item via API
  deleteItem: async (id) => {
    try {
      const response = await api.delete(`/gallery/${id}`)
      if (response.data.success) {
        const { items } = get()
        set({ items: items.filter(i => i.id !== id) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Get items by category
  getItemsByCategory: (category) => {
    const { items } = get()
    if (category === 'all') return items
    return items.filter(i => i.category === category)
  },
}))

// ============================================
// REVIEW STORE - Manages reviews data from API
// ============================================
export const useReviewStore = create((set, get) => ({
  reviews: [],
  loading: false,
  error: null,

  // Fetch all reviews from API
  fetchReviews: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/reviews', { params })
      if (response.data.success) {
        set({ reviews: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Fetch top reviews
  fetchTopReviews: async () => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/reviews/top')
      if (response.data.success) {
        set({ reviews: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Add review via API
  addReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData)
      if (response.data.success) {
        const { reviews } = get()
        set({ reviews: [response.data.data, ...reviews] })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Delete review via API
  deleteReview: async (id) => {
    try {
      const response = await api.delete(`/reviews/${id}`)
      if (response.data.success) {
        const { reviews } = get()
        set({ reviews: reviews.filter(r => r.id !== id) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },
}))

// ============================================
// BOOKING STORE - Manages booking process
// ============================================
export const useBookingStore = create((set, get) => ({
  // Booking form state
  currentStep: 1,
  selectedServices: [],
  selectedBarber: null,
  selectedDate: null,
  selectedTime: null,
  customerInfo: { name: '', email: '', phone: '', notes: '' },
  bookedSlots: [],

  // Actions
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  // Service selection
  toggleService: (service) => {
    const { selectedServices } = get()
    const isSelected = selectedServices.some((s) => s.id === service.id)
    if (isSelected) {
      set({ selectedServices: selectedServices.filter((s) => s.id !== service.id) })
    } else {
      set({ selectedServices: [...selectedServices, service] })
    }
  },
  clearServices: () => set({ selectedServices: [] }),

  // Barber selection
  setBarber: (barber) => set({ selectedBarber: barber }),
  clearBarber: () => set({ selectedBarber: null }),

  // Date & Time
  setDate: (date) => set({ selectedDate: date, selectedTime: null }),
  setTime: (time) => set({ selectedTime: time }),

  // Customer info
  setCustomerInfo: (info) => set((state) => ({
    customerInfo: { ...state.customerInfo, ...info },
  })),

  // Fetch booked slots from API
  fetchBookedSlots: async (date, barberId) => {
    try {
      const response = await api.get('/bookings/booked-slots', {
        params: { date, barber_id: barberId }
      })
      if (response.data.success) {
        set({ bookedSlots: response.data.data })
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching booked slots:', error)
    }
    return []
  },

  // Computed values
  getTotalPrice: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((total, s) => total + (s.price || 0), 0)
  },
  getTotalDuration: () => {
    const { selectedServices } = get()
    return selectedServices.reduce((total, s) => total + (s.duration || 0), 0)
  },

  // Reset booking
  resetBooking: () => set({
    currentStep: 1,
    selectedServices: [],
    selectedBarber: null,
    selectedDate: null,
    selectedTime: null,
    customerInfo: { name: '', email: '', phone: '', notes: '' },
    bookedSlots: [],
  }),

  // Validation
  canProceed: () => {
    const { currentStep, selectedServices, selectedBarber, selectedDate, selectedTime } = get()
    switch (currentStep) {
      case 1: return selectedServices.length > 0
      case 2: return selectedBarber !== null
      case 3: return selectedDate !== null && selectedTime !== null
      case 4: return true
      default: return true
    }
  },
}))

// ============================================
// HISTORY STORE - Manages booking history from API
// ============================================
export const useHistoryStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,

  // Fetch user's bookings from API
  fetchBookings: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/bookings/my-bookings', { params })
      if (response.data.success) {
        set({ bookings: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Fetch all bookings (admin)
  fetchAllBookings: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await api.get('/bookings', { params })
      if (response.data.success) {
        set({ bookings: response.data.data, loading: false })
        return response.data.data
      }
    } catch (error) {
      set({ error: error.message, loading: false })
    }
    return []
  },

  // Create booking via API
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData)
      if (response.data.success) {
        const { bookings } = get()
        set({ bookings: [response.data.data, ...bookings] })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Update booking status via API
  updateBookingStatus: async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status })
      if (response.data.success) {
        const { bookings } = get()
        set({ bookings: bookings.map(b => b.id === id ? { ...b, status } : b) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Cancel booking via API
  cancelBooking: async (id) => {
    try {
      const response = await api.post(`/bookings/${id}/cancel`)
      if (response.data.success) {
        const { bookings } = get()
        set({ bookings: bookings.map(b => b.id === id ? { ...b, status: 'cancelled' } : b) })
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Upload payment proof
  uploadPaymentProof: async (id, paymentProof) => {
    try {
      const response = await api.post(`/bookings/${id}/payment-proof`, { 
        payment_proof: paymentProof 
      })
      if (response.data.success) {
        const { bookings } = get()
        set({ 
          bookings: bookings.map(b => 
            b.id === id 
              ? { ...b, payment_proof: paymentProof, payment_status: 'waiting_verification' } 
              : b
          ) 
        })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },

  // Verify payment (admin)
  verifyPayment: async (id, action) => {
    console.log('Store: verifyPayment called', id, action)
    try {
      const response = await api.put(`/bookings/${id}/verify-payment`, { action })
      console.log('Store: API response', response.data)
      if (response.data.success) {
        const { bookings } = get()
        const newPaymentStatus = action === 'approve' ? 'paid' : 'rejected'
        const newBookingStatus = action === 'approve' ? 'confirmed' : undefined
        set({ 
          bookings: bookings.map(b => 
            b.id === id 
              ? { 
                  ...b, 
                  payment_status: newPaymentStatus,
                  payment_proof: action === 'reject' ? null : b.payment_proof,
                  status: newBookingStatus || b.status
                } 
              : b
          ) 
        })
        return { success: true, data: response.data.data }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      console.error('Store: verifyPayment error', error.response || error)
      return { success: false, message: error.response?.data?.message || error.message }
    }
  },
}))

// ============================================
// NOTIFICATION STORE - Manages notifications from API
// ============================================
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  // Fetch notifications from API
  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const response = await api.get('/notifications')
      if (response.data.success) {
        const { notifications, unreadCount } = response.data.data
        set({ notifications, unreadCount, loading: false })
        return notifications
      }
    } catch (error) {
      set({ loading: false })
    }
    return []
  },

  // Mark as read via API
  markAsRead: async (id) => {
    try {
      const response = await api.put(`/notifications/${id}/read`)
      if (response.data.success) {
        const { notifications, unreadCount } = get()
        set({
          notifications: notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
          unreadCount: Math.max(0, unreadCount - 1)
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false }
    }
  },

  // Mark all as read via API
  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all')
      if (response.data.success) {
        const { notifications } = get()
        set({
          notifications: notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false }
    }
  },

  // Delete notification via API
  deleteNotification: async (id) => {
    try {
      const response = await api.delete(`/notifications/${id}`)
      if (response.data.success) {
        const { notifications } = get()
        const notif = notifications.find(n => n.id === id)
        set({
          notifications: notifications.filter(n => n.id !== id),
          unreadCount: notif && !notif.is_read ? get().unreadCount - 1 : get().unreadCount
        })
        return { success: true }
      }
    } catch (error) {
      return { success: false }
    }
  },

  // Clear all notifications via API
  clearAllNotifications: async () => {
    try {
      const response = await api.delete('/notifications')
      if (response.data.success) {
        set({ notifications: [], unreadCount: 0 })
        return { success: true }
      }
    } catch (error) {
      return { success: false }
    }
  },

  // Add notification via API
  addNotification: async (notificationData) => {
    try {
      const response = await api.post('/notifications', notificationData)
      if (response.data.success) {
        const { notifications, unreadCount } = get()
        set({
          notifications: [response.data.data, ...notifications],
          unreadCount: unreadCount + 1
        })
        return { success: true, data: response.data.data }
      }
      return { success: false }
    } catch (error) {
      console.error('Add notification error:', error)
      return { success: false }
    }
  },
}))

// ============================================
// UI STORE - UI state management
// ============================================
export const useUIStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),

  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  activeModal: null,
  modalData: null,
  openModal: (modalName, data = null) => set({ activeModal: modalName, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
}))
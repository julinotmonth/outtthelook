import { useState, useEffect, useCallback } from 'react'
import { barberService } from '../services/barberService'
import { serviceService } from '../services/serviceService'
import { bookingService } from '../services/bookingService'
import { reviewService } from '../services/reviewService'
import { galleryService } from '../services/galleryService'
import { notificationService } from '../services/notificationService'

// Generic fetch hook
const useFetch = (fetchFn, initialData = null, autoFetch = true) => {
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState(null)

  const fetch = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetchFn(...args)
      if (response.success) {
        setData(response.data)
        return response.data
      } else {
        throw new Error(response.message)
      }
    } catch (err) {
      setError(err.message)
      console.error('Fetch error:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [fetchFn])

  useEffect(() => {
    if (autoFetch) {
      fetch()
    }
  }, []) // eslint-disable-line

  return { data, loading, error, refetch: fetch, setData }
}

// Barbers Hook
export const useBarbers = (autoFetch = true) => {
  return useFetch(
    () => barberService.getAll({ available: 'true' }),
    [],
    autoFetch
  )
}

export const useBarber = (id) => {
  return useFetch(
    () => barberService.getById(id),
    null,
    !!id
  )
}

// Services Hook
export const useServices = (autoFetch = true, params = {}) => {
  return useFetch(
    () => serviceService.getAll({ active: 'true', ...params }),
    [],
    autoFetch
  )
}

export const useServiceCategories = () => {
  return useFetch(
    () => serviceService.getCategories(),
    [],
    true
  )
}

// Bookings Hook
export const useBookings = (params = {}) => {
  return useFetch(
    () => bookingService.getAll(params),
    [],
    true
  )
}

export const useMyBookings = (params = {}) => {
  return useFetch(
    () => bookingService.getMyBookings(params),
    [],
    true
  )
}

export const useBookingStats = () => {
  return useFetch(
    () => bookingService.getStats(),
    null,
    true
  )
}

export const useBookedSlots = (date, barberId) => {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!date || !barberId) return
    
    setLoading(true)
    try {
      const response = await bookingService.getBookedSlots(date, barberId)
      if (response.success) {
        setSlots(response.data)
      }
    } catch (err) {
      console.error('Error fetching booked slots:', err)
    } finally {
      setLoading(false)
    }
  }, [date, barberId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { slots, loading, refetch: fetch }
}

// Reviews Hook
export const useReviews = (params = {}) => {
  return useFetch(
    () => reviewService.getAll(params),
    [],
    true
  )
}

export const useTopReviews = () => {
  return useFetch(
    () => reviewService.getTopReviews(),
    [],
    true
  )
}

export const useBarberReviews = (barberId) => {
  return useFetch(
    () => reviewService.getBarberReviews(barberId),
    { reviews: [], averageRating: 0, totalReviews: 0 },
    !!barberId
  )
}

// Gallery Hook
export const useGallery = (params = {}) => {
  return useFetch(
    () => galleryService.getAll(params),
    [],
    true
  )
}

export const useGalleryCategories = () => {
  return useFetch(
    () => galleryService.getCategories(),
    ['all'],
    true
  )
}

// Notifications Hook
export const useNotifications = (params = {}) => {
  return useFetch(
    () => notificationService.getAll(params),
    { notifications: [], unreadCount: 0 },
    true
  )
}

// Create/Update/Delete hooks
export const useCreateBooking = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await bookingService.create(data)
      if (response.success) {
        return { success: true, data: response.data }
      }
      throw new Error(response.message)
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}

export const useCreateReview = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const create = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const response = await reviewService.create(data)
      if (response.success) {
        return { success: true, data: response.data }
      }
      throw new Error(response.message)
    } catch (err) {
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { create, loading, error }
}

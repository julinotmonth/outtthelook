import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/useStore'
import { bookingService } from '../services/bookingService'

export const useBooking = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const {
    currentStep,
    selectedServices,
    selectedBarber,
    selectedDate,
    selectedTime,
    customerInfo,
    setStep,
    nextStep,
    prevStep,
    toggleService,
    clearServices,
    setBarber,
    clearBarber,
    setDate,
    setTime,
    setCustomerInfo,
    getTotalPrice,
    getTotalDuration,
    resetBooking,
    canProceed,
  } = useBookingStore()

  // Get user bookings
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    error: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getBookings(),
    select: (data) => data.bookings,
  })

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (data) => {
      toast.success('Booking berhasil dibuat!')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      resetBooking()
      navigate('/history')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Gagal membuat booking'
      toast.error(message)
    },
  })

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: () => {
      toast.success('Booking berhasil dibatalkan')
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Gagal membatalkan booking'
      toast.error(message)
    },
  })

  // Submit booking
  const submitBooking = () => {
    const bookingData = {
      services: selectedServices.map((s) => s.id),
      barberId: selectedBarber.id,
      date: selectedDate,
      time: selectedTime,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      notes: customerInfo.notes,
      totalPrice: getTotalPrice(),
      totalDuration: getTotalDuration(),
    }

    createBookingMutation.mutate(bookingData)
  }

  // Cancel booking
  const cancelBooking = (bookingId) => {
    cancelBookingMutation.mutate(bookingId)
  }

  // Get booking summary
  const getBookingSummary = () => ({
    services: selectedServices,
    barber: selectedBarber,
    date: selectedDate,
    time: selectedTime,
    customer: customerInfo,
    totalPrice: getTotalPrice(),
    totalDuration: getTotalDuration(),
  })

  return {
    // State
    currentStep,
    selectedServices,
    selectedBarber,
    selectedDate,
    selectedTime,
    customerInfo,
    bookings,
    
    // Loading states
    isLoadingBookings,
    isSubmitting: createBookingMutation.isPending,
    isCancelling: cancelBookingMutation.isPending,
    
    // Errors
    bookingsError,
    
    // Actions
    setStep,
    nextStep,
    prevStep,
    toggleService,
    clearServices,
    setBarber,
    clearBarber,
    setDate,
    setTime,
    setCustomerInfo,
    resetBooking,
    submitBooking,
    cancelBooking,
    refetchBookings,
    
    // Computed
    getTotalPrice,
    getTotalDuration,
    canProceed,
    getBookingSummary,
  }
}

export default useBooking

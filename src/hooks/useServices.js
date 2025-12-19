import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { servicesService, barbersService, galleryService } from '../services/bookingService'

// Services Hook
export const useServices = (params = {}) => {
  const queryClient = useQueryClient()

  const {
    data: services,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['services', params],
    queryFn: () => servicesService.getServices(params),
    select: (data) => data.services || data,
  })

  const createMutation = useMutation({
    mutationFn: servicesService.createService,
    onSuccess: () => {
      toast.success('Layanan berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan layanan')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => servicesService.updateService(id, data),
    onSuccess: () => {
      toast.success('Layanan berhasil diupdate')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate layanan')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: servicesService.deleteService,
    onSuccess: () => {
      toast.success('Layanan berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['services'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus layanan')
    },
  })

  return {
    services,
    isLoading,
    error,
    refetch,
    createService: createMutation.mutate,
    updateService: updateMutation.mutate,
    deleteService: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// Barbers Hook
export const useBarbers = (params = {}) => {
  const queryClient = useQueryClient()

  const {
    data: barbers,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['barbers', params],
    queryFn: () => barbersService.getBarbers(params),
    select: (data) => data.barbers || data,
  })

  const createMutation = useMutation({
    mutationFn: barbersService.createBarber,
    onSuccess: () => {
      toast.success('Barber berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan barber')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => barbersService.updateBarber(id, data),
    onSuccess: () => {
      toast.success('Barber berhasil diupdate')
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal mengupdate barber')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: barbersService.deleteBarber,
    onSuccess: () => {
      toast.success('Barber berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['barbers'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus barber')
    },
  })

  return {
    barbers,
    isLoading,
    error,
    refetch,
    createBarber: createMutation.mutate,
    updateBarber: updateMutation.mutate,
    deleteBarber: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

// Barber Availability Hook
export const useBarberAvailability = (barberId, date) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['barberAvailability', barberId, date],
    queryFn: () => barbersService.getBarberAvailability(barberId, date),
    enabled: !!barberId && !!date,
    select: (data) => data.availableSlots || data,
  })

  return {
    availableSlots: data,
    isLoading,
    error,
    refetch,
  }
}

// Gallery Hook
export const useGallery = (params = {}) => {
  const queryClient = useQueryClient()

  const {
    data: galleryItems,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['gallery', params],
    queryFn: () => galleryService.getGalleryItems(params),
    select: (data) => data.items || data,
  })

  const createMutation = useMutation({
    mutationFn: galleryService.createGalleryItem,
    onSuccess: () => {
      toast.success('Foto berhasil ditambahkan')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menambahkan foto')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: galleryService.deleteGalleryItem,
    onSuccess: () => {
      toast.success('Foto berhasil dihapus')
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus foto')
    },
  })

  return {
    galleryItems,
    isLoading,
    error,
    refetch,
    createItem: createMutation.mutate,
    deleteItem: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}

export default {
  useServices,
  useBarbers,
  useBarberAvailability,
  useGallery,
}

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/useStore'
import authService from '../services/authService'

export const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    login: setAuth,
    logout: clearAuth,
    setLoading,
  } = useAuthStore()

  // Get current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: !!token,
    onSuccess: (data) => {
      useAuthStore.getState().setUser(data.user)
    },
    onError: () => {
      clearAuth()
    },
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      toast.success('Login berhasil!')
      
      // Redirect based on role
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login gagal'
      toast.error(message)
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token)
      toast.success('Registrasi berhasil!')
      navigate('/')
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registrasi gagal'
      toast.error(message)
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      toast.success('Logout berhasil')
      navigate('/login')
    },
    onError: () => {
      // Even if API fails, clear local auth state
      clearAuth()
      queryClient.clear()
      navigate('/login')
    },
  })

  // Login function
  const login = useCallback(
    (credentials) => {
      loginMutation.mutate(credentials)
    },
    [loginMutation]
  )

  // Register function
  const register = useCallback(
    (userData) => {
      registerMutation.mutate(userData)
    },
    [registerMutation]
  )

  // Logout function
  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  // Check if user has specific role
  const hasRole = useCallback(
    (role) => {
      return user?.role === role
    },
    [user]
  )

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return user?.role === 'admin'
  }, [user])

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isLoadingUser,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  }
}

export default useAuth

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/useStore'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const location = useLocation()
  const { isAuthenticated, user, isLoading } = useAuthStore()

  // Show loading while checking auth
  if (isLoading) {
    return <LoadingScreen />
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check for required role
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect non-admin users trying to access admin routes
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute

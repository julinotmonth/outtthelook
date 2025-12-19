import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { lazy, Suspense } from 'react'

// Layouts
import Layout from './components/layout/Layout'
import AdminLayout from './components/layout/AdminLayout'
import LoadingScreen from './components/common/LoadingScreen'

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/public/Home'))
const Services = lazy(() => import('./pages/public/Services'))
const Gallery = lazy(() => import('./pages/public/Gallery'))
const Team = lazy(() => import('./pages/public/Team'))
const Booking = lazy(() => import('./pages/public/Booking'))
const History = lazy(() => import('./pages/public/History'))

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ManageServices = lazy(() => import('./pages/admin/ManageServices'))
const ManageTeam = lazy(() => import('./pages/admin/ManageTeam'))
const ManageBookings = lazy(() => import('./pages/admin/ManageBookings'))
const ManageGallery = lazy(() => import('./pages/admin/ManageGallery'))

// Protected Route Component
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen />}>
        <Routes location={location} key={location.pathname}>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="services" element={<Services />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="team" element={<Team />} />
            <Route path="booking" element={<Booking />} />
            <Route path="history" element={<History />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="services" element={<ManageServices />} />
            <Route path="team" element={<ManageTeam />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="gallery" element={<ManageGallery />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

// 404 Page
function NotFound() {
  return (
    <div className="min-h-screen bg-charcoal-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-9xl text-gold mb-4">404</h1>
        <p className="text-cream/70 text-xl mb-8">Halaman tidak ditemukan</p>
        <a href="/" className="btn-primary">
          Kembali ke Beranda
        </a>
      </div>
    </div>
  )
}

export default App

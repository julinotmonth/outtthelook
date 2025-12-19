import { useState, useRef, useEffect } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  Bell, 
  User, 
  LogOut, 
  ChevronDown, 
  Calendar, 
  Star, 
  CreditCard, 
  Check, 
  Trash2,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import Sidebar from './Sidebar'
import { useUIStore, useAuthStore, useNotificationStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  enter: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

const AdminLayout = () => {
  const location = useLocation()
  const { openSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const { 
    notifications, 
    unreadCount,
    fetchNotifications,
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    clearAllNotifications 
  } = useNotificationStore()
  
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef(null)

  // Fetch notifications on mount
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-4 h-4" />
      case 'review':
        return <Star className="w-4 h-4" />
      case 'payment':
        return <CreditCard className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  // Get notification icon color based on type
  const getNotificationColor = (type) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-500/20 text-blue-400'
      case 'review':
        return 'bg-gold/20 text-gold'
      case 'payment':
        return 'bg-green-500/20 text-green-400'
      default:
        return 'bg-cream/20 text-cream'
    }
  }

  return (
    <div className="flex min-h-screen bg-charcoal-dark">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <header className="sticky top-0 z-30 bg-charcoal/95 backdrop-blur-md border-b border-gold/20">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            {/* Mobile Menu Button */}
            <button
              onClick={openSidebar}
              className="lg:hidden p-2 text-cream hover:text-gold transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="font-heading text-xl font-bold text-cream">
                Admin Dashboard
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-cream/60 hover:text-gold transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-charcoal border border-gold/20 rounded-lg shadow-xl overflow-hidden z-50"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gold/20 bg-charcoal-dark">
                        <h3 className="font-medium text-cream flex items-center gap-2">
                          <Bell className="w-4 h-4 text-gold" />
                          Notifikasi
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-error/20 text-error text-xs rounded-full">
                              {unreadCount} baru
                            </span>
                          )}
                        </h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-gold hover:text-gold-light transition-colors"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center">
                            <Bell className="w-10 h-10 text-cream/20 mx-auto mb-2" />
                            <p className="text-cream/50 text-sm">Tidak ada notifikasi</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notif) => (
                            <div
                              key={notif.id}
                              className={cn(
                                'flex gap-3 px-4 py-3 border-b border-gold/10 hover:bg-charcoal-dark/50 transition-colors',
                                !notif.is_read && 'bg-gold/5'
                              )}
                            >
                              {/* Icon */}
                              <div className={cn(
                                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                                getNotificationColor(notif.type)
                              )}>
                                {getNotificationIcon(notif.type)}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <Link
                                  to={notif.link || '/admin'}
                                  onClick={() => {
                                    markAsRead(notif.id)
                                    setShowNotifications(false)
                                  }}
                                  className="block"
                                >
                                  <p className={cn(
                                    'text-sm font-medium truncate',
                                    notif.is_read ? 'text-cream/70' : 'text-cream'
                                  )}>
                                    {notif.title}
                                  </p>
                                  <p className="text-xs text-cream/50 line-clamp-2 mt-0.5">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gold/60 mt-1">
                                    {notif.created_at ? formatDistanceToNow(new Date(notif.created_at), { 
                                      addSuffix: true, 
                                      locale: id 
                                    }) : ''}
                                  </p>
                                </Link>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-1">
                                {!notif.is_read && (
                                  <button
                                    onClick={() => markAsRead(notif.id)}
                                    className="p-1 text-cream/30 hover:text-green-400 transition-colors"
                                    title="Tandai dibaca"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteNotification(notif.id)}
                                  className="p-1 text-cream/30 hover:text-red-400 transition-colors"
                                  title="Hapus"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gold/20 bg-charcoal-dark flex items-center justify-between">
                          <button
                            onClick={() => {
                              clearAllNotifications()
                              setShowNotifications(false)
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Hapus Semua
                          </button>
                          <Link
                            to="/admin/bookings"
                            onClick={() => setShowNotifications(false)}
                            className="text-xs text-gold hover:text-gold-light transition-colors"
                          >
                            Lihat Semua Booking →
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-gold" />
                  </div>
                  <span className="hidden sm:block font-medium text-sm">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-charcoal border border-gold/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                  <div className="px-4 py-2 border-b border-gold/20">
                    <p className="text-sm font-medium text-cream">{user?.name}</p>
                    <p className="text-xs text-cream/60">{user?.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-cream/70 hover:text-error hover:bg-error/10 transition-colors w-full"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="enter"
              exit="exit"
              variants={pageVariants}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
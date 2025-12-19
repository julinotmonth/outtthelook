import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Scissors, 
  User, 
  LogOut,
  Calendar,
  ChevronDown
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { NAV_LINKS } from '../../utils/constants'
import { useAuthStore, useUIStore } from '../../store/useStore'
import Button from '../common/Button'

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore()
  const { isAuthenticated, user, logout } = useAuthStore()
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu()
  }, [location, closeMobileMenu])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-charcoal-dark/95 backdrop-blur-md border-b border-gold/20 py-3'
          : 'bg-transparent py-5'
      )}
    >
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center group-hover:border-gold-light transition-colors">
                <Scissors className="w-5 h-5 text-gold group-hover:text-gold-light transition-colors" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border border-gold/50"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="font-heading text-xl font-bold text-cream tracking-wide">
                OUTLOOK
              </h1>
              <span className="font-display text-gold text-xs tracking-[0.2em]">
                BARBERSHOP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  cn(
                    'relative font-body text-sm font-medium transition-colors duration-300',
                    isActive ? 'text-gold' : 'text-cream/70 hover:text-gold'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gold"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Desktop Auth/User Section */}
          <div className="hidden lg:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {user?.role === 'admin' && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 text-cream/70 hover:text-gold transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-gold" />
                    </div>
                    <span className="font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-charcoal border border-gold/20 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl">
                    <Link
                      to="/history"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-cream/70 hover:text-gold hover:bg-gold/10 transition-colors"
                    >
                      <Calendar className="w-4 h-4" />
                      Riwayat Booking
                    </Link>
                    <hr className="my-2 border-gold/20" />
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
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/booking">
                  <Button size="sm">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-cream hover:text-gold transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-6 space-y-4">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <NavLink
                      to={link.path}
                      className={({ isActive }) =>
                        cn(
                          'block py-2 font-medium transition-colors',
                          isActive ? 'text-gold' : 'text-cream/70'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </motion.div>
                ))}
                
                <div className="pt-4 border-t border-gold/20 space-y-3">
                  {isAuthenticated ? (
                    <>
                      {user?.role === 'admin' && (
                        <Link to="/admin" className="block">
                          <Button variant="outline" className="w-full">
                            Dashboard Admin
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-error"
                        onClick={logout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block">
                        <Button variant="outline" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link to="/booking" className="block">
                        <Button className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Now
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}

export default Navbar

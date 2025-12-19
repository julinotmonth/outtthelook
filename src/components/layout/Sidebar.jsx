import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Image,
  X,
  ChevronLeft
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { ADMIN_NAV_LINKS } from '../../utils/constants'
import { useUIStore } from '../../store/useStore'

const iconMap = {
  LayoutDashboard: LayoutDashboard,
  Calendar: Calendar,
  Scissors: Scissors,
  Users: Users,
  Image: Image,  // Tambahkan ini
}

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-charcoal border-r border-gold/20 h-screen sticky top-0">
        {/* Logo */}
        <div className="p-6 border-b border-gold/20">
          <a href="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
              <Scissors className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-cream">OUTLOOK</h1>
              <span className="font-display text-gold text-xs tracking-[0.15em]">ADMIN</span>
            </div>
          </a>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {ADMIN_NAV_LINKS.map((link) => {
              const Icon = iconMap[link.icon]
              return (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    end={link.path === '/admin'}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                        isActive
                          ? 'bg-gold/20 text-gold border border-gold/30'
                          : 'text-cream/70 hover:bg-gold/10 hover:text-gold'
                      )
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Back to Site */}
        <div className="p-4 border-t border-gold/20">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-3 text-cream/60 hover:text-gold transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Kembali ke Website
          </a>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="lg:hidden fixed inset-0 bg-charcoal-dark/80 backdrop-blur-sm z-40"
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-charcoal border-r border-gold/20 z-50 flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-gold/20 flex items-center justify-between">
                <a href="/admin" className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h1 className="font-heading text-lg font-bold text-cream">OUTLOOK</h1>
                    <span className="font-display text-gold text-xs tracking-[0.15em]">ADMIN</span>
                  </div>
                </a>
                <button
                  onClick={closeSidebar}
                  className="p-2 text-cream/60 hover:text-gold transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {ADMIN_NAV_LINKS.map((link) => {
                    const Icon = iconMap[link.icon]
                    return (
                      <li key={link.path}>
                        <NavLink
                          to={link.path}
                          end={link.path === '/admin'}
                          onClick={closeSidebar}
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300',
                              isActive
                                ? 'bg-gold/20 text-gold border border-gold/30'
                                : 'text-cream/70 hover:bg-gold/10 hover:text-gold'
                            )
                          }
                        >
                          <Icon className="w-5 h-5" />
                          {link.label}
                        </NavLink>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              {/* Back to Site */}
              <div className="p-4 border-t border-gold/20">
                <a
                  href="/"
                  className="flex items-center gap-2 px-4 py-3 text-cream/60 hover:text-gold transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Kembali ke Website
                </a>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default Sidebar

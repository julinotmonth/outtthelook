import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

const Layout = () => {
  const location = useLocation()

  return (
    <div className="flex flex-col min-h-screen bg-charcoal-dark">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
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

      {/* Footer */}
      <Footer />

      {/* Floating Book Button (Mobile) */}
      <FloatingBookButton />
    </div>
  )
}

// Floating Book Button for Mobile
const FloatingBookButton = () => {
  const location = useLocation()
  
  // Don't show on booking page
  if (location.pathname === '/booking') return null

  return (
    <motion.a
      href="/booking"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: 'spring' }}
      className="fixed bottom-6 right-6 lg:hidden z-40"
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="btn-primary rounded-full px-6 py-3 shadow-lg shadow-gold/30"
      >
        Book Now
      </motion.div>
    </motion.a>
  )
}

export default Layout

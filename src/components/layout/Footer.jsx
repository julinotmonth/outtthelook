import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Scissors, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Instagram,
  Facebook,
  MessageCircle,
  Music2,
  ArrowUp
} from 'lucide-react'
import { NAV_LINKS, CONTACT_INFO, SOCIAL_LINKS } from '../../utils/constants'

const iconMap = {
  Instagram: Instagram,
  Facebook: Facebook,
  MessageCircle: MessageCircle,
  Music2: Music2,
}

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-charcoal-dark border-t border-gold/20">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center">
                <Scissors className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-cream">OUTLOOK</h2>
                <span className="font-display text-gold text-sm tracking-[0.2em]">BARBERSHOP</span>
              </div>
            </Link>
            <p className="text-cream/60 text-sm leading-relaxed mb-6">
              Pengalaman barbershop premium dengan sentuhan modern. 
              Kami menghadirkan layanan terbaik untuk penampilan terbaik Anda.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = iconMap[social.icon]
                return (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold/70 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-300"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading text-lg font-bold text-cream mb-6">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-cream/60 hover:text-gold transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading text-lg font-bold text-cream mb-6">
              Kontak Kami
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <span className="text-cream/60 text-sm">{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <a
                  href={`tel:${CONTACT_INFO.phone}`}
                  className="text-cream/60 hover:text-gold transition-colors text-sm"
                >
                  {CONTACT_INFO.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="text-cream/60 hover:text-gold transition-colors text-sm"
                >
                  {CONTACT_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gold shrink-0" />
                <span className="text-cream/60 text-sm">{CONTACT_INFO.operationalHours}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-heading text-lg font-bold text-cream mb-6">
              Newsletter
            </h3>
            <p className="text-cream/60 text-sm mb-4">
              Dapatkan info promo dan tips grooming terbaru
            </p>
            <form className="space-y-3">
              <input
                type="email"
                placeholder="Email Anda"
                className="w-full bg-charcoal border border-gold/30 rounded-md px-4 py-3 text-cream text-sm placeholder:text-cream/40 focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="submit"
                className="w-full btn-primary text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Gold Divider */}
      <div className="gold-divider" />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-cream/40 text-sm text-center md:text-left">
            © {new Date().getFullYear()} Outlook Barbershop. All rights reserved.
          </p>
          
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-cream/40 hover:text-gold text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-cream/40 hover:text-gold text-sm transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Back to Top */}
          <motion.button
            onClick={scrollToTop}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full border border-gold/30 flex items-center justify-center text-gold hover:border-gold hover:bg-gold/10 transition-all duration-300"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </footer>
  )
}

export default Footer

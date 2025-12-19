import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { 
  Star, 
  Award, 
  Clock, 
  Calendar,
  Instagram,
  X,
  MessageSquare,
  Quote,
  Loader2
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Modal } from '../../components/common/Modal'
import { useTeamStore, useReviewStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const Team = () => {
  const [selectedBarber, setSelectedBarber] = useState(null)
  const { barbers, loading, fetchBarbers } = useTeamStore()

  // Fetch barbers on mount
  useEffect(() => {
    fetchBarbers()
  }, [fetchBarbers])

  if (loading && barbers.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Header */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="section-subtitle">Tim Kami</span>
            <h1 className="section-title mb-4">
              Barber <span className="text-gradient">Profesional</span>
            </h1>
            <p className="text-cream/60">
              Kenali tim barber berpengalaman kami yang siap memberikan layanan terbaik untuk Anda
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Barbers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {barbers.map((barber, index) => (
            <BarberCard
              key={barber.id}
              barber={barber}
              index={index}
              onViewProfile={() => setSelectedBarber(barber)}
            />
          ))}
        </div>
      </div>

      {/* Barber Profile Modal */}
      <AnimatePresence>
        {selectedBarber && (
          <BarberProfileModal
            barber={selectedBarber}
            onClose={() => setSelectedBarber(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Barber Card Component
const BarberCard = ({ barber, index, onViewProfile }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div className="relative rounded-lg overflow-hidden bg-charcoal border border-gold/20 card-hover">
        {/* Image */}
        <div className="aspect-[4/5] relative overflow-hidden">
          <img
            src={barber.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
            alt={barber.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />

          {/* Availability Badge */}
          <div className={cn(
            'absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium',
            (barber.isAvailable || barber.is_available)
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}>
            {(barber.isAvailable || barber.is_available) ? 'Available' : 'Not Available'}
          </div>

          {/* Quick Stats on Hover */}
          <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-gold">
                <Star className="w-4 h-4 fill-gold" />
                <span>{barber.rating || 0}</span>
              </div>
              <div className="flex items-center gap-1 text-cream/70">
                <Clock className="w-4 h-4" />
                <span>{barber.experience || 0} tahun</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="font-heading text-xl font-bold text-cream mb-1">
            {barber.name}
          </h3>
          <p className="text-gold text-sm mb-3">{barber.role}</p>

          {/* Specializations */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(
              barber.specializations || 
              (Array.isArray(barber.specialties) 
                ? barber.specialties 
                : (typeof barber.specialties === 'string' && barber.specialties 
                    ? barber.specialties.split(',').map(s => s.trim()) 
                    : [])
              )
            ).slice(0, 3).map((spec, idx) => (
              <span
                key={`${spec}-${idx}`}
                className="px-2 py-1 bg-gold/10 text-gold/80 text-xs rounded-full"
              >
                {spec}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onViewProfile}
            >
              Lihat Profil
            </Button>
            {(barber.isAvailable || barber.is_available) ? (
              <Link to={`/booking?barber=${barber.id}`} className="flex-1">
                <Button size="sm" className="w-full">
                  <Calendar className="w-4 h-4 mr-1" />
                  Book
                </Button>
              </Link>
            ) : (
              <Button 
                size="sm" 
                className="flex-1 opacity-50 cursor-not-allowed" 
                disabled
              >
                <Calendar className="w-4 h-4 mr-1" />
                Not Available
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Barber Profile Modal
const BarberProfileModal = ({ barber, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-charcoal-dark/95 backdrop-blur-md" />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-charcoal border border-gold/20 rounded-lg z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-charcoal-dark/80 flex items-center justify-center text-cream hover:text-gold transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <BarberProfileContent barber={barber} />
      </motion.div>
    </motion.div>
  )
}

// Barber Profile Content
const BarberProfileContent = ({ barber }) => {
  const { reviews, fetchReviews } = useReviewStore()
  
  const rating = barber.rating || 0
  const reviewCount = barber.reviews_count || 0
  const barberReviews = reviews.filter(r => r.barber_id === barber.id)
  
  // Parse specialties - handle both array and string formats
  const specializations = barber.specializations || 
    (Array.isArray(barber.specialties) 
      ? barber.specialties 
      : (typeof barber.specialties === 'string' && barber.specialties 
          ? barber.specialties.split(',').map(s => s.trim()) 
          : [])
    )

  return (
    <div className="flex flex-col md:flex-row">
      {/* Image */}
      <div className="md:w-2/5 aspect-[4/5] md:aspect-auto">
        <img
          src={barber.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
          alt={barber.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="md:w-3/5 p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <span className={cn(
            'inline-block px-3 py-1 rounded-full text-xs font-medium mb-3',
            (barber.isAvailable || barber.is_available)
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          )}>
            {(barber.isAvailable || barber.is_available) ? 'Available Today' : 'Not Available'}
          </span>
          <h2 className="font-heading text-3xl font-bold text-cream mb-1">
            {barber.name}
          </h2>
          <p className="text-gold">{barber.role}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-charcoal-dark rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gold mb-1">
              <Star className="w-4 h-4 fill-gold" />
              <span className="font-display text-xl">{rating}</span>
            </div>
            <span className="text-cream/50 text-xs">Rating ({reviewCount})</span>
          </div>
          <div className="text-center p-3 bg-charcoal-dark rounded-lg">
            <div className="flex items-center justify-center gap-1 text-gold mb-1">
              <Award className="w-4 h-4" />
              <span className="font-display text-xl">{barber.experience || 0}</span>
            </div>
            <span className="text-cream/50 text-xs">Tahun</span>
          </div>
          <div className="text-center p-3 bg-charcoal-dark rounded-lg">
            <span className="font-display text-xl text-gold block mb-1">
              {(barber.totalClients || barber.total_clients || 0).toLocaleString()}
            </span>
            <span className="text-cream/50 text-xs">Klien</span>
          </div>
        </div>

        {/* Bio */}
        {barber.bio && (
          <div className="mb-6">
            <h3 className="text-cream font-medium mb-2">Tentang</h3>
            <p className="text-cream/60 text-sm leading-relaxed">{barber.bio}</p>
          </div>
        )}

        {/* Specializations */}
        <div className="mb-6">
          <h3 className="text-cream font-medium mb-2">Keahlian</h3>
          <div className="flex flex-wrap gap-2">
            {specializations.map((spec) => (
              <span
                key={spec}
                className="px-3 py-1.5 bg-gold/10 text-gold text-sm rounded-full border border-gold/30"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>

        {/* Work Schedule */}
        {(barber.workSchedule || barber.work_start_time) && (
          <div className="mb-6">
            <h3 className="text-cream font-medium mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gold" />
              Jam Kerja
            </h3>
            <p className="text-cream/60 text-sm">
              {barber.workSchedule?.startTime || barber.work_start_time} - {barber.workSchedule?.endTime || barber.work_end_time}
            </p>
          </div>
        )}

        {/* Instagram */}
        {barber.instagram && (
          <div className="mb-6">
            <a
              href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-cream/60 hover:text-gold transition-colors"
            >
              <Instagram className="w-4 h-4" />
              <span className="text-sm">{barber.instagram}</span>
            </a>
          </div>
        )}

        {/* Reviews Section */}
        {barberReviews.length > 0 && (
          <div className="mb-6">
            <h3 className="text-cream font-medium mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold" />
              Ulasan Pelanggan ({barberReviews.length})
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
              {barberReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="p-3 bg-charcoal-dark rounded-lg relative">
                  <Quote className="w-6 h-6 text-gold/10 absolute top-2 right-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'w-3 h-3',
                            star <= review.rating
                              ? 'text-gold fill-gold'
                              : 'text-cream/20'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-cream text-sm font-medium">{review.customerName}</span>
                  </div>
                  <p className="text-cream/60 text-sm">{review.comment}</p>
                  <p className="text-cream/30 text-xs mt-1">
                    {format(new Date(review.createdAt), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book Button */}
        {(barber.isAvailable || barber.is_available) ? (
          <Link to={`/booking?barber=${barber.id}`}>
            <Button className="w-full" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
        ) : (
          <Button className="w-full opacity-50 cursor-not-allowed" size="lg" disabled>
            <Calendar className="w-4 h-4 mr-2" />
            Tidak Tersedia
          </Button>
        )}
      </div>
    </div>
  )
}

export default Team
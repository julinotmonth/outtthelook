import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  Scissors, 
  Calendar, 
  Star, 
  ArrowRight, 
  Play,
  Quote,
  Clock,
  MapPin,
  ChevronRight,
  MessageSquare
} from 'lucide-react'
import Button from '../../components/common/Button'
import { STATS } from '../../utils/constants'
import { useServicesStore, useReviewStore } from '../../store/useStore'
import { formatCurrency } from '../../utils/formatters'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const Home = () => {
  const { fetchServices } = useServicesStore()
  const { fetchTopReviews } = useReviewStore()

  // Fetch data on mount
  useEffect(() => {
    fetchServices()
    fetchTopReviews()
  }, [fetchServices, fetchTopReviews])

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />
      
      {/* About Section */}
      <AboutSection />
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Services Preview */}
      <ServicesPreview />
      
      {/* Testimonials */}
      <TestimonialsSection />
      
      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

// Hero Section
const HeroSection = () => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 z-0"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal-dark/70 via-charcoal-dark/50 to-charcoal-dark" />
        <div className="absolute inset-0 bg-charcoal-dark/40" />
      </motion.div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 pattern-bg z-0" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 container mx-auto px-4 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="font-display text-gold text-lg tracking-[0.3em] uppercase mb-4 block">
            Premium Barbershop Experience
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-cream mb-6"
        >
          OUTLOOK
          <span className="block text-gradient">BARBERSHOP</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-cream/70 text-lg md:text-xl max-w-2xl mx-auto mb-10"
        >
          Rasakan pengalaman grooming premium dengan barber profesional. 
          Kami menghadirkan pelayanan terbaik untuk penampilan terbaik Anda.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/booking">
            <Button size="xl" className="group">
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" size="xl">
              Lihat Layanan
            </Button>
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-gold/50 rounded-full flex justify-center pt-2"
          >
            <motion.div className="w-1.5 h-1.5 bg-gold rounded-full" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 border border-gold/20 rounded-full" />
      <div className="absolute bottom-32 right-10 w-32 h-32 border border-gold/10 rounded-full" />
      <div className="absolute top-1/3 right-20 w-2 h-2 bg-gold rounded-full animate-float" />
    </section>
  )
}

// About Section
const AboutSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image Grid */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=600&fit=crop"
                    alt="Barbershop"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=400&fit=crop"
                    alt="Haircut"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop"
                    alt="Shaving"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="aspect-[3/4] rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=600&fit=crop"
                    alt="Tools"
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
            
            {/* Experience Badge */}
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="absolute -bottom-6 -right-6 w-32 h-32 bg-gold rounded-full flex flex-col items-center justify-center text-charcoal-dark shadow-xl shadow-gold/30"
            >
              <span className="font-display text-4xl font-bold">10+</span>
              <span className="text-xs font-medium">Tahun Pengalaman</span>
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="section-subtitle">Tentang Kami</span>
            <h2 className="section-title mb-6">
              Lebih Dari Sekedar
              <span className="text-gradient"> Barbershop</span>
            </h2>
            
            <div className="space-y-4 text-cream/70 mb-8">
              <p>
                Outlook Barbershop didirikan dengan visi untuk menghadirkan pengalaman 
                grooming premium yang memadukan teknik tradisional dengan sentuhan modern.
              </p>
              <p>
                Setiap barber kami adalah profesional terlatih yang berdedikasi untuk 
                memberikan hasil terbaik sesuai dengan gaya dan kebutuhan unik Anda.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { icon: Scissors, text: 'Barber Profesional' },
                { icon: Star, text: 'Produk Premium' },
                { icon: Clock, text: 'Booking Fleksibel' },
                { icon: MapPin, text: 'Lokasi Strategis' },
              ].map((item, index) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-charcoal border border-gold/20"
                >
                  <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-gold" />
                  </div>
                  <span className="text-sm font-medium text-cream">{item.text}</span>
                </motion.div>
              ))}
            </div>

            <Link to="/team">
              <Button variant="outline" className="group">
                Kenali Tim Kami
                <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// Stats Section
const StatsSection = () => {
  return (
    <section className="py-16 bg-charcoal border-y border-gold/20">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              className="text-center"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className="font-display text-5xl md:text-6xl text-gold block mb-2"
              >
                {stat.value}
              </motion.span>
              <span className="text-cream/60 text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Services Preview
const ServicesPreview = () => {
  const { services, getActiveServices } = useServicesStore()
  const activeServices = getActiveServices()
  const displayServices = activeServices.slice(0, 4)

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-subtitle">Layanan Kami</span>
          <h2 className="section-title">
            Pilihan Layanan <span className="text-gradient">Premium</span>
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative rounded-lg overflow-hidden bg-charcoal border border-gold/20 card-hover"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-heading text-xl font-bold text-cream mb-2">
                  {service.name}
                </h3>
                <p className="text-cream/60 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-display text-gold text-lg">
                    {formatCurrency(service.price)}
                  </span>
                  <Link
                    to="/booking"
                    className="text-gold hover:text-gold-light transition-colors text-sm font-medium"
                  >
                    Book Now →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/services">
            <Button variant="outline" size="lg">
              Lihat Semua Layanan
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// Testimonials Section
const TestimonialsSection = () => {
  const { reviews } = useReviewStore()
  
  // Get latest 3 reviews with rating >= 4
  const topReviews = reviews
    .filter(review => review.rating >= 4)
    .slice(0, 3)

  // If no reviews yet, show empty state
  if (topReviews.length === 0) {
    return (
      <section className="py-24 bg-charcoal">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="section-subtitle">Testimoni</span>
            <h2 className="section-title">
              Apa Kata <span className="text-gradient">Pelanggan</span>
            </h2>
          </motion.div>
          
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gold/30 mx-auto mb-4" />
            <p className="text-cream/50">Belum ada ulasan dari pelanggan</p>
            <p className="text-cream/30 text-sm mt-2">Jadilah yang pertama memberikan ulasan!</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-charcoal">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="section-subtitle">Testimoni</span>
          <h2 className="section-title">
            Apa Kata <span className="text-gradient">Pelanggan</span>
          </h2>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {topReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-lg bg-charcoal-dark border border-gold/20 relative"
            >
              {/* Quote Icon */}
              <Quote className="w-10 h-10 text-gold/20 absolute top-4 right-4" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: review.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-gold fill-gold" />
                ))}
              </div>

              {/* Text */}
              <p className="text-cream/70 mb-6 italic line-clamp-4">"{review.comment}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center border-2 border-gold/30">
                  <span className="text-gold font-medium text-lg">
                    {(review.customerName || review.customer_name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-cream">{review.customerName || review.customer_name || 'Pelanggan'}</h4>
                  <p className="text-cream/50 text-sm">
                    Barber: {review.barberName || review.barber_name || review.barber?.name || '-'}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More */}
        {reviews.length > 3 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link to="/team">
              <Button variant="outline">
                Lihat Semua Ulasan
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-gold/20 to-copper/20" />
      <div className="absolute inset-0 pattern-bg" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <span className="section-subtitle">Siap Tampil Maksimal?</span>
          <h2 className="section-title mb-6">
            Book Appointment
            <span className="text-gradient"> Sekarang</span>
          </h2>
          <p className="text-cream/70 text-lg mb-10">
            Jangan tunggu lagi! Reservasi jadwal Anda sekarang dan rasakan 
            pengalaman barbershop premium yang tak terlupakan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/booking">
              <Button size="xl" className="gold-glow">
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment
              </Button>
            </Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl">
                Chat WhatsApp
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Home
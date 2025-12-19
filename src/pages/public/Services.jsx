import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Clock, 
  Scissors,
  Filter,
  Grid3X3,
  List,
  ChevronRight,
  Loader2
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Card, CardContent } from '../../components/common/Card'
import { Input } from '../../components/common/Input'
import { CardSkeleton } from '../../components/common/LoadingSpinner'
import EmptyState from '../../components/common/EmptyState'
import { SERVICE_CATEGORIES } from '../../utils/constants'
import { formatCurrency, formatDuration } from '../../utils/formatters'
import { useServicesStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const Services = () => {
  const { services, loading, fetchServices, getActiveServices } = useServicesStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid')

  // Fetch services on mount
  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  // Get only active services
  const activeServices = getActiveServices()

  // Filter services
  const filteredServices = useMemo(() => {
    return activeServices.filter((service) => {
      const matchesSearch = service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, activeServices])

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
            <span className="section-subtitle">Layanan Kami</span>
            <h1 className="section-title mb-4">
              Pilihan Layanan <span className="text-gradient">Premium</span>
            </h1>
            <p className="text-cream/60">
              Temukan berbagai layanan grooming profesional untuk penampilan terbaik Anda
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
              <Input
                type="text"
                placeholder="Cari layanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      selectedCategory === category.id
                        ? 'bg-gold text-charcoal-dark'
                        : 'bg-charcoal border border-gold/30 text-cream/70 hover:border-gold hover:text-gold'
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-charcoal border border-gold/20 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'grid' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-gold'
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded transition-colors',
                    viewMode === 'list' ? 'bg-gold/20 text-gold' : 'text-cream/50 hover:text-gold'
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-cream/60 text-sm">
            Menampilkan <span className="text-gold font-medium">{filteredServices.length}</span> layanan
          </p>
        </div>

        {/* Services Grid/List */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Layanan tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau filter kategori"
            action={() => {
              setSearchQuery('')
              setSelectedCategory('all')
            }}
            actionLabel="Reset Filter"
          />
        ) : (
          <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredServices.map((service, index) => (
                  <ServiceCard key={service.id} service={service} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {filteredServices.map((service, index) => (
                  <ServiceListItem key={service.id} service={service} index={index} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

// Service Card Component
const ServiceCard = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover className="h-full overflow-hidden group">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-transparent to-transparent" />
          
          {/* Popular Badge */}
          {service.isPopular && (
            <div className="absolute top-4 left-4 bg-gold text-charcoal-dark px-3 py-1 rounded-full text-xs font-bold">
              POPULER
            </div>
          )}

          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 bg-charcoal/90 backdrop-blur-sm text-gold px-3 py-1 rounded-full font-display text-lg">
            {formatCurrency(service.price)}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Category */}
          <span className="text-gold/70 text-xs uppercase tracking-wider">
            {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
          </span>

          {/* Title */}
          <h3 className="font-heading text-xl font-bold text-cream mt-1 mb-2">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-cream/60 text-sm mb-4 line-clamp-2">
            {service.description}
          </p>

          {/* Duration & Book Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cream/50 text-sm">
              <Clock className="w-4 h-4" />
              {formatDuration(service.duration)}
            </div>
            <Link to={`/booking?service=${service.id}`}>
              <Button size="sm" className="group/btn">
                Book Now
                <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Service List Item Component
const ServiceListItem = ({ service, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card hover className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="md:w-48 h-48 md:h-auto relative overflow-hidden shrink-0">
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-full object-cover"
            />
            {service.isPopular && (
              <div className="absolute top-3 left-3 bg-gold text-charcoal-dark px-2 py-0.5 rounded-full text-xs font-bold">
                POPULER
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-gold/70 text-xs uppercase tracking-wider">
                    {SERVICE_CATEGORIES.find(c => c.id === service.category)?.label}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-cream">
                    {service.name}
                  </h3>
                </div>
                <span className="font-display text-2xl text-gold">
                  {formatCurrency(service.price)}
                </span>
              </div>
              <p className="text-cream/60 text-sm mb-4">
                {service.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cream/50 text-sm">
                <Clock className="w-4 h-4" />
                {formatDuration(service.duration)}
              </div>
              <Link to={`/booking?service=${service.id}`}>
                <Button className="group">
                  Book Now
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default Services
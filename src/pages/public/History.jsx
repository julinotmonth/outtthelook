import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Search,
  Eye,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Wallet,
  Plus,
  Star,
  MessageSquare,
  Upload,
  Image,
  CreditCard,
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Card, CardContent } from '../../components/common/Card'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { StatusBadge } from '../../components/common/Badge'
import { Modal, DialogFooter } from '../../components/common/Modal'
import EmptyState from '../../components/common/EmptyState'
import { formatCurrency, formatDuration, formatBookingId } from '../../utils/formatters'
import { useHistoryStore, useReviewStore, useNotificationStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

// Payment status labels and colors
const PAYMENT_STATUS = {
  pending: { label: 'Belum Bayar', color: 'bg-yellow-500/20 text-yellow-500', icon: AlertCircle },
  waiting_verification: { label: 'Menunggu Verifikasi', color: 'bg-blue-500/20 text-blue-500', icon: Clock },
  paid: { label: 'Lunas', color: 'bg-green-500/20 text-green-500', icon: CheckCircle },
  rejected: { label: 'Ditolak', color: 'bg-red-500/20 text-red-500', icon: XCircle },
}

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  const config = PAYMENT_STATUS[status] || PAYMENT_STATUS.pending
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

const STATUS_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Menunggu' },
  { id: 'confirmed', label: 'Dikonfirmasi' },
  { id: 'completed', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
]

const History = () => {
  const { bookings, loading, fetchBookings, updateBookingStatus, cancelBooking, uploadPaymentProof } = useHistoryStore()
  const { addReview } = useReviewStore()
  const { addNotification } = useNotificationStore()
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [bookingToReview, setBookingToReview] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [bookingToUpload, setBookingToUpload] = useState(null)

  // Fetch bookings on mount
  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Check if booking has review
  const hasReviewForBooking = (bookingId) => {
    // This would ideally check from API, for now return false
    return false
  }

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const barberName = booking.barber?.name || ''
      const services = booking.services || []
      const matchesSearch = 
        formatBookingId(booking.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        barberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        services.some(s => s.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesStatus && matchesSearch
    })
  }, [bookings, statusFilter, searchQuery])

  // Handle cancel booking
  const handleCancelBooking = async () => {
    if (!bookingToCancel) return
    
    setIsCancelling(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    updateBookingStatus(bookingToCancel.id, 'cancelled')
    toast.success('Booking berhasil dibatalkan')
    
    setIsCancelling(false)
    setShowCancelModal(false)
    setBookingToCancel(null)
  }

  // Open cancel modal
  const openCancelModal = (booking) => {
    setBookingToCancel(booking)
    setShowCancelModal(true)
  }

  // Open review modal
  const openReviewModal = (booking) => {
    setBookingToReview(booking)
    setShowReviewModal(true)
  }

  // Open payment upload modal
  const openPaymentModal = (booking) => {
    setBookingToUpload(booking)
    setShowPaymentModal(true)
  }

  // Handle upload payment proof
  const handleUploadPayment = async (imageUrl) => {
    if (!bookingToUpload) return
    
    try {
      const result = await uploadPaymentProof(bookingToUpload.id, imageUrl)
      
      if (result.success) {
        toast.success('Bukti pembayaran berhasil diupload! Menunggu verifikasi admin.')
        setShowPaymentModal(false)
        setBookingToUpload(null)
        fetchBookings() // Refresh data
      } else {
        toast.error(result.message || 'Gagal mengupload bukti pembayaran')
      }
    } catch (error) {
      toast.error('Gagal mengupload bukti pembayaran')
    }
  }

  // Handle submit review
  const handleSubmitReview = async (reviewData) => {
    try {
      // Normalize booking data
      const barberId = bookingToReview.barber?.id || bookingToReview.barber_id
      const barberName = bookingToReview.barber?.name || 'Barber'
      const services = (bookingToReview.services || []).map(s => s.name)

      const result = await addReview({
        ...reviewData,
        booking_id: bookingToReview.id,
        barber_id: barberId,
        barber_name: barberName,
        services: services,
      })

      if (result && result.success) {
        // Add notification for admin (optional, don't fail if it errors)
        try {
          await addNotification({
            type: 'review',
            title: 'Review Baru',
            message: `${reviewData.customerName || reviewData.customer_name} memberikan rating ${reviewData.rating} bintang untuk ${barberName}`,
            link: '/admin/team',
          })
        } catch (e) {
          console.log('Notification skipped')
        }

        toast.success('Terima kasih atas ulasan Anda!')
        setShowReviewModal(false)
        setBookingToReview(null)
      } else {
        toast.error(result?.message || 'Gagal mengirim ulasan')
      }
    } catch (error) {
      console.error('Review error:', error)
      toast.error('Gagal mengirim ulasan')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="section-subtitle">Riwayat</span>
          <h1 className="section-title">
            Booking <span className="text-gradient">Saya</span>
          </h1>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
            <Input
              type="text"
              placeholder="Cari booking ID, barber, atau layanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  statusFilter === filter.id
                    ? 'bg-gold text-charcoal-dark'
                    : 'bg-charcoal border border-gold/30 text-cream/70 hover:border-gold hover:text-gold'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Belum ada booking"
            description="Anda belum memiliki riwayat booking. Mulai booking pertama Anda sekarang!"
            action={
              <Link to="/booking">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Buat Booking Baru
                </Button>
              </Link>
            }
          />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={Search}
            title="Tidak ditemukan"
            description={`Tidak ada booking dengan filter "${STATUS_FILTERS.find(f => f.id === statusFilter)?.label}" atau pencarian "${searchQuery}"`}
            action={() => {
              setStatusFilter('all')
              setSearchQuery('')
            }}
            actionLabel="Reset Filter"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {filteredBookings.map((booking, index) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                index={index}
                onViewDetails={() => setSelectedBooking(booking)}
                onCancel={() => openCancelModal(booking)}
                onReview={() => openReviewModal(booking)}
                onUploadPayment={() => openPaymentModal(booking)}
                hasReview={hasReviewForBooking(booking.id)}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <BookingDetailModal
            booking={selectedBooking}
            onClose={() => setSelectedBooking(null)}
            onCancel={() => {
              setSelectedBooking(null)
              openCancelModal(selectedBooking)
            }}
            onReview={() => {
              setSelectedBooking(null)
              openReviewModal(selectedBooking)
            }}
            hasReview={hasReviewForBooking(selectedBooking.id)}
          />
        )}
      </AnimatePresence>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Batalkan Booking"
      >
        <div className="py-4">
          <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
            <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
            <p className="text-cream/80 text-sm">
              Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          
          {bookingToCancel && (
            <div className="p-4 bg-charcoal-dark rounded-lg">
              <p className="text-gold font-medium">{formatBookingId(bookingToCancel.id)}</p>
              <p className="text-cream/60 text-sm">
                {(() => {
                  const dateStr = bookingToCancel.date || bookingToCancel.booking_date
                  if (!dateStr) return '-'
                  try {
                    const date = new Date(dateStr)
                    if (isNaN(date.getTime())) return '-'
                    return format(date, 'EEEE, dd MMMM yyyy', { locale: id })
                  } catch (e) {
                    return '-'
                  }
                })()}
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => setShowCancelModal(false)}
            disabled={isCancelling}
          >
            Kembali
          </Button>
          <Button
            onClick={handleCancelBooking}
            isLoading={isCancelling}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {isCancelling ? 'Membatalkan...' : 'Ya, Batalkan'}
          </Button>
        </DialogFooter>
      </Modal>

      {/* Review Modal */}
      {showReviewModal && bookingToReview && (
        <ReviewModal
          booking={bookingToReview}
          onClose={() => {
            setShowReviewModal(false)
            setBookingToReview(null)
          }}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Payment Upload Modal */}
      {showPaymentModal && bookingToUpload && (
        <PaymentUploadModal
          booking={bookingToUpload}
          onClose={() => {
            setShowPaymentModal(false)
            setBookingToUpload(null)
          }}
          onSubmit={handleUploadPayment}
        />
      )}
    </div>
  )
}

// Booking Card Component
const BookingCard = ({ booking, index, onViewDetails, onCancel, onReview, onUploadPayment, hasReview }) => {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReview = booking.status === 'completed' && !hasReview
  const paymentStatus = booking.payment_status || 'pending'
  const paymentMethod = booking.paymentMethod || booking.payment_method
  
  // Can upload payment if: not cash, not paid, not cancelled, and no proof yet or rejected
  const canUploadPayment = 
    paymentMethod !== 'cash' && 
    booking.status !== 'cancelled' &&
    (paymentStatus === 'pending' || paymentStatus === 'rejected') &&
    !booking.payment_proof

  // Normalize date fields - handle both API format and local format
  const createdAt = booking.createdAt || booking.created_at
  const bookingDate = booking.date || booking.booking_date
  const bookingTime = booking.time || booking.booking_time
  const totalPrice = booking.totalPrice || booking.total_price || 0
  const barberImage = booking.barber?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  const barberName = booking.barber?.name || 'Barber'
  const services = booking.services || []

  // Safe date formatting
  const formatSafeDate = (dateStr, formatStr) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return format(date, formatStr, { locale: id })
    } catch (e) {
      return '-'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="overflow-hidden hover:border-gold/40 transition-colors">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left Section - Booking Info */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-display text-xl text-gold">
                    {formatBookingId(booking.id)}
                  </p>
                  <p className="text-cream/50 text-sm">
                    Dibuat {formatSafeDate(createdAt, 'dd MMM yyyy, HH:mm')}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={booking.status} />
                  {paymentMethod !== 'cash' && <PaymentStatusBadge status={paymentStatus} />}
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <div className="flex items-center gap-2 text-cream/50 text-sm mb-2">
                  <Scissors className="w-4 h-4" />
                  <span>Layanan</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gold/10 text-cream text-sm rounded-full"
                    >
                      {service.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Barber & Schedule */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <img
                    src={barberImage}
                    alt={barberName}
                    className="w-10 h-10 rounded-full object-cover border border-gold/30"
                  />
                  <div>
                    <p className="text-cream text-sm font-medium">{barberName}</p>
                    <p className="text-cream/50 text-xs">Barber</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-cream/70">
                  <Calendar className="w-4 h-4 text-gold" />
                  <span className="text-sm">
                    {formatSafeDate(bookingDate, 'dd MMM yyyy')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-cream/70">
                  <Clock className="w-4 h-4 text-gold" />
                  <span className="text-sm">{bookingTime || '-'}</span>
                </div>

                {paymentMethod && (
                  <div className="flex items-center gap-2 text-cream/70">
                    <Wallet className="w-4 h-4 text-gold" />
                    <span className="text-sm">{typeof paymentMethod === 'object' ? paymentMethod.name : paymentMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Price & Actions */}
            <div className="md:w-52 p-6 bg-charcoal-dark/50 flex flex-col justify-between border-t md:border-t-0 md:border-l border-gold/10">
              <div className="text-center md:text-right mb-4">
                <p className="text-cream/50 text-xs mb-1">Total</p>
                <p className="font-display text-2xl text-gold">
                  {formatCurrency(totalPrice)}
                </p>
                <p className="text-cream/50 text-xs">
                  {formatDuration(booking.totalDuration || booking.total_duration || 0)}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Button size="sm" variant="outline" onClick={onViewDetails}>
                  <Eye className="w-4 h-4 mr-1" />
                  Detail
                </Button>
                {canUploadPayment && (
                  <Button size="sm" onClick={onUploadPayment}>
                    <Upload className="w-4 h-4 mr-1" />
                    Upload Bukti
                  </Button>
                )}
                {canReview && (
                  <Button
                    size="sm"
                    onClick={onReview}
                    className="bg-gold/20 text-gold hover:bg-gold/30"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Beri Rating
                  </Button>
                )}
                {hasReview && booking.status === 'completed' && (
                  <div className="flex items-center justify-center gap-1 text-green-500 text-xs py-2">
                    <CheckCircle className="w-3 h-3" />
                    Sudah direview
                  </div>
                )}
                {canCancel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onCancel}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Batalkan
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Booking Detail Modal
const BookingDetailModal = ({ booking, onClose, onCancel, onReview, hasReview }) => {
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const canReview = booking.status === 'completed' && !hasReview

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'cancelled':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-blue-500" />
      default:
        return <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
    }
  }

  // Normalize fields
  const bookingDate = booking.date || booking.booking_date
  const bookingTime = booking.time || booking.booking_time
  const totalPrice = booking.totalPrice || booking.total_price || 0
  const totalDuration = booking.totalDuration || booking.total_duration || 0
  const barberImage = booking.barber?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  const barberName = booking.barber?.name || 'Barber'
  const services = booking.services || []
  const paymentMethod = booking.paymentMethod || booking.payment_method
  const customer = booking.customer || {
    name: booking.customer_name || '',
    email: booking.customer_email || '',
    phone: booking.customer_phone || '',
    notes: booking.notes || ''
  }

  // Safe date formatting
  const formatSafeDate = (dateStr, formatStr) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return '-'
      return format(date, formatStr, { locale: id })
    } catch (e) {
      return '-'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-charcoal-dark/95 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg bg-charcoal border border-gold/20 rounded-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(booking.status)}
              <div>
                <h2 className="font-heading text-xl font-bold text-cream">
                  {formatBookingId(booking.id)}
                </h2>
                <StatusBadge status={booking.status} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-cream/50 hover:text-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schedule */}
          <div>
            <h3 className="text-gold text-sm font-medium mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Jadwal
            </h3>
            <p className="text-cream">
              {formatSafeDate(bookingDate, 'EEEE, dd MMMM yyyy')}
            </p>
            <p className="text-cream/60">Pukul {bookingTime || '-'}</p>
          </div>

          {/* Barber */}
          <div>
            <h3 className="text-gold text-sm font-medium mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Barber
            </h3>
            <div className="flex items-center gap-3">
              <img
                src={barberImage}
                alt={barberName}
                className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
              />
              <p className="text-cream font-medium">{barberName}</p>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-gold text-sm font-medium mb-2 flex items-center gap-2">
              <Scissors className="w-4 h-4" />
              Layanan
            </h3>
            <div className="space-y-2">
              {services.map((service, i) => (
                <div key={i} className="flex justify-between text-cream">
                  <span>{service.name}</span>
                  <span className="text-cream/70">{formatCurrency(service.price)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          {paymentMethod && (
            <div>
              <h3 className="text-gold text-sm font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Metode Pembayaran
              </h3>
              <p className="text-cream">{typeof paymentMethod === 'object' ? paymentMethod.name : paymentMethod}</p>
            </div>
          )}

          {/* Customer Info */}
          {customer && customer.name && (
            <div>
              <h3 className="text-gold text-sm font-medium mb-2">Data Pelanggan</h3>
              <div className="space-y-1 text-sm">
                <p className="text-cream"><span className="text-cream/60">Nama:</span> {customer.name}</p>
                <p className="text-cream"><span className="text-cream/60">Email:</span> {customer.email}</p>
                <p className="text-cream"><span className="text-cream/60">Telepon:</span> {customer.phone}</p>
                {customer.notes && (
                  <p className="text-cream"><span className="text-cream/60">Catatan:</span> {customer.notes}</p>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="pt-4 border-t border-gold/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-cream/60 text-sm">Total</p>
                <p className="font-display text-2xl text-gold">
                  {formatCurrency(totalPrice)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cream/60 text-sm">Durasi</p>
                <p className="text-cream">{formatDuration(totalDuration)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gold/20 flex flex-wrap gap-3">
          {canCancel && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <X className="w-4 h-4 mr-2" />
              Batalkan
            </Button>
          )}
          {canReview && (
            <Button onClick={onReview}>
              <Star className="w-4 h-4 mr-2" />
              Beri Rating
            </Button>
          )}
          {hasReview && booking.status === 'completed' && (
            <div className="flex items-center gap-1 text-green-500 text-sm px-4">
              <CheckCircle className="w-4 h-4" />
              Sudah direview
            </div>
          )}
          <Button variant="outline" className="ml-auto" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Review Modal Component
const ReviewModal = ({ booking, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState(booking.customer?.name || booking.customer_name || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!customerName.trim()) {
      toast.error('Nama harus diisi')
      return
    }
    
    if (!comment.trim()) {
      toast.error('Ulasan harus diisi')
      return
    }

    setIsSubmitting(true)
    
    onSubmit({
      customer_name: customerName,
      customerName,
      rating,
      comment,
    })
    
    setIsSubmitting(false)
  }

  const barberName = booking.barber?.name || 'Barber'
  const barberImage = booking.barber?.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  const services = (booking.services || []).map(s => s.name).join(', ') || '-'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-charcoal-dark/95 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-sm bg-charcoal border border-gold/20 rounded-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="p-4 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              <h2 className="font-heading text-lg font-bold text-cream">
                Beri Rating
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-cream/50 hover:text-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content - Compact */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Barber Info - Smaller */}
          <div className="flex items-center gap-3 p-3 bg-charcoal-dark rounded-lg">
            <img
              src={barberImage}
              alt={barberName}
              className="w-10 h-10 rounded-full object-cover border border-gold/30"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-cream font-medium text-sm truncate">{barberName}</h3>
              <p className="text-cream/60 text-xs truncate">{services}</p>
            </div>
          </div>

          {/* Rating Stars - Smaller */}
          <div>
            <label className="block text-cream text-sm font-medium mb-2">Rating</label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'w-8 h-8 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'text-gold fill-gold'
                        : 'text-cream/30'
                    )}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-cream/60 text-xs mt-1">
              {rating === 1 && 'Sangat Buruk'}
              {rating === 2 && 'Buruk'}
              {rating === 3 && 'Cukup'}
              {rating === 4 && 'Bagus'}
              {rating === 5 && 'Sangat Bagus'}
            </p>
          </div>

          {/* Customer Name */}
          <FormField label="Nama Anda" required>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="text-sm"
            />
          </FormField>

          {/* Comment */}
          <FormField label="Ulasan" required>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda..."
              rows={3}
              className="text-sm"
            />
          </FormField>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-1" />
              Kirim
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Payment Upload Modal Component
const PaymentUploadModal = ({ booking, onClose, onSubmit }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState('url') // 'url' or 'file'
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB')
        return
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar')
        return
      }

      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target.result)
        setImageUrl(e.target.result) // Use base64 as the image URL
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlChange = (e) => {
    const url = e.target.value
    setImageUrl(url)
    setPreviewUrl(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!imageUrl.trim()) {
      toast.error('Masukkan bukti pembayaran')
      return
    }

    setIsSubmitting(true)
    await onSubmit(imageUrl)
    setIsSubmitting(false)
  }

  const totalPrice = booking.totalPrice || booking.total_price || 0
  const paymentMethod = booking.paymentMethod?.name || booking.payment_method || 'Transfer'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-charcoal-dark/95 backdrop-blur-md" />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-md bg-charcoal border border-gold/20 rounded-lg overflow-hidden z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gold/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gold" />
              <h2 className="font-heading text-lg font-bold text-cream">
                Upload Bukti Pembayaran
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-cream/50 hover:text-gold transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Booking Info */}
          <div className="p-3 bg-charcoal-dark rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gold font-mono text-sm">{formatBookingId(booking.id)}</span>
              <span className="text-cream/60 text-sm">{paymentMethod}</span>
            </div>
            <p className="text-gold font-display text-xl">{formatCurrency(totalPrice)}</p>
          </div>

          {/* Upload Method Toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMethod('file')}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                uploadMethod === 'file'
                  ? 'bg-gold text-charcoal-dark'
                  : 'bg-charcoal-dark text-cream/70 hover:text-gold'
              )}
            >
              <Image className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMethod('url')}
              className={cn(
                'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
                uploadMethod === 'url'
                  ? 'bg-gold text-charcoal-dark'
                  : 'bg-charcoal-dark text-cream/70 hover:text-gold'
              )}
            >
              Link URL
            </button>
          </div>

          {/* File Upload */}
          {uploadMethod === 'file' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 border-2 border-dashed border-gold/30 rounded-lg hover:border-gold transition-colors text-center"
              >
                <Upload className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                <p className="text-cream/70 text-sm">Klik untuk upload gambar</p>
                <p className="text-cream/50 text-xs mt-1">JPG, PNG, maks. 5MB</p>
              </button>
            </div>
          )}

          {/* URL Input */}
          {uploadMethod === 'url' && (
            <FormField label="URL Gambar" required>
              <Input
                type="url"
                value={uploadMethod === 'url' ? imageUrl : ''}
                onChange={handleUrlChange}
                placeholder="https://example.com/bukti-transfer.jpg"
                className="text-sm"
              />
            </FormField>
          )}

          {/* Preview */}
          {previewUrl && (
            <div>
              <p className="text-cream/60 text-xs mb-2">Preview:</p>
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-48 object-contain rounded-lg border border-gold/30"
                  onError={() => {
                    setPreviewUrl('')
                    toast.error('URL gambar tidak valid')
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('')
                    setImageUrl('')
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-blue-400 text-xs">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Pastikan bukti pembayaran terlihat jelas (nama pengirim, nominal, tanggal transfer)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmitting}
              disabled={!imageUrl}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default History
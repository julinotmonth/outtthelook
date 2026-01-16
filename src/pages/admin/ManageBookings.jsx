import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import toast from 'react-hot-toast'
import {
  Search,
  Calendar,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  Scissors,
  Wallet,
  Filter,
  FileSpreadsheet,
  Clock,
  Phone,
  Mail,
  Loader2,
  Image,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { StatusBadge } from '../../components/common/Badge'
import { formatCurrency, formatDuration, formatBookingId } from '../../utils/formatters'
import { useHistoryStore } from '../../store/useStore'
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

// Safe date formatting helper
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

const STATUS_FILTERS = [
  { id: 'all', label: 'Semua', color: 'gold' },
  { id: 'pending', label: 'Menunggu', color: 'yellow' },
  { id: 'confirmed', label: 'Dikonfirmasi', color: 'blue' },
  { id: 'completed', label: 'Selesai', color: 'green' },
  { id: 'cancelled', label: 'Dibatalkan', color: 'red' },
]

const ManageBookings = () => {
  const { bookings, loading, fetchAllBookings, updateBookingStatus, verifyPayment } = useHistoryStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [actionModal, setActionModal] = useState({ isOpen: false, type: '', booking: null })
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, booking: null })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Fetch bookings on mount
  useEffect(() => {
    fetchAllBookings()
  }, [fetchAllBookings])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Filter bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const customerName = booking.customer?.name || booking.customer_name || ''
      const barberName = booking.barber?.name || ''
      const bookingDate = booking.date || booking.booking_date || ''
      const matchesSearch =
        formatBookingId(booking.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
        customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        barberName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
      const matchesDate = !dateFilter || bookingDate === dateFilter
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [bookings, searchQuery, statusFilter, dateFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Export to CSV
  const handleExport = () => {
    if (filteredBookings.length === 0) {
      toast.error('Tidak ada data untuk diexport')
      return
    }

    const headers = ['ID', 'Pelanggan', 'Email', 'Telepon', 'Layanan', 'Barber', 'Tanggal', 'Waktu', 'Total', 'Status', 'Metode Pembayaran']
    
    const csvData = filteredBookings.map(booking => [
      formatBookingId(booking.id),
      booking.customer?.name || booking.customer_name || '-',
      booking.customer?.email || booking.customer_email || '-',
      booking.customer?.phone || booking.customer_phone || '-',
      (booking.services || []).map(s => s.name).join('; ') || '-',
      booking.barber?.name || '-',
      formatSafeDate(booking.date || booking.booking_date, 'dd/MM/yyyy'),
      booking.time || booking.booking_time || '-',
      booking.totalPrice || booking.total_price || 0,
      booking.status,
      booking.paymentMethod?.name || booking.payment_method || '-'
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`${filteredBookings.length} booking berhasil diexport`)
  }

  // Update booking status
  const updateStatus = async (bookingId, newStatus) => {
    setIsProcessing(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      updateBookingStatus(bookingId, newStatus)

      const statusLabels = {
        confirmed: 'dikonfirmasi',
        completed: 'diselesaikan',
        cancelled: 'dibatalkan',
      }

      toast.success(`Booking berhasil ${statusLabels[newStatus]}`)
      setActionModal({ isOpen: false, type: '', booking: null })
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle payment verification
  const handleVerifyPayment = async (bookingId, action) => {
    setIsProcessing(true)
    console.log('Verifying payment:', bookingId, action)

    try {
      const result = await verifyPayment(bookingId, action)
      console.log('Verify result:', result)
      
      if (result && result.success) {
        toast.success(action === 'approve' ? 'Pembayaran berhasil diverifikasi' : 'Pembayaran ditolak')
        await fetchAllBookings() // Refresh data
      } else {
        toast.error(result?.message || 'Terjadi kesalahan saat verifikasi')
        console.error('Verify failed:', result)
      }
    } catch (error) {
      console.error('Verify payment error:', error)
      toast.error('Terjadi kesalahan: ' + (error.message || 'Unknown error'))
    } finally {
      setIsProcessing(false)
    }
  }

  // Get payment pending count
  const getPaymentPendingCount = () => {
    return bookings.filter(b => b.payment_status === 'waiting_verification').length
  }

  // Get status counts
  const getStatusCount = (status) => {
    if (status === 'all') return bookings.length
    return bookings.filter(b => b.status === status).length
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setDateFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl sm:text-2xl md:text-3xl font-bold text-cream">Kelola Booking</h1>
            <p className="text-cream/60 text-xs sm:text-sm md:text-base">Kelola dan konfirmasi booking pelanggan</p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="w-full sm:w-auto text-sm"
            disabled={filteredBookings.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {STATUS_FILTERS.slice(1).map((status) => {
          const count = getStatusCount(status.id)
          return (
            <Card
              key={status.id}
              className={cn(
                'cursor-pointer transition-all duration-300',
                statusFilter === status.id ? 'border-gold ring-1 ring-gold/30' : 'hover:border-gold/40'
              )}
              onClick={() => {
                setStatusFilter(status.id)
                setCurrentPage(1)
              }}
            >
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <p className="text-cream/60 text-xs sm:text-sm">{status.label}</p>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    status.color === 'yellow' && 'bg-yellow-500',
                    status.color === 'blue' && 'bg-blue-500',
                    status.color === 'green' && 'bg-green-500',
                    status.color === 'red' && 'bg-red-500',
                  )} />
                </div>
                <p className="font-display text-2xl sm:text-3xl text-cream mt-1">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Search Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40" />
                <Input
                  type="text"
                  placeholder="Cari ID, nama, atau barber..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 text-sm h-10"
                />
              </div>
              <Button
                variant={showFilters ? 'primary' : 'outline'}
                size="sm"
                className="md:hidden px-3"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Filter Row - Always visible on md+, toggle on mobile */}
            <div className={cn(
              'flex flex-col sm:flex-row gap-3',
              showFilters ? 'block' : 'hidden md:flex'
            )}>
              {/* Date Filter */}
              <div className="relative w-full sm:w-44">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/40 pointer-events-none" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 text-sm h-10 w-full"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex-1 overflow-x-auto">
                <div className="flex gap-2 pb-1">
                  {STATUS_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => {
                        setStatusFilter(filter.id)
                        setCurrentPage(1)
                      }}
                      className={cn(
                        'px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                        statusFilter === filter.id
                          ? 'bg-gold text-charcoal-dark'
                          : 'bg-charcoal-dark border border-gold/30 text-cream/70 hover:border-gold hover:text-cream'
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              {(searchQuery || statusFilter !== 'all' || dateFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs whitespace-nowrap"
                >
                  <X className="w-3 h-3 mr-1" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="py-16 sm:py-20 text-center px-4">
              <Calendar className="w-16 h-16 text-cream/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-cream mb-2">Belum Ada Booking</h3>
              <p className="text-cream/50 text-sm">Data booking dari pelanggan akan muncul di sini</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 sm:py-20 text-center px-4">
              <Search className="w-16 h-16 text-cream/20 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-cream mb-2">Tidak Ditemukan</h3>
              <p className="text-cream/50 text-sm mb-4">Tidak ada booking yang sesuai dengan filter</p>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden">
                {paginatedBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      'p-4 border-b border-gold/10 last:border-b-0',
                      'active:bg-gold/5'
                    )}
                  >
                    {/* Top Row: ID & Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-gold font-mono text-sm font-medium">
                        {formatBookingId(booking.id)}
                      </span>
                      <StatusBadge status={booking.status} />
                    </div>

                    {/* Customer Name */}
                    <h3 className="text-cream font-medium text-base mb-2">
                      {booking.customer?.name || booking.customer_name || 'Tanpa Nama'}
                    </h3>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div className="flex items-center gap-2 text-cream/60">
                        <Scissors className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{(booking.services || []).map(s => s.name).join(', ') || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cream/60">
                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{booking.barber?.name || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cream/60">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatSafeDate(booking.date || booking.booking_date, 'dd MMM yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-cream/60">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{booking.time || booking.booking_time || '-'}</span>
                      </div>
                    </div>

                    {/* Bottom Row: Price & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gold/10">
                      <span className="text-gold font-display text-lg">
                        {formatCurrency(booking.totalPrice || booking.total_price || 0)}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="p-2.5 text-cream/60 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                          aria-label="Lihat Detail"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setActionModal({ isOpen: true, type: 'confirm', booking })}
                              className="p-2.5 text-green-500/80 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                              aria-label="Konfirmasi"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => setActionModal({ isOpen: true, type: 'cancel', booking })}
                              className="p-2.5 text-red-500/80 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                              aria-label="Batalkan"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => setActionModal({ isOpen: true, type: 'complete', booking })}
                            className="p-2.5 text-blue-500/80 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                            aria-label="Selesaikan"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-gold/20 bg-charcoal-dark/50">
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">ID Booking</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Pelanggan</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Layanan</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Barber</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Jadwal</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Total</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Status</th>
                      <th className="text-left py-4 px-4 text-cream/60 font-medium text-sm">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-b border-gold/10 hover:bg-gold/5 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <span className="text-gold font-mono text-sm">{formatBookingId(booking.id)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="text-cream font-medium text-sm">{booking.customer?.name || booking.customer_name || '-'}</p>
                            <p className="text-cream/50 text-xs">{booking.customer?.phone || booking.customer_phone || '-'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="max-w-[180px]">
                            <p className="text-cream text-sm truncate">
                              {(booking.services || []).map(s => s.name).join(', ') || '-'}
                            </p>
                            <p className="text-cream/50 text-xs">{(booking.services || []).length} layanan</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {booking.barber?.image && (
                              <img
                                src={booking.barber.image}
                                alt={booking.barber?.name}
                                className="w-8 h-8 rounded-full object-cover border border-gold/30"
                              />
                            )}
                            <span className="text-cream text-sm">{booking.barber?.name || '-'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            <p className="text-cream">{formatSafeDate(booking.date || booking.booking_date, 'dd MMM yyyy')}</p>
                            <p className="text-cream/50 text-xs">{booking.time || booking.booking_time || '-'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-gold font-display">{formatCurrency(booking.totalPrice || booking.total_price || 0)}</span>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-2 text-cream/50 hover:text-gold hover:bg-gold/10 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => setActionModal({ isOpen: true, type: 'confirm', booking })}
                                  className="p-2 text-green-500/70 hover:text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                                  title="Konfirmasi"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setActionModal({ isOpen: true, type: 'cancel', booking })}
                                  className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                  title="Batalkan"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => setActionModal({ isOpen: true, type: 'complete', booking })}
                                className="p-2 text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                                title="Selesaikan"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-gold/20">
                  <p className="text-cream/50 text-xs sm:text-sm order-2 sm:order-1">
                    {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredBookings.length)} dari {filteredBookings.length} booking
                  </p>
                  <div className="flex items-center gap-1 order-1 sm:order-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={cn(
                              'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                              currentPage === pageNum
                                ? 'bg-gold text-charcoal-dark'
                                : 'text-cream/60 hover:text-gold hover:bg-gold/10'
                            )}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={`Detail Booking`}
      >
        {selectedBooking && (
          <div className="py-2 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-charcoal-dark rounded-lg">
              <div>
                <span className="text-gold font-mono text-sm">{formatBookingId(selectedBooking.id)}</span>
                <p className="text-cream/50 text-xs mt-0.5">
                  {formatSafeDate(selectedBooking.createdAt || selectedBooking.created_at, 'dd MMM yyyy, HH:mm')}
                </p>
              </div>
              <StatusBadge status={selectedBooking.status} />
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-gold text-xs font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Pelanggan
              </h3>
              <div className="bg-charcoal-dark rounded-lg p-3 space-y-2">
                <p className="text-cream font-medium">{selectedBooking.customer?.name || selectedBooking.customer_name || '-'}</p>
                <div className="flex items-center gap-2 text-cream/60 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  {selectedBooking.customer?.email || selectedBooking.customer_email || '-'}
                </div>
                <div className="flex items-center gap-2 text-cream/60 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {selectedBooking.customer?.phone || selectedBooking.customer_phone || '-'}
                </div>
              </div>
            </div>

            {/* Payment Method & Status */}
            <div>
              <h3 className="text-gold text-xs font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Pembayaran
              </h3>
              <div className="bg-charcoal-dark rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-cream/60 text-sm">Metode</span>
                  <span className="text-cream text-sm">{selectedBooking.paymentMethod?.name || selectedBooking.payment_method || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cream/60 text-sm">Status</span>
                  <PaymentStatusBadge status={selectedBooking.payment_status || 'pending'} />
                </div>
                
                {/* Payment Proof */}
                {selectedBooking.payment_proof && (
                  <div className="pt-2 border-t border-gold/20">
                    <p className="text-cream/60 text-xs mb-2">Bukti Pembayaran:</p>
                    <div className="relative group">
                      <img
                        src={selectedBooking.payment_proof}
                        alt="Bukti Pembayaran"
                        className="w-full rounded-lg border border-gold/30 cursor-pointer hover:border-gold transition-colors"
                        onClick={() => window.open(selectedBooking.payment_proof, '_blank')}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <Eye className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    {/* Verification Buttons */}
                    {selectedBooking.payment_status === 'waiting_verification' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          isLoading={isProcessing}
                          onClick={async () => {
                            if (window.confirm('Verifikasi pembayaran ini? Booking akan otomatis dikonfirmasi.')) {
                              await handleVerifyPayment(selectedBooking.id, 'approve')
                              setSelectedBooking(null)
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Verifikasi
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1 text-red-400 hover:bg-red-500/10 border border-red-500/30"
                          isLoading={isProcessing}
                          onClick={async () => {
                            if (window.confirm('Tolak bukti pembayaran ini? User harus upload ulang.')) {
                              await handleVerifyPayment(selectedBooking.id, 'reject')
                              setSelectedBooking(null)
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* No payment proof yet */}
                {!selectedBooking.payment_proof && selectedBooking.payment_method !== 'cash' && selectedBooking.payment_status !== 'paid' && (
                  <div className="pt-2 border-t border-gold/20">
                    <div className="flex items-center gap-2 text-cream/50 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Belum ada bukti pembayaran</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-gold text-xs font-medium mb-2 flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Layanan
              </h3>
              <div className="bg-charcoal-dark rounded-lg p-3 space-y-2">
                {(selectedBooking.services || []).map((service, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-cream">{service.name}</span>
                    <span className="text-cream/70">{formatCurrency(service.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Barber & Schedule */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-gold text-xs font-medium mb-2">Barber</h3>
                <div className="bg-charcoal-dark rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    {selectedBooking.barber?.image && (
                      <img
                        src={selectedBooking.barber.image}
                        alt={selectedBooking.barber?.name}
                        className="w-8 h-8 rounded-full object-cover border border-gold/30"
                      />
                    )}
                    <span className="text-cream text-sm">{selectedBooking.barber?.name || '-'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-gold text-xs font-medium mb-2">Jadwal</h3>
                <div className="bg-charcoal-dark rounded-lg p-3">
                  <p className="text-cream text-sm">
                    {formatSafeDate(selectedBooking.date || selectedBooking.booking_date, 'dd MMM yyyy')}
                  </p>
                  <p className="text-cream/60 text-xs">{selectedBooking.time || selectedBooking.booking_time || '-'}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(selectedBooking.notes || selectedBooking.customer?.notes) && (
              <div>
                <h3 className="text-gold text-xs font-medium mb-2">Catatan</h3>
                <p className="text-cream/70 bg-charcoal-dark rounded-lg p-3 text-sm">
                  {selectedBooking.notes || selectedBooking.customer?.notes}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between p-3 bg-gold/10 rounded-lg border border-gold/30">
              <div>
                <p className="text-cream/60 text-xs">Total Pembayaran</p>
                <p className="font-display text-2xl text-gold">
                  {formatCurrency(selectedBooking.totalPrice || selectedBooking.total_price || 0)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-cream/60 text-xs">Durasi</p>
                <p className="text-cream font-medium">{formatDuration(selectedBooking.totalDuration || selectedBooking.total_duration || 0)}</p>
              </div>
            </div>

            {/* Actions */}
            {selectedBooking.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={() => {
                    setSelectedBooking(null)
                    setActionModal({ isOpen: true, type: 'confirm', booking: selectedBooking })
                  }}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Konfirmasi
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-400 hover:bg-red-500/10 border border-red-500/30"
                  onClick={() => {
                    setSelectedBooking(null)
                    setActionModal({ isOpen: true, type: 'cancel', booking: selectedBooking })
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Batalkan
                </Button>
              </div>
            )}
            
            {selectedBooking.status === 'confirmed' && (
              <Button
                className="w-full"
                size="sm"
                onClick={() => {
                  setSelectedBooking(null)
                  setActionModal({ isOpen: true, type: 'complete', booking: selectedBooking })
                }}
              >
                <Check className="w-4 h-4 mr-2" />
                Tandai Selesai
              </Button>
            )}
          </div>
        )}
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={() => setActionModal({ isOpen: false, type: '', booking: null })}
        title={
          actionModal.type === 'confirm' ? 'Konfirmasi Booking' :
          actionModal.type === 'complete' ? 'Selesaikan Booking' :
          'Batalkan Booking'
        }
      >
        <div className="py-4">
          <p className="text-cream/70 text-sm">
            {actionModal.type === 'confirm' && 'Apakah Anda yakin ingin mengkonfirmasi booking ini?'}
            {actionModal.type === 'complete' && 'Apakah Anda yakin ingin menyelesaikan booking ini?'}
            {actionModal.type === 'cancel' && 'Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.'}
          </p>
          {actionModal.booking && (
            <div className="mt-4 p-3 bg-charcoal-dark rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gold font-mono text-sm">{formatBookingId(actionModal.booking.id)}</span>
                <StatusBadge status={actionModal.booking.status} />
              </div>
              <p className="text-cream font-medium">{actionModal.booking.customer?.name || actionModal.booking.customer_name || '-'}</p>
              <p className="text-cream/60 text-sm">
                {formatSafeDate(actionModal.booking?.date || actionModal.booking?.booking_date, 'dd MMM yyyy')} • {actionModal.booking.time || actionModal.booking.booking_time || '-'}
              </p>
              <p className="text-gold font-display mt-2">{formatCurrency(actionModal.booking.totalPrice || actionModal.booking.total_price || 0)}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setActionModal({ isOpen: false, type: '', booking: null })}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={() => {
              const newStatus =
                actionModal.type === 'confirm' ? 'confirmed' :
                actionModal.type === 'complete' ? 'completed' : 'cancelled'
              updateStatus(actionModal.booking.id, newStatus)
            }}
            isLoading={isProcessing}
            className={cn(
              actionModal.type === 'cancel' && 'bg-red-500 hover:bg-red-600',
              actionModal.type === 'complete' && 'bg-blue-500 hover:bg-blue-600'
            )}
          >
            {actionModal.type === 'confirm' && 'Konfirmasi'}
            {actionModal.type === 'complete' && 'Selesaikan'}
            {actionModal.type === 'cancel' && 'Batalkan'}
          </Button>
        </DialogFooter>
      </Modal>

      {/* Payment Verification Modal */}
      <Modal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, booking: null, action: null })}
        title={paymentModal.action === 'approve' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}
      >
        <div className="py-4">
          <p className="text-cream/70 text-sm">
            {paymentModal.action === 'approve' 
              ? 'Apakah Anda yakin ingin memverifikasi pembayaran ini? Booking akan otomatis dikonfirmasi.'
              : 'Apakah Anda yakin ingin menolak bukti pembayaran ini? Pelanggan perlu mengupload ulang bukti pembayaran.'}
          </p>
          
          {paymentModal.booking && (
            <div className="mt-4 space-y-3">
              {/* Booking Info */}
              <div className="p-3 bg-charcoal-dark rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gold font-mono text-sm">{formatBookingId(paymentModal.booking.id)}</span>
                  <PaymentStatusBadge status={paymentModal.booking.payment_status} />
                </div>
                <p className="text-cream font-medium">{paymentModal.booking.customer?.name || paymentModal.booking.customer_name || '-'}</p>
                <p className="text-gold font-display mt-2">{formatCurrency(paymentModal.booking.totalPrice || paymentModal.booking.total_price || 0)}</p>
              </div>
              
              {/* Payment Proof Preview */}
              {paymentModal.booking.payment_proof && (
                <div>
                  <p className="text-cream/60 text-xs mb-2">Bukti Pembayaran:</p>
                  <img
                    src={paymentModal.booking.payment_proof}
                    alt="Bukti Pembayaran"
                    className="w-full max-h-64 object-contain rounded-lg border border-gold/30 cursor-pointer"
                    onClick={() => window.open(paymentModal.booking.payment_proof, '_blank')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setPaymentModal({ isOpen: false, booking: null, action: null })}
            disabled={isProcessing}
          >
            Batal
          </Button>
          <Button
            size="sm"
            onClick={() => handleVerifyPayment(paymentModal.booking.id, paymentModal.action)}
            isLoading={isProcessing}
            className={cn(
              paymentModal.action === 'approve' && 'bg-green-600 hover:bg-green-700',
              paymentModal.action === 'reject' && 'bg-red-500 hover:bg-red-600'
            )}
          >
            {paymentModal.action === 'approve' ? 'Verifikasi Pembayaran' : 'Tolak Pembayaran'}
          </Button>
        </DialogFooter>
      </Modal>
    </div>
  )
}

export default ManageBookings
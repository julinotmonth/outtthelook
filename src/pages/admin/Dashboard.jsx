import { useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format, subDays } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card'
import { StatusBadge } from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { formatCurrency, formatBookingId } from '../../utils/formatters'
import { useHistoryStore } from '../../store/useStore'

// Safe date formatting helper
const formatSafeDate = (dateStr, formatStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return format(date, formatStr, { locale: idLocale })
  } catch (e) {
    return '-'
  }
}

const Dashboard = () => {
  const { bookings, loading, fetchAllBookings, updateBookingStatus } = useHistoryStore()

  // Fetch bookings on mount
  useEffect(() => {
    fetchAllBookings()
  }, [fetchAllBookings])

  // Calculate stats from real booking data
  const stats = useMemo(() => {
    const today = new Date()
    const todayStr = format(today, 'yyyy-MM-dd')
    
    const todayBookings = bookings.filter(b => b.booking_date === todayStr || b.date === todayStr)
    const pendingBookings = bookings.filter(b => b.status === 'pending')
    const completedBookings = bookings.filter(b => b.status === 'completed')
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || b.totalPrice || 0), 0)

    return [
      { 
        title: 'Booking Hari Ini', 
        value: todayBookings.length, 
        change: '+15%', 
        trend: 'up',
        icon: Calendar,
        color: 'gold' 
      },
      { 
        title: 'Menunggu Konfirmasi', 
        value: pendingBookings.length, 
        change: pendingBookings.length > 0 ? 'Perlu tindakan' : 'Semua selesai', 
        trend: pendingBookings.length > 0 ? 'down' : 'up',
        icon: Clock,
        color: 'yellow' 
      },
      { 
        title: 'Total Pendapatan', 
        value: formatCurrency(totalRevenue), 
        change: '+25%', 
        trend: 'up',
        icon: DollarSign,
        color: 'green' 
      },
      { 
        title: 'Total Booking', 
        value: bookings.length, 
        change: `${completedBookings.length} selesai`, 
        trend: 'up',
        icon: Users,
        color: 'blue' 
      },
    ]
  }, [bookings])

  // Calculate chart data from real bookings (last 7 days)
  const chartData = useMemo(() => {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayName = days[date.getDay()]
      
      const dayBookings = bookings.filter(b => b.date === dateStr)
      const dayRevenue = dayBookings.reduce((sum, b) => sum + b.totalPrice, 0)
      
      data.push({
        name: dayName,
        bookings: dayBookings.length,
        revenue: dayRevenue
      })
    }
    
    return data
  }, [bookings])

  // Get recent bookings (latest 5)
  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [bookings])

  // Calculate top services
  const topServices = useMemo(() => {
    const serviceStats = {}
    
    bookings.forEach(booking => {
      booking.services.forEach(service => {
        if (!serviceStats[service.name]) {
          serviceStats[service.name] = { name: service.name, bookings: 0, revenue: 0 }
        }
        serviceStats[service.name].bookings += 1
        serviceStats[service.name].revenue += service.price
      })
    })
    
    return Object.values(serviceStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4)
  }, [bookings])

  // Handle quick actions
  const handleConfirmBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'confirmed')
  }

  const handleCompleteBooking = (bookingId) => {
    updateBookingStatus(bookingId, 'completed')
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-cream">Dashboard</h1>
          <p className="text-cream/60 text-sm sm:text-base">Selamat datang kembali! Berikut ringkasan hari ini.</p>
        </div>
        <Link to="/admin/bookings">
          <Button className="w-full sm:w-auto">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="sm:inline">Lihat Jadwal</span>
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-gold/40 transition-colors h-full">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-2 sm:p-3 rounded-lg bg-${stat.color}-500/10`}>
                    <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 text-${stat.color === 'gold' ? 'gold' : stat.color + '-500'}`} />
                  </div>
                  <span className={`hidden sm:flex items-center text-xs sm:text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {stat.change}
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    )}
                  </span>
                </div>
                <div className="mt-2 sm:mt-4">
                  <h3 className="text-cream/60 text-xs sm:text-sm line-clamp-1">{stat.title}</h3>
                  <p className="font-display text-lg sm:text-2xl text-cream mt-1 truncate">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Popular Services Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Layanan Terpopuler</CardTitle>
              <button className="p-2 text-cream/50 hover:text-gold transition-colors">
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              {topServices.length === 0 ? (
                <div className="h-[200px] sm:h-[300px] flex flex-col items-center justify-center">
                  <TrendingUp className="w-12 h-12 text-cream/20 mb-3" />
                  <p className="text-cream/50 text-sm">Belum ada data layanan</p>
                  <p className="text-cream/30 text-xs">Data akan muncul setelah ada booking</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200} className="sm:!h-[300px]">
                  <BarChart 
                    data={topServices} 
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number" 
                      stroke="#888" 
                      fontSize={10} 
                      tickFormatter={(value) => value}
                      axisLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      stroke="#888" 
                      fontSize={10} 
                      width={100}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a1a', 
                        border: '1px solid #D4AF37',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value, name) => {
                        if (name === 'bookings') return [value, 'Total Booking']
                        return [formatCurrency(value), 'Pendapatan']
                      }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="#D4AF37" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Pendapatan 7 Hari</CardTitle>
              <button className="p-2 text-cream/50 hover:text-gold transition-colors">
                <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <ResponsiveContainer width="100%" height={200} className="sm:!h-[300px]">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#888" fontSize={10} />
                  <YAxis stroke="#888" fontSize={10} width={35} tickFormatter={(value) => value > 0 ? `${value / 1000}k` : '0'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1a1a1a', 
                      border: '1px solid #D4AF37',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                  />
                  <Bar dataKey="revenue" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Booking Terbaru</CardTitle>
              <Link to="/admin/bookings">
                <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                  Lihat Semua
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentBookings.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-cream/20 mx-auto mb-3" />
                  <p className="text-cream/50 text-sm">Belum ada booking</p>
                  <p className="text-cream/30 text-xs">Booking baru akan muncul di sini</p>
                </div>
              ) : (
                <>
                  {/* Mobile Cards */}
                  <div className="sm:hidden space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="p-3 bg-charcoal-dark rounded-lg border border-gold/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gold font-medium text-sm">{formatBookingId(booking.id)}</span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-cream text-sm font-medium">{booking.customer?.name || booking.customer_name || '-'}</p>
                        <p className="text-cream/60 text-xs mt-1">{(booking.services || []).map(s => s.name).join(', ') || '-'}</p>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold/10">
                          <span className="text-cream/50 text-xs">
                            {formatSafeDate(booking.date || booking.booking_date, 'dd MMM')} • {booking.time || booking.booking_time || '-'}
                          </span>
                          <div className="flex items-center gap-1">
                            {booking.status === 'pending' && (
                              <button 
                                onClick={() => handleConfirmBooking(booking.id)}
                                className="p-1.5 text-green-500 hover:bg-green-500/10 rounded"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                onClick={() => handleCompleteBooking(booking.id)}
                                className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <Link to="/admin/bookings">
                              <button className="p-1.5 text-cream/50 hover:text-gold rounded">
                                <Eye className="w-4 h-4" />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gold/20">
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">ID</th>
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">Pelanggan</th>
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">Layanan</th>
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">Jadwal</th>
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">Status</th>
                          <th className="text-left py-3 px-4 text-cream/60 font-medium text-sm">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr key={booking.id} className="border-b border-gold/10 hover:bg-gold/5 transition-colors">
                            <td className="py-3 px-4">
                              <span className="text-gold font-medium text-sm">{formatBookingId(booking.id)}</span>
                            </td>
                            <td className="py-3 px-4 text-cream text-sm">{booking.customer?.name || booking.customer_name || '-'}</td>
                            <td className="py-3 px-4 text-cream/70 text-sm">
                              {(booking.services || []).map(s => s.name).join(', ') || '-'}
                            </td>
                            <td className="py-3 px-4 text-cream/70 text-sm">
                              {formatSafeDate(booking.date || booking.booking_date, 'dd MMM')} • {booking.time || booking.booking_time || '-'}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={booking.status} />
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {booking.status === 'pending' && (
                                  <button 
                                    onClick={() => handleConfirmBooking(booking.id)}
                                    className="p-1.5 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {booking.status === 'confirmed' && (
                                  <button 
                                    onClick={() => handleCompleteBooking(booking.id)}
                                    className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <Link to="/admin/bookings">
                                  <button className="p-1.5 text-cream/50 hover:text-gold hover:bg-gold/10 rounded transition-colors">
                                    <Eye className="w-4 h-4" />
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="h-full">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-sm sm:text-lg">Layanan Terpopuler</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {topServices.length === 0 ? (
                <div className="py-8 text-center">
                  <TrendingUp className="w-10 h-10 sm:w-12 sm:h-12 text-cream/20 mx-auto mb-3" />
                  <p className="text-cream/50 text-sm">Belum ada data</p>
                  <p className="text-cream/30 text-xs">Statistik layanan akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {topServices.map((service, index) => (
                    <div key={service.name} className="flex items-center gap-3 sm:gap-4">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-display text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-cream font-medium text-xs sm:text-sm truncate">{service.name}</h4>
                        <p className="text-cream/50 text-xs">{service.bookings} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gold font-display text-xs sm:text-sm">
                          {formatCurrency(service.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
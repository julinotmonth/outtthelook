import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, startOfDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { DayPicker } from 'react-day-picker'
import toast from 'react-hot-toast'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar,
  User,
  Scissors,
  CreditCard,
  CheckCircle,
  Star,
  Wallet,
  Building2,
  QrCode,
  Copy,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Card, CardContent } from '../../components/common/Card'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { formatCurrency, formatDuration } from '../../utils/formatters'
import { bookingCustomerSchema } from '../../utils/validators'
import { TIME_SLOTS } from '../../utils/constants'
import { useHistoryStore, useTeamStore, useServicesStore, useNotificationStore, useAuthStore } from '../../store/useStore'
import { cn } from '../../lib/utils'
import 'react-day-picker/dist/style.css'

const PAYMENT_METHODS = [
  {
    id: 'qris',
    name: 'QRIS',
    description: 'Bayar dengan scan QR code (GoPay, OVO, DANA, dll)',
    icon: QrCode,
    type: 'qris',
  },
  {
    id: 'bca',
    name: 'Bank BCA',
    description: 'Transfer ke rekening BCA',
    icon: Building2,
    accountNumber: '1234567890',
    accountName: 'PT Outlook Barbershop',
    type: 'bank',
  },
  {
    id: 'bni',
    name: 'Bank BNI',
    description: 'Transfer ke rekening BNI',
    icon: Building2,
    accountNumber: '0987654321',
    accountName: 'PT Outlook Barbershop',
    type: 'bank',
  },
  {
    id: 'mandiri',
    name: 'Bank Mandiri',
    description: 'Transfer ke rekening Mandiri',
    icon: Building2,
    accountNumber: '1122334455',
    accountName: 'PT Outlook Barbershop',
    type: 'bank',
  },
  {
    id: 'cash',
    name: 'Bayar di Tempat',
    description: 'Bayar tunai saat datang',
    icon: Wallet,
    type: 'cash',
  },
]

const STEPS = [
  { id: 1, title: 'Layanan', icon: Scissors },
  { id: 2, title: 'Barber', icon: User },
  { id: 3, title: 'Jadwal', icon: Calendar },
  { id: 4, title: 'Data Diri', icon: CreditCard },
  { id: 5, title: 'Pembayaran', icon: Wallet },
  { id: 6, title: 'Konfirmasi', icon: CheckCircle },
]

const Booking = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { bookings, addBooking, createBooking } = useHistoryStore()
  const { barbers: teamBarbers, loading: barbersLoading, fetchBarbers, getAvailableBarbers } = useTeamStore()
  const { addNotification } = useNotificationStore()
  const { isAuthenticated, user } = useAuthStore()
  
  // Get services from store
  const { services, loading: servicesLoading, fetchServices, getActiveServices } = useServicesStore()
  
  // Fetch data on mount
  useEffect(() => {
    fetchServices()
    fetchBarbers()
  }, [fetchServices, fetchBarbers])
  
  // Get available barbers from store
  const availableBarbers = getAvailableBarbers()
  
  // Get active services from store
  const activeServices = getActiveServices()
  
  // Booking state
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedServices, setSelectedServices] = useState([])
  const [selectedBarber, setSelectedBarber] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingData, setBookingData] = useState(null)

  // Form for customer info - pre-fill with user data if authenticated
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(bookingCustomerSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      notes: '',
    },
  })

  // Update form when user data is available
  useEffect(() => {
    if (user) {
      setValue('name', user.name || '')
      setValue('email', user.email || '')
      setValue('phone', user.phone || '')
    }
  }, [user, setValue])

  // Pre-select service/barber from URL params
  useEffect(() => {
    const serviceId = searchParams.get('service')
    const barberId = searchParams.get('barber')

    if (serviceId) {
      const service = activeServices.find(s => s.id === parseInt(serviceId))
      if (service) setSelectedServices([service])
    }

    if (barberId) {
      const barber = availableBarbers.find(b => b.id === parseInt(barberId))
      if (barber) {
        setSelectedBarber(barber)
        // Tetap di step 1 agar user bisa pilih layanan dulu
        // Barber sudah ter-pre-select, jadi saat user ke step 2, barber sudah terpilih
      }
    }
  }, [searchParams, availableBarbers, activeServices])

  // Calculate totals
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

  // Navigation
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  // Can proceed validation
  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedServices.length > 0
      case 2: return selectedBarber !== null
      case 3: return selectedDate !== null && selectedTime !== null
      case 4: return true
      case 5: return selectedPayment !== null
      default: return true
    }
  }

  // Toggle service selection
  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const isSelected = prev.some(s => s.id === service.id)
      if (isSelected) {
        return prev.filter(s => s.id !== service.id)
      }
      return [...prev, service]
    })
  }

  // Submit booking
  const onSubmitBooking = async (customerData) => {
    setIsSubmitting(true)
    
    try {
      const bookingPayload = {
        barber_id: selectedBarber.id,
        booking_date: format(selectedDate, 'yyyy-MM-dd'),
        booking_time: selectedTime,
        total_price: totalPrice,
        total_duration: totalDuration,
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        notes: customerData.notes || '',
        payment_method: selectedPayment.id,
        services: selectedServices.map(s => ({
          service_id: s.id,
          service_name: s.name,
          service_price: s.price
        }))
      }

      console.log('Sending booking payload:', bookingPayload)
      
      // Call API to create booking
      const result = await createBooking(bookingPayload)
      
      console.log('Booking result:', result)
      
      if (result && result.success) {
        const newBooking = {
          id: result.data?.id || Date.now(),
          services: selectedServices.map(s => ({ name: s.name, price: s.price })),
          barber: {
            id: selectedBarber.id,
            name: selectedBarber.name,
            image: selectedBarber.image,
          },
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          status: 'pending',
          totalPrice,
          totalDuration,
          customer: customerData,
          paymentMethod: {
            id: selectedPayment.id,
            name: selectedPayment.name,
            type: selectedPayment.type,
          },
          createdAt: new Date().toISOString(),
        }
        
        setBookingData(newBooking)
        setBookingSuccess(true)
        toast.success('Booking berhasil dibuat!')
      } else {
        toast.error(result?.message || 'Gagal membuat booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Gagal membuat booking. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle step 4 form submission
  const handleCustomerFormSubmit = (data) => {
    nextStep()
  }

  // Final confirmation
  const handleFinalSubmit = () => {
    const customerData = getValues()
    onSubmitBooking(customerData)
  }

  if (bookingSuccess && bookingData) {
    return <BookingSuccess bookingData={bookingData} paymentMethod={selectedPayment} />
  }

  // Show login required page if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto text-center"
          >
            {/* Icon */}
            <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
              <LogIn className="w-12 h-12 text-gold" />
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl font-bold text-cream mb-4">
              Login Diperlukan
            </h1>
            <p className="text-cream/60 mb-8">
              Untuk melakukan booking, Anda harus login terlebih dahulu. 
              Jika belum punya akun, silakan daftar terlebih dahulu.
            </p>

            {/* Benefits */}
            <div className="bg-charcoal rounded-lg border border-gold/20 p-6 mb-8 text-left">
              <h3 className="text-gold font-medium mb-4">Keuntungan memiliki akun:</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-cream/70">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>Booking lebih cepat dengan data tersimpan</span>
                </li>
                <li className="flex items-start gap-3 text-cream/70">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>Lihat riwayat booking Anda</span>
                </li>
                <li className="flex items-start gap-3 text-cream/70">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>Berikan rating dan ulasan untuk barber</span>
                </li>
                <li className="flex items-start gap-3 text-cream/70">
                  <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <span>Dapatkan notifikasi pengingat booking</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" state={{ from: { pathname: '/booking' }, message: 'Silakan login untuk melanjutkan booking' }}>
                <Button size="lg" className="w-full sm:w-auto">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Daftar Akun Baru
                </Button>
              </Link>
            </div>

            {/* Back Link */}
            <p className="mt-8 text-cream/50 text-sm">
              <Link to="/" className="text-gold hover:underline">
                ← Kembali ke Beranda
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="section-subtitle">Reservasi</span>
          <h1 className="section-title">
            Book <span className="text-gradient">Appointment</span>
          </h1>
          {user && (
            <p className="text-cream/60 mt-2">
              Halo, <span className="text-gold">{user.name}</span>! Silakan pilih layanan yang Anda inginkan.
            </p>
          )}
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    'flex flex-col items-center',
                    currentStep >= step.id ? 'text-gold' : 'text-cream/30'
                  )}
                >
                  <div
                    className={cn(
                      'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                      currentStep > step.id
                        ? 'bg-gold border-gold text-charcoal-dark'
                        : currentStep === step.id
                        ? 'border-gold text-gold'
                        : 'border-cream/30'
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <step.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'w-8 sm:w-16 h-0.5 mx-1 sm:mx-2 transition-colors duration-300',
                      currentStep > step.id ? 'bg-gold' : 'bg-cream/20'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <StepServices
                key="step1"
                services={activeServices}
                selectedServices={selectedServices}
                toggleService={toggleService}
              />
            )}
            {currentStep === 2 && (
              <StepBarber
                key="step2"
                barbers={availableBarbers}
                selectedBarber={selectedBarber}
                setSelectedBarber={setSelectedBarber}
              />
            )}
            {currentStep === 3 && (
              <StepSchedule
                key="step3"
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                selectedBarber={selectedBarber}
                existingBookings={bookings}
              />
            )}
            {currentStep === 4 && (
              <StepCustomerInfo
                key="step4"
                register={register}
                errors={errors}
                handleSubmit={handleSubmit}
                onSubmit={handleCustomerFormSubmit}
              />
            )}
            {currentStep === 5 && (
              <StepPayment
                key="step5"
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                totalPrice={totalPrice}
              />
            )}
            {currentStep === 6 && (
              <StepConfirmation
                key="step6"
                selectedServices={selectedServices}
                selectedBarber={selectedBarber}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                customerInfo={getValues()}
                selectedPayment={selectedPayment}
                totalPrice={totalPrice}
                totalDuration={totalDuration}
              />
            )}
          </AnimatePresence>

          {/* Summary Sidebar (Desktop) */}
          {currentStep < 6 && selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="fixed right-6 top-32 w-72 hidden xl:block"
            >
              <Card className="border-gold/30">
                <CardContent className="p-4">
                  <h3 className="font-heading text-lg font-bold text-cream mb-4">
                    Ringkasan
                  </h3>
                  <div className="space-y-2 mb-4">
                    {selectedServices.map((service) => (
                      <div key={service.id} className="flex justify-between text-sm">
                        <span className="text-cream/70">{service.name}</span>
                        <span className="text-gold">{formatCurrency(service.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gold/20 pt-3">
                    <div className="flex justify-between font-medium">
                      <span className="text-cream">Total</span>
                      <span className="text-gold font-display text-lg">
                        {formatCurrency(totalPrice)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-cream/50 text-sm mt-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(totalDuration)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mt-8 pt-6 border-t border-gold/20"
          >
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={currentStep === 1 ? 'invisible' : ''}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>

            {/* Mobile Summary */}
            {currentStep < 6 && selectedServices.length > 0 && (
              <div className="xl:hidden text-center">
                <p className="text-gold font-display text-lg">{formatCurrency(totalPrice)}</p>
                <p className="text-cream/50 text-xs">{formatDuration(totalDuration)}</p>
              </div>
            )}

            {currentStep < 6 ? (
              <Button
                onClick={currentStep === 4 ? handleSubmit(handleCustomerFormSubmit) : nextStep}
                disabled={!canProceed()}
              >
                Lanjutkan
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleFinalSubmit} isLoading={isSubmitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Konfirmasi Booking
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Services Selection
const StepServices = ({ services, selectedServices, toggleService }) => {
  const categories = [...new Set(services.map(s => s.category))]

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-6">
        Pilih Layanan
      </h2>
      
      {categories.map((category) => (
        <div key={category} className="mb-6">
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {services
              .filter(s => s.category === category)
              .map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id)
                return (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={cn(
                      'p-4 rounded-lg border text-left transition-all duration-300',
                      isSelected
                        ? 'border-gold bg-gold/10'
                        : 'border-gold/20 hover:border-gold/50'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-cream">{service.name}</h4>
                        <p className="text-cream/50 text-sm mt-1">
                          {formatDuration(service.duration)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-gold font-display">
                          {formatCurrency(service.price)}
                        </span>
                        {isSelected && (
                          <Check className="w-5 h-5 text-gold mt-1 ml-auto" />
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </motion.div>
  )
}

// Step 2: Barber Selection
const StepBarber = ({ barbers, selectedBarber, setSelectedBarber }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-6">
        Pilih Barber
      </h2>
      
      <div className="grid sm:grid-cols-2 gap-4">
        {barbers.map((barber) => {
          const isSelected = selectedBarber?.id === barber.id
          return (
            <button
              key={barber.id}
              onClick={() => setSelectedBarber(barber)}
              className={cn(
                'p-4 rounded-lg border text-left transition-all duration-300 flex items-center gap-4',
                isSelected
                  ? 'border-gold bg-gold/10'
                  : 'border-gold/20 hover:border-gold/50'
              )}
            >
              <img
                src={barber.image}
                alt={barber.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-gold/30"
              />
              <div className="flex-1">
                <h4 className="font-medium text-cream">{barber.name}</h4>
                <p className="text-gold/70 text-sm">{barber.role}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-gold fill-gold" />
                  <span className="text-cream/70 text-sm">{barber.rating}</span>
                </div>
              </div>
              {isSelected && (
                <Check className="w-6 h-6 text-gold shrink-0" />
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// Step 3: Schedule Selection
const StepSchedule = ({ selectedDate, setSelectedDate, selectedTime, setSelectedTime, selectedBarber, existingBookings }) => {
  const disabledDays = { before: startOfDay(new Date()) }

  // Filter time slots based on barber's work schedule
  const getAvailableTimeSlots = () => {
    if (!selectedBarber?.workSchedule) return TIME_SLOTS
    
    const { startTime, endTime } = selectedBarber.workSchedule
    return TIME_SLOTS.filter(time => {
      return time >= startTime && time <= endTime
    })
  }

  // Check if time slot is booked
  const isTimeBooked = (time) => {
    if (!selectedDate || !selectedBarber) return false
    
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
    
    return existingBookings.some(booking => {
      return (
        booking.date === selectedDateStr &&
        booking.time === time &&
        booking.barber.id === selectedBarber.id &&
        (booking.status === 'pending' || booking.status === 'confirmed')
      )
    })
  }

  // Check if time slot is in the past (for today only)
  const isTimePassed = (time) => {
    if (!selectedDate) return false
    
    const now = new Date()
    const today = startOfDay(now)
    const selectedDay = startOfDay(selectedDate)
    
    // Only check for today
    if (selectedDay.getTime() !== today.getTime()) return false
    
    const [hours, minutes] = time.split(':').map(Number)
    const slotTime = new Date()
    slotTime.setHours(hours, minutes, 0, 0)
    
    return slotTime <= now
  }

  const availableTimeSlots = getAvailableTimeSlots()

  // Reset selected time when date changes and the time is no longer available
  React.useEffect(() => {
    if (selectedTime && selectedDate) {
      if (isTimePassed(selectedTime) || isTimeBooked(selectedTime)) {
        setSelectedTime(null)
      }
    }
  }, [selectedDate])

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-6">
        Pilih Jadwal
      </h2>

      {/* Barber Schedule Info */}
      {selectedBarber?.workSchedule && (
        <div className="mb-6 p-3 rounded-lg bg-gold/10 border border-gold/30 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gold" />
          <span className="text-cream text-sm">
            Jam kerja <span className="text-gold font-medium">{selectedBarber.name}</span>: {selectedBarber.workSchedule.startTime} - {selectedBarber.workSchedule.endTime}
          </span>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div>
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Tanggal
          </h3>
          <Card className="p-4">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                setSelectedTime(null) // Reset time when date changes
              }}
              disabled={disabledDays}
              locale={id}
              className="rdp-outlook"
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-4',
                caption: 'flex justify-center pt-1 relative items-center',
                caption_label: 'text-sm font-medium text-cream',
                nav: 'space-x-1 flex items-center',
                nav_button: 'h-7 w-7 bg-transparent p-0 text-cream/50 hover:text-gold',
                nav_button_previous: 'absolute left-1',
                nav_button_next: 'absolute right-1',
                table: 'w-full border-collapse space-y-1',
                head_row: 'flex',
                head_cell: 'text-cream/50 rounded-md w-9 font-normal text-[0.8rem]',
                row: 'flex w-full mt-2',
                cell: 'text-center text-sm p-0 relative',
                day: 'h-9 w-9 p-0 font-normal text-cream hover:bg-gold/20 rounded-md transition-colors',
                day_selected: 'bg-gold text-charcoal-dark hover:bg-gold-light',
                day_today: 'bg-gold/20 text-gold',
                day_outside: 'text-cream/20',
                day_disabled: 'text-cream/20 cursor-not-allowed',
              }}
            />
          </Card>
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Waktu Tersedia
          </h3>
          
          {!selectedDate ? (
            <div className="text-center py-8 text-cream/50">
              <Clock className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Pilih tanggal terlebih dahulu</p>
            </div>
          ) : (
            <>
              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gold/20 border border-gold/50"></div>
                  <span className="text-cream/60">Tersedia</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30"></div>
                  <span className="text-cream/60">Sudah dibooking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-cream/10 border border-cream/20"></div>
                  <span className="text-cream/60">Sudah lewat</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {availableTimeSlots.map((time) => {
                  const isSelected = selectedTime === time
                  const isBooked = isTimeBooked(time)
                  const isPassed = isTimePassed(time)
                  const isUnavailable = isBooked || isPassed
                  
                  return (
                    <button
                      key={time}
                      onClick={() => !isUnavailable && setSelectedTime(time)}
                      disabled={isUnavailable}
                      className={cn(
                        'py-3 px-4 rounded-lg border text-sm font-medium transition-all duration-300 relative',
                        isSelected
                          ? 'border-gold bg-gold text-charcoal-dark'
                          : isBooked
                          ? 'border-red-500/30 bg-red-500/10 text-red-400 cursor-not-allowed'
                          : isPassed
                          ? 'border-cream/10 bg-cream/5 text-cream/30 cursor-not-allowed line-through'
                          : 'border-gold/20 text-cream hover:border-gold/50'
                      )}
                      title={isBooked ? 'Sudah dibooking' : isPassed ? 'Waktu sudah lewat' : 'Tersedia'}
                    >
                      {time}
                      {isBooked && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <X className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
          {availableTimeSlots.length === 0 && selectedDate && (
            <p className="text-cream/50 text-sm text-center py-4">
              Tidak ada jadwal tersedia
            </p>
          )}
        </div>
      </div>

      {selectedDate && selectedTime && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-4 rounded-lg bg-gold/10 border border-gold/30"
        >
          <p className="text-cream">
            <span className="text-gold font-medium">Jadwal terpilih: </span>
            {format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })} pukul {selectedTime}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}

// Step 4: Customer Info
const StepCustomerInfo = ({ register, errors, handleSubmit, onSubmit }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-6">
        Data Diri
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Nama Lengkap" error={errors.name?.message} required>
          <Input
            {...register('name')}
            placeholder="Masukkan nama lengkap"
            error={errors.name}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message} required>
          <Input
            {...register('email')}
            type="email"
            placeholder="Masukkan email"
            error={errors.email}
          />
        </FormField>

        <FormField label="Nomor Telepon" error={errors.phone?.message} required>
          <Input
            {...register('phone')}
            placeholder="08xxxxxxxxxx"
            error={errors.phone}
          />
        </FormField>

        <FormField label="Catatan (Opsional)" error={errors.notes?.message}>
          <Textarea
            {...register('notes')}
            placeholder="Tambahkan catatan khusus untuk barber..."
            rows={3}
          />
        </FormField>
      </form>
    </motion.div>
  )
}

// Step 5: Payment Method
const StepPayment = ({ selectedPayment, setSelectedPayment, totalPrice }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-2">
        Metode Pembayaran
      </h2>
      <p className="text-cream/60 mb-6">Pilih metode pembayaran yang Anda inginkan</p>

      {/* Total Amount */}
      <Card className="border-gold/50 bg-gold/10 mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-cream/70">Total Pembayaran</span>
            <span className="font-display text-2xl text-gold">{formatCurrency(totalPrice)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <div className="space-y-3">
        {/* QRIS Section */}
        <div className="mb-4">
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            E-Wallet / QRIS
          </h3>
          {PAYMENT_METHODS.filter(p => p.type === 'qris').map((payment) => {
            const isSelected = selectedPayment?.id === payment.id
            return (
              <button
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-all duration-300 flex items-center gap-4',
                  isSelected
                    ? 'border-gold bg-gold/10'
                    : 'border-gold/20 hover:border-gold/50'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-gold/20' : 'bg-charcoal-dark'
                )}>
                  <payment.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-cream">{payment.name}</h4>
                  <p className="text-cream/50 text-sm">{payment.description}</p>
                </div>
                {isSelected && (
                  <Check className="w-6 h-6 text-gold shrink-0" />
                )}
              </button>
            )
          })}
        </div>

        {/* Bank Transfer Section */}
        <div className="mb-4">
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Transfer Bank
          </h3>
          <div className="space-y-3">
            {PAYMENT_METHODS.filter(p => p.type === 'bank').map((payment) => {
              const isSelected = selectedPayment?.id === payment.id
              return (
                <button
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className={cn(
                    'w-full p-4 rounded-lg border text-left transition-all duration-300 flex items-center gap-4',
                    isSelected
                      ? 'border-gold bg-gold/10'
                      : 'border-gold/20 hover:border-gold/50'
                  )}
                >
                  <div className={cn(
                    'w-12 h-12 rounded-lg flex items-center justify-center',
                    isSelected ? 'bg-gold/20' : 'bg-charcoal-dark'
                  )}>
                    <payment.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-cream">{payment.name}</h4>
                    <p className="text-cream/50 text-sm">{payment.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="w-6 h-6 text-gold shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cash Section */}
        <div>
          <h3 className="text-gold text-sm font-medium uppercase tracking-wider mb-3">
            Bayar Langsung
          </h3>
          {PAYMENT_METHODS.filter(p => p.type === 'cash').map((payment) => {
            const isSelected = selectedPayment?.id === payment.id
            return (
              <button
                key={payment.id}
                onClick={() => setSelectedPayment(payment)}
                className={cn(
                  'w-full p-4 rounded-lg border text-left transition-all duration-300 flex items-center gap-4',
                  isSelected
                    ? 'border-gold bg-gold/10'
                    : 'border-gold/20 hover:border-gold/50'
                )}
              >
                <div className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  isSelected ? 'bg-gold/20' : 'bg-charcoal-dark'
                )}>
                  <payment.icon className="w-6 h-6 text-gold" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-cream">{payment.name}</h4>
                  <p className="text-cream/50 text-sm">{payment.description}</p>
                </div>
                {isSelected && (
                  <Check className="w-6 h-6 text-gold shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

// Step 6: Confirmation
const StepConfirmation = ({
  selectedServices,
  selectedBarber,
  selectedDate,
  selectedTime,
  customerInfo,
  selectedPayment,
  totalPrice,
  totalDuration,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="font-heading text-2xl font-bold text-cream mb-6">
        Konfirmasi Booking
      </h2>
      
      <div className="space-y-4">
        {/* Services */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gold mb-3 flex items-center gap-2">
              <Scissors className="w-5 h-5" />
              Layanan
            </h3>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between">
                  <span className="text-cream">{service.name}</span>
                  <span className="text-cream/70">{formatCurrency(service.price)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Barber */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gold mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              Barber
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={selectedBarber?.image}
                alt={selectedBarber?.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-gold/30"
              />
              <div>
                <p className="text-cream font-medium">{selectedBarber?.name}</p>
                <p className="text-cream/60 text-sm">{selectedBarber?.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Jadwal
            </h3>
            <p className="text-cream">
              {selectedDate && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: id })}
            </p>
            <p className="text-cream/60">Pukul {selectedTime}</p>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gold mb-3 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Data Diri
            </h3>
            <div className="space-y-1 text-sm">
              <p className="text-cream"><span className="text-cream/60">Nama:</span> {customerInfo.name}</p>
              <p className="text-cream"><span className="text-cream/60">Email:</span> {customerInfo.email}</p>
              <p className="text-cream"><span className="text-cream/60">Telepon:</span> {customerInfo.phone}</p>
              {customerInfo.notes && (
                <p className="text-cream"><span className="text-cream/60">Catatan:</span> {customerInfo.notes}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-gold mb-3 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Metode Pembayaran
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
                {selectedPayment && <selectedPayment.icon className="w-5 h-5 text-gold" />}
              </div>
              <span className="text-cream">{selectedPayment?.name}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="border-gold/50 bg-gold/10">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cream/70 text-sm">Total Pembayaran</p>
                <p className="font-display text-3xl text-gold">{formatCurrency(totalPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-cream/70 text-sm">Estimasi Durasi</p>
                <p className="text-cream font-medium">{formatDuration(totalDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}

// Booking Success Component
const BookingSuccess = ({ bookingData, paymentMethod }) => {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Berhasil disalin!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-green-500" />
          </motion.div>

          <h1 className="font-heading text-3xl font-bold text-cream mb-4">
            Booking Berhasil!
          </h1>
          
          <p className="text-cream/70">
            Terima kasih! Booking Anda telah berhasil dibuat.
          </p>
        </motion.div>

        {/* Booking ID */}
        <Card className="mb-6">
          <CardContent className="p-6 text-center">
            <p className="text-cream/60 text-sm mb-1">Booking ID</p>
            <p className="font-display text-3xl text-gold">#{bookingData.id}</p>
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        {paymentMethod.type !== 'cash' && (
          <Card className="mb-6 border-gold/50">
            <CardContent className="p-6">
              <h3 className="font-heading text-xl font-bold text-cream mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gold" />
                Instruksi Pembayaran
              </h3>

              {paymentMethod.type === 'qris' && (
                <div className="text-center">
                  <p className="text-cream/70 mb-4">Scan QR Code di bawah ini untuk membayar</p>
                  <div className="bg-white p-4 rounded-lg inline-block mb-4">
                    {/* Placeholder QR Code */}
                    <div className="w-48 h-48 bg-charcoal-dark flex items-center justify-center rounded">
                      <QrCode className="w-32 h-32 text-gold" />
                    </div>
                  </div>
                  <p className="text-gold font-display text-2xl mb-2">
                    {formatCurrency(bookingData.totalPrice)}
                  </p>
                  <p className="text-cream/50 text-sm">
                    QR Code berlaku selama 24 jam
                  </p>
                </div>
              )}

              {paymentMethod.type === 'bank' && (
                <div>
                  <div className="bg-charcoal-dark rounded-lg p-4 mb-4">
                    <p className="text-cream/60 text-sm mb-1">Bank</p>
                    <p className="text-cream font-medium text-lg">{paymentMethod.name}</p>
                  </div>

                  <div className="bg-charcoal-dark rounded-lg p-4 mb-4">
                    <p className="text-cream/60 text-sm mb-1">Nomor Rekening</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gold font-display text-xl">{paymentMethod.accountNumber}</p>
                      <button
                        onClick={() => copyToClipboard(paymentMethod.accountNumber)}
                        className="p-2 text-cream/50 hover:text-gold transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-charcoal-dark rounded-lg p-4 mb-4">
                    <p className="text-cream/60 text-sm mb-1">Atas Nama</p>
                    <p className="text-cream font-medium">{paymentMethod.accountName}</p>
                  </div>

                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-4">
                    <p className="text-cream/60 text-sm mb-1">Total Transfer</p>
                    <div className="flex items-center justify-between">
                      <p className="text-gold font-display text-2xl">{formatCurrency(bookingData.totalPrice)}</p>
                      <button
                        onClick={() => copyToClipboard(bookingData.totalPrice.toString())}
                        className="p-2 text-cream/50 hover:text-gold transition-colors"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-cream/50 text-sm mt-4 text-center">
                    Lakukan pembayaran dalam waktu 24 jam untuk mengkonfirmasi booking Anda
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Booking Summary */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-bold text-cream mb-4">Ringkasan Booking</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-cream/60">Tanggal</span>
                <span className="text-cream">{format(new Date(bookingData.date), 'dd MMMM yyyy', { locale: id })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Waktu</span>
                <span className="text-cream">{bookingData.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Barber</span>
                <span className="text-cream">{bookingData.barber.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Layanan</span>
                <span className="text-cream text-right">{bookingData.services.map(s => s.name).join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cream/60">Pembayaran</span>
                <span className="text-cream">{paymentMethod.name}</span>
              </div>
              <div className="border-t border-gold/20 pt-3 flex justify-between font-medium">
                <span className="text-cream">Total</span>
                <span className="text-gold">{formatCurrency(bookingData.totalPrice)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/history')}>
            Lihat Riwayat Booking
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Booking
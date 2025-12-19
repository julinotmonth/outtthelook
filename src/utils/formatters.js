import { format, formatDistanceToNow, isToday, isTomorrow, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

// Format currency to Indonesian Rupiah
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date to Indonesian format
export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, formatStr, { locale: id })
}

// Format time
export const formatTime = (time) => {
  return time.slice(0, 5) // "09:00:00" -> "09:00"
}

// Format date relative (e.g., "2 jam yang lalu")
export const formatRelativeTime = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(parsedDate, { addSuffix: true, locale: id })
}

// Format date for display with context
export const formatDateWithContext = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  
  if (isToday(parsedDate)) {
    return 'Hari ini'
  }
  
  if (isTomorrow(parsedDate)) {
    return 'Besok'
  }
  
  return format(parsedDate, 'EEEE, dd MMMM yyyy', { locale: id })
}

// Format phone number
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  // Format as Indonesian phone number
  if (cleaned.startsWith('62')) {
    return `+62 ${cleaned.slice(2, 5)} ${cleaned.slice(5, 9)} ${cleaned.slice(9)}`
  }
  if (cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  }
  return phone
}

// Format duration in minutes to human readable
export const formatDuration = (minutes) => {
  if (minutes < 60) {
    return `${minutes} menit`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours} jam`
  }
  return `${hours} jam ${remainingMinutes} menit`
}

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return ''
  return str.replace(/\b\w/g, (char) => char.toUpperCase())
}

// Truncate text with ellipsis
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

// Generate initials from name
export const getInitials = (name) => {
  if (!name) return ''
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format booking ID
export const formatBookingId = (id) => {
  return `#OB${String(id).padStart(6, '0')}`
}

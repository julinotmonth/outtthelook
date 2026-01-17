// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Menunggu Konfirmasi',
  [BOOKING_STATUS.CONFIRMED]: 'Dikonfirmasi',
  [BOOKING_STATUS.COMPLETED]: 'Selesai',
  [BOOKING_STATUS.CANCELLED]: 'Dibatalkan',
}

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'badge-pending',
  [BOOKING_STATUS.CONFIRMED]: 'badge-confirmed',
  [BOOKING_STATUS.COMPLETED]: 'badge-completed',
  [BOOKING_STATUS.CANCELLED]: 'badge-cancelled',
}

// Service Categories
export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'haircut', label: 'Haircut' },
  { id: 'shaving', label: 'Shaving' },
  { id: 'styling', label: 'Styling' },
  { id: 'treatment', label: 'Treatment' },
  { id: 'package', label: 'Package' },
]

// Gallery Categories
export const GALLERY_CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'before-after', label: 'Before/After' },
  { id: 'ambience', label: 'Suasana' },
  { id: 'tools', label: 'Tools' },
  { id: 'awards', label: 'Penghargaan' },
]

// Time Slots
export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00',
]

// Navigation Links
export const NAV_LINKS = [
  { path: '/', label: 'Beranda' },
  { path: '/services', label: 'Layanan' },
  { path: '/gallery', label: 'Galeri' },
  { path: '/team', label: 'Tim' },
  { path: '/booking', label: 'Booking' },
  { path: '/history', label: 'Riwayat' },
]

// Admin Navigation Links
export const ADMIN_NAV_LINKS = [
  { path: '/admin', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/admin/bookings', label: 'Kelola Booking', icon: 'Calendar' },
  { path: '/admin/services', label: 'Kelola Layanan', icon: 'Scissors' },
  { path: '/admin/team', label: 'Kelola Tim', icon: 'Users' },
  { path: '/admin/gallery', label: 'Kelola Galeri', icon: 'Image' },
]

// Social Links
export const SOCIAL_LINKS = [
  { name: 'Instagram', url: 'https://instagram.com/outlookbarbershop', icon: 'Instagram' },
  { name: 'Facebook', url: 'https://facebook.com/outlookbarbershop', icon: 'Facebook' },
  { name: 'WhatsApp', url: 'https://wa.me/6281234567890', icon: 'MessageCircle' },
  { name: 'TikTok', url: 'https://tiktok.com/@outlookbarbershop', icon: 'Music2' },
]

// Contact Info
export const CONTACT_INFO = {
  phone: '+62 812 3258 9599',
  email: 'hello@outlookbarbershop.com',
  address: 'Jl. Sudirman No. 123, Jakarta Pusat, Indonesia',
  operationalHours: 'Senin - Minggu: 09:00 - 21:00',
}

// Testimonials (dummy data)
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Andi Pratama',
    role: 'Entrepreneur',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Pelayanan terbaik yang pernah saya rasakan. Barber-nya sangat profesional dan hasilnya selalu memuaskan!',
  },
  {
    id: 2,
    name: 'Budi Santoso',
    role: 'Software Engineer',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Tempat paling nyaman untuk grooming. Sistem booking online-nya sangat memudahkan!',
  },
  {
    id: 3,
    name: 'Reza Wijaya',
    role: 'Content Creator',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    rating: 5,
    text: 'Sudah langganan selama 2 tahun. Kualitasnya konsisten dan barber-nya selalu update dengan trend terbaru.',
  },
]

// Stats
export const STATS = [
  { value: '5000+', label: 'Pelanggan Puas' },
  { value: '10+', label: 'Tahun Pengalaman' },
  { value: '15', label: 'Barber Profesional' },
  { value: '50+', label: 'Layanan Tersedia' },
]

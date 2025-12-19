import { z } from 'zod'

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
})

// Register Schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .min(3, 'Nama minimal 3 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format nomor telepon tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password harus mengandung huruf besar, huruf kecil, dan angka'
    ),
  confirmPassword: z
    .string()
    .min(1, 'Konfirmasi password wajib diisi'),
  terms: z
    .boolean()
    .refine((val) => val === true, 'Anda harus menyetujui syarat dan ketentuan'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
})

// Booking Customer Info Schema
export const bookingCustomerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama wajib diisi')
    .min(3, 'Nama minimal 3 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format nomor telepon tidak valid'),
  notes: z.string().optional(),
})

// Service Schema (Admin)
export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama layanan wajib diisi')
    .min(3, 'Nama layanan minimal 3 karakter')
    .max(100, 'Nama layanan maksimal 100 karakter'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi')
    .min(10, 'Deskripsi minimal 10 karakter')
    .max(500, 'Deskripsi maksimal 500 karakter'),
  price: z
    .coerce
    .number({ invalid_type_error: 'Harga harus berupa angka' })
    .min(1, 'Harga wajib diisi')
    .min(1000, 'Harga minimal Rp 1.000'),
  duration: z
    .coerce
    .number({ invalid_type_error: 'Durasi harus berupa angka' })
    .min(1, 'Durasi wajib diisi')
    .min(15, 'Durasi minimal 15 menit')
    .max(240, 'Durasi maksimal 240 menit'),
  category: z
    .string()
    .min(1, 'Kategori wajib dipilih'),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
})

// Barber Schema (Admin)
export const barberSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama barber wajib diisi')
    .min(3, 'Nama minimal 3 karakter'),
  role: z
    .string()
    .min(1, 'Role wajib dipilih'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^(\+62|62|0)8[1-9][0-9]{6,10}$/, 'Format nomor telepon tidak valid'),
  instagram: z
    .string()
    .optional()
    .or(z.literal('')),
  experience: z
    .coerce
    .number({ invalid_type_error: 'Pengalaman harus berupa angka' })
    .min(0, 'Pengalaman tidak boleh negatif')
    .max(50, 'Pengalaman maksimal 50 tahun'),
  bio: z
    .string()
    .max(500, 'Bio maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  image: z.string().optional(),
  isAvailable: z.boolean().default(true),
})

// Password validation helper
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const strength = Object.values(checks).filter(Boolean).length

  return {
    checks,
    strength,
    label: strength <= 2 ? 'Lemah' : strength <= 3 ? 'Sedang' : strength <= 4 ? 'Kuat' : 'Sangat Kuat',
    color: strength <= 2 ? 'red' : strength <= 3 ? 'yellow' : strength <= 4 ? 'green' : 'emerald',
  }
}
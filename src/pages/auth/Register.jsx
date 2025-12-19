import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User,
  Phone,
  Scissors,
  ArrowRight,
  Check,
  X,
  Loader2
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Input, FormField } from '../../components/common/Input'
import { registerSchema, validatePasswordStrength } from '../../utils/validators'
import { useAuthStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

// Google Icon Component
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

// Sample Google accounts for demo
const GOOGLE_ACCOUNTS = [
  { id: 1, name: 'Budi Santoso', email: 'budi.santoso@gmail.com', avatar: 'B' },
  { id: 2, name: 'Dewi Lestari', email: 'dewi.lestari@gmail.com', avatar: 'D' },
  { id: 3, name: 'Ahmad Rizky', email: 'ahmad.rizky@gmail.com', avatar: 'A' },
]

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState(null)
  
  const { register: registerUser, googleLogin, checkEmail } = useAuthStore()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  })

  // Watch password for strength indicator
  const watchPassword = watch('password')
  const watchEmail = watch('email')
  
  // Check email availability
  const [emailTaken, setEmailTaken] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  
  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (watchEmail && watchEmail.includes('@') && watchEmail.includes('.')) {
        setCheckingEmail(true)
        const taken = await checkEmail(watchEmail)
        setEmailTaken(taken)
        setCheckingEmail(false)
      } else {
        setEmailTaken(false)
      }
    }
    
    const timeoutId = setTimeout(checkEmailAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [watchEmail, checkEmail])

  const onSubmit = async (data) => {
    // Check if email is taken
    if (emailTaken) {
      setError('email', { message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.' })
      toast.error('Email sudah terdaftar')
      return
    }

    setIsLoading(true)
    
    try {
      // Register user via API
      const result = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      })
      
      if (!result.success) {
        setError('root', { message: result.message })
        toast.error(result.message)
        setIsLoading(false)
        return
      }
      
      toast.success('Registrasi berhasil! Selamat datang!')
      navigate('/')
    } catch (error) {
      toast.error('Registrasi gagal. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google Login
  const handleGoogleLogin = async (account) => {
    setSelectedGoogleAccount(account)
    setIsGoogleLoading(true)
    
    try {
      // Login via Google OAuth API
      const result = await googleLogin({
        name: account.name,
        email: account.email,
      })
      
      if (result.success) {
        toast.success(`Selamat datang, ${account.name}!`)
        setShowGoogleModal(false)
        navigate('/')
      } else {
        toast.error(result.message || 'Google login gagal')
      }
    } catch (error) {
      toast.error('Google login gagal. Silakan coba lagi.')
    } finally {
      setIsGoogleLoading(false)
      setSelectedGoogleAccount(null)
    }
  }

  // Get current password strength
  const currentStrength = watchPassword ? validatePasswordStrength(watchPassword) : null

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-charcoal-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-l from-charcoal-dark to-transparent" />
        
        {/* Quote */}
        <div className="absolute bottom-20 left-10 right-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-heading text-3xl text-cream mb-4 leading-relaxed">
              "Bergabunglah dan nikmati kemudahan booking online"
            </p>
            <div className="gold-divider w-20" />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center">
              <Scissors className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-cream">OUTLOOK</h1>
              <span className="font-display text-gold text-sm tracking-[0.2em]">BARBERSHOP</span>
            </div>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-bold text-cream mb-2">
              Buat Akun Baru
            </h2>
            <p className="text-cream/60">
              Daftar untuk mulai memesan layanan
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {errors.root && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errors.root.message}
              </div>
            )}

            <FormField label="Nama Lengkap" error={errors.name?.message} required>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('name')}
                  placeholder="Nama lengkap Anda"
                  className="pl-10"
                  error={errors.name}
                />
              </div>
            </FormField>

            <FormField label="Email" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="nama@email.com"
                  className={cn("pl-10", emailTaken && "border-red-500")}
                  error={errors.email}
                />
                {emailTaken && (
                  <p className="text-red-400 text-xs mt-1">Email sudah terdaftar</p>
                )}
              </div>
            </FormField>

            <FormField label="Nomor Telepon" error={errors.phone?.message} required>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('phone')}
                  placeholder="08xxxxxxxxxx"
                  className="pl-10"
                  error={errors.phone}
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  className="pl-10 pr-10"
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {currentStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          level <= currentStrength.strength
                            ? currentStrength.strength <= 2
                              ? 'bg-red-500'
                              : currentStrength.strength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-cream/20'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    'text-xs',
                    currentStrength.strength <= 2
                      ? 'text-red-400'
                      : currentStrength.strength <= 3
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  )}>
                    Password: {currentStrength.label}
                  </p>
                  
                  {/* Requirements */}
                  <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                    <PasswordCheck passed={currentStrength.checks.length} label="Min 8 karakter" />
                    <PasswordCheck passed={currentStrength.checks.lowercase} label="Huruf kecil" />
                    <PasswordCheck passed={currentStrength.checks.uppercase} label="Huruf besar" />
                    <PasswordCheck passed={currentStrength.checks.number} label="Angka" />
                  </div>
                </div>
              )}
            </FormField>

            <FormField label="Konfirmasi Password" error={errors.confirmPassword?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password"
                  className="pl-10 pr-10"
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-gold transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </FormField>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('terms')}
                  className="mt-1 w-4 h-4 rounded border-gold/30 bg-charcoal text-gold focus:ring-gold focus:ring-offset-charcoal"
                />
                <span className="text-sm text-cream/70">
                  Saya menyetujui{' '}
                  <Link to="/terms" className="text-gold hover:underline">
                    Syarat & Ketentuan
                  </Link>{' '}
                  dan{' '}
                  <Link to="/privacy" className="text-gold hover:underline">
                    Kebijakan Privasi
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-error mt-1">{errors.terms.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading} disabled={emailTaken}>
              Daftar Sekarang
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-charcoal-dark text-cream/50">atau</span>
            </div>
          </div>

          {/* Social Register */}
          <button 
            type="button"
            onClick={() => setShowGoogleModal(true)}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            <GoogleIcon />
            <span>Daftar dengan Google</span>
          </button>

          {/* Login Link */}
          <p className="text-center mt-8 text-cream/60">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light transition-colors font-medium">
              Masuk di sini
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Google Login Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isGoogleLoading && setShowGoogleModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GoogleIcon />
                    <span className="text-gray-800 font-medium text-lg">Daftar dengan Google</span>
                  </div>
                  {!isGoogleLoading && (
                    <button
                      onClick={() => setShowGoogleModal(false)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-sm mt-2">
                  Pilih akun untuk daftar ke Outlook Barbershop
                </p>
              </div>

              {/* Account List */}
              <div className="p-4">
                {GOOGLE_ACCOUNTS.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => handleGoogleLogin(account)}
                    disabled={isGoogleLoading}
                    className={cn(
                      'w-full flex items-center gap-4 p-4 rounded-xl transition-all',
                      isGoogleLoading && selectedGoogleAccount?.id === account.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent',
                      isGoogleLoading && selectedGoogleAccount?.id !== account.id && 'opacity-50'
                    )}
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-lg">
                      {account.avatar}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800">{account.name}</p>
                      <p className="text-sm text-gray-500">{account.email}</p>
                    </div>

                    {/* Loading indicator */}
                    {isGoogleLoading && selectedGoogleAccount?.id === account.id && (
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    )}
                  </button>
                ))}

                {/* Use another account */}
                <button
                  disabled={isGoogleLoading}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl mt-2 transition-all',
                    'hover:bg-gray-50 border-2 border-transparent',
                    isGoogleLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-800">Gunakan akun lain</p>
                  </div>
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Dengan melanjutkan, Anda menyetujui{' '}
                  <a href="#" className="text-blue-600 hover:underline">Persyaratan Layanan</a>
                  {' '}dan{' '}
                  <a href="#" className="text-blue-600 hover:underline">Kebijakan Privasi</a>
                  {' '}Google.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Password Check Component
const PasswordCheck = ({ passed, label }) => (
  <div className={cn(
    'flex items-center gap-1',
    passed ? 'text-green-400' : 'text-cream/40'
  )}>
    {passed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
    <span>{label}</span>
  </div>
)

export default Register

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Scissors,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  User
} from 'lucide-react'
import Button from '../../components/common/Button'
import { Input, FormField } from '../../components/common/Input'
import { Modal } from '../../components/common/Modal'
import { loginSchema } from '../../utils/validators'
import { useAuthStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

// Google Client ID - Replace with your own from Google Cloud Console
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''

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

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGoogleReady, setIsGoogleReady] = useState(false)
  const googleButtonRef = useRef(null)
  
  const { loginWithCredentials, googleLogin } = useAuthStore()
  const from = location.state?.from?.pathname || '/'
  const message = location.state?.message || null

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  // Handle Google OAuth callback
  const handleGoogleCallback = async (response) => {
    if (response.credential) {
      setIsGoogleLoading(true)
      try {
        // Decode JWT token from Google
        const base64Url = response.credential.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
        const userData = JSON.parse(jsonPayload)
        
        // Login with Google data
        const result = await googleLogin({
          name: userData.name,
          email: userData.email,
          googleId: userData.sub,
          picture: userData.picture,
        })
        
        if (result.success) {
          toast.success(`Selamat datang, ${userData.name}!`)
          navigate(from, { replace: true })
        } else {
          toast.error(result.message || 'Google login gagal')
        }
      } catch (error) {
        console.error('Google login error:', error)
        toast.error('Google login gagal. Silakan coba lagi.')
      } finally {
        setIsGoogleLoading(false)
      }
    }
  }

  // Initialize Google Sign-In with rendered button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.log('Google Client ID not configured')
      return
    }

    const initializeGoogle = () => {
      if (window.google && googleButtonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCallback,
            auto_select: false,
            cancel_on_tap_outside: true,
          })
          
          // Render the Google button
          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            { 
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'continue_with',
              shape: 'rectangular',
              width: googleButtonRef.current.offsetWidth || 400,
              locale: 'id'
            }
          )
          
          setIsGoogleReady(true)
        } catch (error) {
          console.error('Google init error:', error)
        }
      }
    }

    // Wait for Google script to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        initializeGoogle()
        clearInterval(checkGoogle)
      }
    }, 100)
    
    // Clear interval after 5 seconds
    const timeout = setTimeout(() => {
      clearInterval(checkGoogle)
    }, 5000)

    return () => {
      clearInterval(checkGoogle)
      clearTimeout(timeout)
    }
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      // Login with credentials validation via API
      const result = await loginWithCredentials(data.email, data.password)
      
      if (!result.success) {
        setError('root', { message: result.message })
        toast.error(result.message)
        setIsLoading(false)
        return
      }
      
      toast.success('Login berhasil!')
      
      // Redirect based on role
      if (result.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error('Login gagal. Silakan coba lagi.')
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
        navigate(from, { replace: true })
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
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
              Selamat Datang Kembali
            </h2>
            <p className="text-cream/60">
              Masuk ke akun Anda untuk melanjutkan
            </p>
          </div>

          {/* Message from redirect */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-gold/10 border border-gold/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <p className="text-cream text-sm">{message}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {errors.root && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errors.root.message}
              </div>
            )}

            <FormField label="Email" error={errors.email?.message} required>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="nama@email.com"
                  className="pl-10"
                  error={errors.email}
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
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
            </FormField>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-4 h-4 rounded border-gold/30 bg-charcoal text-gold focus:ring-gold focus:ring-offset-charcoal"
                />
                <span className="text-sm text-cream/70">Ingat saya</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-gold hover:text-gold-light transition-colors"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Demo Account Info */}
          <div className="mt-6 p-4 rounded-lg bg-charcoal border border-gold/20">
            <p className="text-gold text-sm font-medium mb-2">Demo Account:</p>
            <div className="space-y-1 text-xs text-cream/60">
              <p><span className="text-cream/80">Admin:</span> admin@outlook.com / admin123</p>
              <p><span className="text-cream/80">User:</span> john@email.com / user123</p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gold/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-charcoal-dark text-cream/50">atau</span>
            </div>
          </div>

          {/* Social Login - Google Sign In Button */}
          <div className="space-y-3">
            {GOOGLE_CLIENT_ID ? (
              <>
                {/* Google rendered button container */}
                <div 
                  ref={googleButtonRef}
                  className="w-full flex justify-center min-h-[44px]"
                />
                {!isGoogleReady && (
                  <div className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memuat Google Sign-In...</span>
                  </div>
                )}
                {isGoogleLoading && (
                  <div className="text-center text-cream/60 text-sm">
                    Sedang memproses login...
                  </div>
                )}
              </>
            ) : (
              <button 
                type="button"
                onClick={() => toast.error('Google Client ID belum dikonfigurasi. Gunakan demo account untuk testing.')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                <GoogleIcon />
                <span>Lanjutkan dengan Google</span>
              </button>
            )}
          </div>

          {/* Register Link */}
          <p className="text-center mt-8 text-cream/60">
            Belum punya akun?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light transition-colors font-medium">
              Daftar sekarang
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-charcoal-dark/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-dark to-transparent" />
        
        {/* Quote */}
        <div className="absolute bottom-20 left-10 right-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="font-heading text-3xl text-cream mb-4 leading-relaxed">
              "Pengalaman grooming premium yang tak terlupakan"
            </p>
            <div className="gold-divider w-20" />
          </motion.div>
        </div>
      </div>

    </div>
  )
}

export default Login
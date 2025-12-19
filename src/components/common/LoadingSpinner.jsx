import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'default', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  }

  return (
    <Loader2
      className={cn(
        'animate-spin text-gold',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Full page loading
export const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" />
  </div>
)

// Inline loading
export const InlineLoading = ({ text = 'Loading...' }) => (
  <div className="flex items-center gap-2 text-cream/60">
    <LoadingSpinner size="sm" />
    <span className="text-sm">{text}</span>
  </div>
)

// Skeleton loading
export const Skeleton = ({ className, ...props }) => (
  <div
    className={cn('skeleton h-4', className)}
    {...props}
  />
)

// Card skeleton
export const CardSkeleton = () => (
  <div className="rounded-lg border border-gold/20 bg-charcoal p-6">
    <Skeleton className="h-40 w-full mb-4" />
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-1/2 mb-4" />
    <div className="flex gap-2">
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-8 w-20" />
    </div>
  </div>
)

// Table skeleton
export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-20" />
      </div>
    ))}
  </div>
)

export default LoadingSpinner

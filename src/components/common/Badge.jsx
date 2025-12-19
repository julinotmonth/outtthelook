import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gold/20 text-gold border border-gold/30',
        secondary: 'bg-copper/20 text-copper border border-copper/30',
        success: 'bg-green-500/20 text-green-400 border border-green-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
        error: 'bg-red-500/20 text-red-400 border border-red-500/30',
        info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        outline: 'text-cream border border-cream/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const Badge = ({ className, variant, ...props }) => {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

// Status Badge component with predefined statuses
const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { variant: 'warning', label: 'Menunggu' },
    confirmed: { variant: 'success', label: 'Dikonfirmasi' },
    completed: { variant: 'info', label: 'Selesai' },
    cancelled: { variant: 'error', label: 'Dibatalkan' },
  }

  const config = statusConfig[status] || { variant: 'default', label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

export { Badge, StatusBadge, badgeVariants }
export default Badge

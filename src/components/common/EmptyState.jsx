import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import Button from './Button'

const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  className,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      {Icon && (
        <div className="mb-6 p-4 rounded-full bg-gold/10 text-gold">
          <Icon className="w-12 h-12" />
        </div>
      )}
      
      {title && (
        <h3 className="font-heading text-2xl font-bold text-cream mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-cream/60 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && actionLabel && (
        <Button onClick={action}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}

export default EmptyState

import * as React from 'react'
import { cn } from '../../lib/utils'

const Input = React.forwardRef(({ className, type, error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-md border bg-charcoal px-4 py-2 text-sm text-cream ring-offset-background transition-all duration-300',
        'placeholder:text-cream/40',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error 
          ? 'border-error focus-visible:ring-error' 
          : 'border-gold/30 hover:border-gold/50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = 'Input'

// Textarea component
const Textarea = React.forwardRef(({ className, error, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        'flex min-h-[100px] w-full rounded-md border bg-charcoal px-4 py-3 text-sm text-cream ring-offset-background transition-all duration-300',
        'placeholder:text-cream/40',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'resize-none',
        error 
          ? 'border-error focus-visible:ring-error' 
          : 'border-gold/30 hover:border-gold/50',
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = 'Textarea'

// Label component
const Label = React.forwardRef(({ className, error, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none text-cream/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      error && 'text-error',
      className
    )}
    {...props}
  />
))
Label.displayName = 'Label'

// Form Error Message
const FormError = ({ message }) => {
  if (!message) return null
  
  return (
    <p className="text-sm text-error mt-1 animate-fade-in">
      {message}
    </p>
  )
}

// Form Field wrapper
const FormField = ({ label, error, children, className, required }) => (
  <div className={cn('space-y-2', className)}>
    {label && (
      <Label error={error}>
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </Label>
    )}
    {children}
    <FormError message={error} />
  </div>
)

export { Input, Textarea, Label, FormError, FormField }
export default Input

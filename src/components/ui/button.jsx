import React from 'react'
import { cn } from './lib/utils'

const buttonVariants = {
  default: 'bg-blue-500 text-white hover:bg-blue-600 px-4 py-2 rounded-md font-medium transition-colors',
  destructive: 'bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors',
  outline: 'border border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600 px-4 py-2 rounded-md font-medium transition-colors',
  ghost: 'hover:bg-gray-100 px-4 py-2 rounded-md font-medium transition-colors',
  link: 'text-blue-500 underline hover:text-blue-600 px-4 py-2 font-medium transition-colors',
}

const buttonSizes = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 px-3 text-sm',
  lg: 'h-10 px-6 text-lg',
  icon: 'h-9 w-9 p-2',
}

function Button({ className, variant = 'default', size = 'default', ...props }) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

  return (
    <button
      className={cn(
        baseClasses,
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      {...props}
    />
  )
}

export { Button }

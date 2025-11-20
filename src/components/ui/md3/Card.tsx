import React from 'react'
import { cx } from '@/lib/utils'
import { Surface } from './Surface'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variant
   */
  variant?: 'elevated' | 'filled' | 'outlined'
  /**
   * Interactive state (clickable/hoverable)
   */
  interactive?: boolean
}

/**
 * Material Design 3 Card Component
 *
 * Cards contain content and actions about a single subject.
 */
export function Card({
  variant = 'filled',
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  const baseClasses = 'relative overflow-hidden'

  const variantClasses = {
    'elevated': '',
    'filled': 'bg-[var(--color-md-neutral-95)]',
    'outlined': 'border border-[var(--color-md-neutral-80)] bg-[var(--color-md-neutral-99)]',
  }

  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-300 [transition-timing-function:var(--ease-md-emphasized)] hover:scale-[1.01] hover:[box-shadow:var(--shadow-md-elevation-2)] active:scale-[0.99]'
    : ''

  if (variant === 'elevated') {
    return (
      <Surface
        elevation={1}
        shape="medium"
        className={cx(
          baseClasses,
          interactiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </Surface>
    )
  }

  return (
    <div
      className={cx(
        baseClasses,
        variantClasses[variant],
        interactiveClasses,
        'rounded-[var(--radius-md-medium)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

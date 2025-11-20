import React from 'react'
import { cx } from '@/lib/utils'
import { Surface } from './Surface'

interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * FAB variant
   */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface'
  /**
   * FAB size
   */
  size?: 'small' | 'medium' | 'large'
  /**
   * Show label
   */
  label?: string
  /**
   * Icon element
   */
  icon?: React.ReactNode
}

/**
 * Material Design 3 Floating Action Button (FAB)
 *
 * The most important action on a screen.
 */
export function FAB({
  variant = 'primary',
  size = 'medium',
  label,
  icon,
  className,
  children,
  ...props
}: FABProps) {
  const sizeClasses = {
    small: 'h-10 min-w-10 px-3',
    medium: 'h-14 min-w-14 px-4',
    large: 'h-24 min-w-24 px-7',
  }

  const variantClasses = {
    primary: 'bg-[var(--color-md-primary-40)] text-white hover:bg-[var(--color-md-primary-30)] active:bg-[var(--color-md-primary-20)]',
    secondary: 'bg-[var(--color-md-secondary-40)] text-white hover:bg-[var(--color-md-secondary-30)] active:bg-[var(--color-md-secondary-20)]',
    tertiary: 'bg-[var(--color-md-tertiary-40)] text-white hover:bg-[var(--color-md-tertiary-30)] active:bg-[var(--color-md-tertiary-20)]',
    surface: 'bg-[var(--color-md-neutral-95)] text-[var(--color-md-primary-40)] hover:bg-[var(--color-md-neutral-90)] active:bg-[var(--color-md-neutral-80)]',
  }

  const content = (
    <>
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {label && (
        <span className="ml-3 text-[var(--font-size-label-large)] font-medium">
          {label}
        </span>
      )}
      {children}
    </>
  )

  return (
    <Surface
      as="button"
      elevation={3}
      shape="large"
      className={cx(
        'inline-flex items-center justify-center gap-2',
        'transition-all duration-300 [transition-timing-function:var(--ease-md-emphasized)]',
        'hover:[box-shadow:var(--shadow-md-elevation-4)] hover:scale-105',
        'active:[box-shadow:var(--shadow-md-elevation-2)] active:scale-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {content}
    </Surface>
  )
}

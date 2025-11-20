import React from 'react'
import { cx } from '@/lib/utils'

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Elevation level (0-5)
   */
  elevation?: 0 | 1 | 2 | 3 | 4 | 5
  /**
   * Surface variant
   */
  variant?: 'surface' | 'surface-variant' | 'surface-container' | 'surface-container-high' | 'surface-container-highest'
  /**
   * Shape/border radius
   */
  shape?: 'none' | 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large' | 'full'
  /**
   * Render as a different element
   */
  as?: React.ElementType
}

/**
 * Material Design 3 Surface Component
 *
 * Surfaces are foundational elements in Material Design 3.
 * They provide consistent elevation, color, and shape.
 */
export function Surface({
  elevation = 0,
  variant = 'surface',
  shape = 'medium',
  as: Component = 'div',
  className,
  children,
  ...props
}: SurfaceProps) {
  const elevationClasses = {
    0: '',
    1: '[box-shadow:var(--shadow-md-elevation-1)]',
    2: '[box-shadow:var(--shadow-md-elevation-2)]',
    3: '[box-shadow:var(--shadow-md-elevation-3)]',
    4: '[box-shadow:var(--shadow-md-elevation-4)]',
    5: '[box-shadow:var(--shadow-md-elevation-5)]',
  }

  const variantClasses = {
    'surface': 'bg-[var(--color-md-neutral-99)]',
    'surface-variant': 'bg-[var(--color-md-neutral-90)]',
    'surface-container': 'bg-[var(--color-md-neutral-95)]',
    'surface-container-high': 'bg-[var(--color-md-neutral-90)]',
    'surface-container-highest': 'bg-[var(--color-md-neutral-90)]',
  }

  const shapeClasses = {
    'none': 'rounded-[var(--radius-md-none)]',
    'extra-small': 'rounded-[var(--radius-md-extra-small)]',
    'small': 'rounded-[var(--radius-md-small)]',
    'medium': 'rounded-[var(--radius-md-medium)]',
    'large': 'rounded-[var(--radius-md-large)]',
    'extra-large': 'rounded-[var(--radius-md-extra-large)]',
    'full': 'rounded-[var(--radius-md-full)]',
  }

  return (
    <Component
      className={cx(
        variantClasses[variant],
        elevationClasses[elevation],
        shapeClasses[shape],
        'transition-shadow duration-300 [transition-timing-function:var(--ease-md-standard)]',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Class Extension Utility (cx)
 *
 * Used for custom brand-focused components.
 * Alias for cn() for consistency across the design system.
 */

import { cn } from './cn'

/**
 * Combines class names (alias for cn)
 *
 * @param inputs - Class names to combine
 * @returns Merged class string with conflicts resolved
 *
 * @example
 * cx('bg-primary text-white', 'hover:bg-primary-dark')
 * cx('grid grid-cols-12', conditional && 'gap-8')
 */
export const cx = cn

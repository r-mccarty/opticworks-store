/**
 * OpticWorks Grid System Tokens
 *
 * 12-column grid system with 8px baseline for vertical rhythm.
 * Includes configuration for grid overlays during development.
 */

export const grid = {
  // Grid columns
  columns: 12,

  // Column gaps (gutters)
  columnGap: {
    xs: '1rem',     // 16px
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px - default
    lg: '3rem',     // 48px
    xl: '4rem',     // 64px
  },

  // Row gaps
  rowGap: {
    xs: '1rem',     // 16px
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px - default
    lg: '3rem',     // 48px
    xl: '4rem',     // 64px
  },

  // Baseline grid (for vertical rhythm)
  baseline: '0.5rem', // 8px

  // Grid overlay configuration (development mode)
  overlay: {
    // Column grid lines
    column: {
      color: 'rgba(163, 230, 53, 0.1)',  // Lime green 10%
      width: '1px',
      style: 'dashed',
    },

    // Baseline grid lines
    baseline: {
      color: 'rgba(163, 230, 53, 0.05)', // Lime green 5%
      width: '1px',
      style: 'dotted',
    },

    // Grid intersections
    intersection: {
      color: 'rgba(163, 230, 53, 0.2)',  // Lime green 20%
      size: '2px',
    },

    // Margin indicators
    margin: {
      color: 'rgba(163, 230, 53, 0.15)', // Lime green 15%
      width: '2px',
      style: 'solid',
    },
  },

  // Container max widths (matches spacing containerWidth)
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container padding (responsive)
  containerPadding: {
    sm: '1rem',     // 16px for mobile
    md: '2rem',     // 32px for tablet
    lg: '3rem',     // 48px for desktop
    xl: '4rem',     // 64px for large desktop
  },

  // Breakpoints (matching Tailwind defaults)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Grid template configurations
  templates: {
    // Two-column layouts
    twoColumn: {
      columns: 'repeat(2, 1fr)',
      gap: '2rem',
    },

    // Three-column layouts
    threeColumn: {
      columns: 'repeat(3, 1fr)',
      gap: '2rem',
    },

    // Four-column layouts (product grids)
    fourColumn: {
      columns: 'repeat(4, 1fr)',
      gap: '2rem',
    },

    // Sidebar layout (aside + main)
    sidebar: {
      columns: '300px 1fr',
      gap: '3rem',
    },

    // Reverse sidebar (main + aside)
    sidebarReverse: {
      columns: '1fr 300px',
      gap: '3rem',
    },

    // Hero layout (image + text)
    hero: {
      columns: '1fr 1fr',
      gap: '4rem',
    },

    // Dashboard layout (multiple panels)
    dashboard: {
      columns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
  },

  // Responsive grid configurations
  responsive: {
    // Mobile-first grid
    mobile: {
      columns: 1,
      gap: '1rem',
    },

    // Tablet grid
    tablet: {
      columns: 2,
      gap: '1.5rem',
    },

    // Desktop grid
    desktop: {
      columns: 4,
      gap: '2rem',
    },

    // Large desktop grid
    largeDesktop: {
      columns: 6,
      gap: '2.5rem',
    },
  },
} as const

// Grid overlay component configuration
export const gridOverlayConfig = {
  // Should overlay be visible?
  enabled: false,

  // Toggle key (keyboard shortcut)
  toggleKey: 'g',
  toggleModifier: 'ctrl', // ctrl+g or cmd+g

  // Z-index for overlay
  zIndex: 9999,

  // Opacity range
  opacity: {
    min: 0,
    max: 0.3,
    default: 0.1,
  },

  // Show baseline grid?
  showBaseline: true,

  // Show column grid?
  showColumns: true,

  // Show margins?
  showMargins: true,
} as const

// Type exports
export type GridToken = typeof grid
export type GridTemplate = keyof typeof grid.templates
export type GridBreakpoint = keyof typeof grid.breakpoints
export type GridOverlayConfig = typeof gridOverlayConfig

/**
 * OpticWorks Spacing Tokens
 *
 * 8px baseline grid system for consistent spacing throughout the app.
 * All spacing values are multiples or fractions of the 8px baseline.
 */

export const spacing = {
  // Pixel values
  px: '1px',
  0: '0',

  // Sub-baseline (for fine adjustments)
  0.5: '0.125rem',  // 2px  (baseline / 4)
  1: '0.25rem',     // 4px  (baseline / 2)
  1.5: '0.375rem',  // 6px  (baseline * 0.75)

  // Baseline multiples
  2: '0.5rem',      // 8px  (baseline * 1)
  3: '0.75rem',     // 12px (baseline * 1.5)
  4: '1rem',        // 16px (baseline * 2)
  5: '1.25rem',     // 20px (baseline * 2.5)
  6: '1.5rem',      // 24px (baseline * 3)
  7: '1.75rem',     // 28px (baseline * 3.5)
  8: '2rem',        // 32px (baseline * 4)
  9: '2.25rem',     // 36px (baseline * 4.5)
  10: '2.5rem',     // 40px (baseline * 5)
  11: '2.75rem',    // 44px (baseline * 5.5)
  12: '3rem',       // 48px (baseline * 6)
  14: '3.5rem',     // 56px (baseline * 7)
  16: '4rem',       // 64px (baseline * 8)
  20: '5rem',       // 80px (baseline * 10)
  24: '6rem',       // 96px (baseline * 12)
  28: '7rem',       // 112px (baseline * 14)
  32: '8rem',       // 128px (baseline * 16)
  36: '9rem',       // 144px (baseline * 18)
  40: '10rem',      // 160px (baseline * 20)
  44: '11rem',      // 176px (baseline * 22)
  48: '12rem',      // 192px (baseline * 24)
  52: '13rem',      // 208px (baseline * 26)
  56: '14rem',      // 224px (baseline * 28)
  60: '15rem',      // 240px (baseline * 30)
  64: '16rem',      // 256px (baseline * 32)
  72: '18rem',      // 288px (baseline * 36)
  80: '20rem',      // 320px (baseline * 40)
  96: '24rem',      // 384px (baseline * 48)
} as const

// Container widths (based on common breakpoints)
export const containerWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
  full: '100%',
} as const

// Max widths for content areas
export const maxWidth = {
  xs: '20rem',     // 320px
  sm: '24rem',     // 384px
  md: '28rem',     // 448px
  lg: '32rem',     // 512px
  xl: '36rem',     // 576px
  '2xl': '42rem',  // 672px
  '3xl': '48rem',  // 768px
  '4xl': '56rem',  // 896px
  '5xl': '64rem',  // 1024px
  '6xl': '72rem',  // 1152px
  '7xl': '80rem',  // 1280px
  prose: '65ch',   // Optimal reading width
  screen: '100vw',
} as const

// Semantic spacing scales
export const semanticSpacing = {
  // Component internal spacing
  component: {
    xs: spacing[2],    // 8px
    sm: spacing[4],    // 16px
    md: spacing[6],    // 24px
    lg: spacing[8],    // 32px
    xl: spacing[12],   // 48px
  },

  // Section spacing (between major page sections)
  section: {
    xs: spacing[12],   // 48px
    sm: spacing[16],   // 64px
    md: spacing[24],   // 96px
    lg: spacing[32],   // 128px
    xl: spacing[48],   // 192px
  },

  // Layout spacing (page margins, container padding)
  layout: {
    xs: spacing[4],    // 16px
    sm: spacing[6],    // 24px
    md: spacing[8],    // 32px
    lg: spacing[12],   // 48px
    xl: spacing[16],   // 64px
  },

  // Gutter spacing (between grid columns)
  gutter: {
    xs: spacing[4],    // 16px
    sm: spacing[6],    // 24px
    md: spacing[8],    // 32px
    lg: spacing[12],   // 48px
    xl: spacing[16],   // 64px
  },
} as const

// Border radius values
export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  DEFAULT: '0.25rem', // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px',     // Fully rounded
} as const

// Type exports
export type SpacingToken = typeof spacing
export type ContainerWidth = typeof containerWidth
export type MaxWidth = typeof maxWidth
export type SemanticSpacing = typeof semanticSpacing
export type BorderRadius = typeof borderRadius

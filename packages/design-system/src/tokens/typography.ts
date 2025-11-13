/**
 * OpticWorks Typography Tokens
 *
 * Based on Geist font family with modular type scale.
 * Includes responsive sizing and line-height ratios.
 */

export const typography = {
  // Font families
  fontFamily: {
    sans: [
      'var(--font-geist-sans)',
      'ui-sans-serif',
      'system-ui',
      'sans-serif',
      'Apple Color Emoji',
      'Segoe UI Emoji',
      'Segoe UI Symbol',
      'Noto Color Emoji',
    ],
    mono: [
      'var(--font-geist-mono)',
      'ui-monospace',
      'SFMono-Regular',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ],
  },

  // Font sizes with line heights (mobile-first)
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px / 32px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px / 40px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px / tight
    '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px / tight
    '7xl': ['4.5rem', { lineHeight: '1' }],         // 72px / tight
    '8xl': ['6rem', { lineHeight: '1' }],           // 96px / tight
    '9xl': ['8rem', { lineHeight: '1' }],           // 128px / tight
  },

  // Font weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Line heights (standalone, for custom usage)
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text transform utilities
  textTransform: {
    uppercase: 'uppercase',
    lowercase: 'lowercase',
    capitalize: 'capitalize',
    'normal-case': 'none',
  },
} as const

// Responsive typography scales
export const responsiveTypography = {
  // Display text (large headlines)
  display: {
    sm: {
      fontSize: typography.fontSize['4xl'][0],
      lineHeight: typography.fontSize['4xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    md: {
      fontSize: typography.fontSize['5xl'][0],
      lineHeight: typography.fontSize['5xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tight,
    },
    lg: {
      fontSize: typography.fontSize['6xl'][0],
      lineHeight: typography.fontSize['6xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tighter,
    },
    xl: {
      fontSize: typography.fontSize['7xl'][0],
      lineHeight: typography.fontSize['7xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
      letterSpacing: typography.letterSpacing.tighter,
    },
  },

  // Headings
  heading: {
    h1: {
      fontSize: typography.fontSize['4xl'][0],
      lineHeight: typography.fontSize['4xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
    },
    h2: {
      fontSize: typography.fontSize['3xl'][0],
      lineHeight: typography.fontSize['3xl'][1].lineHeight,
      fontWeight: typography.fontWeight.bold,
    },
    h3: {
      fontSize: typography.fontSize['2xl'][0],
      lineHeight: typography.fontSize['2xl'][1].lineHeight,
      fontWeight: typography.fontWeight.semibold,
    },
    h4: {
      fontSize: typography.fontSize.xl[0],
      lineHeight: typography.fontSize.xl[1].lineHeight,
      fontWeight: typography.fontWeight.semibold,
    },
    h5: {
      fontSize: typography.fontSize.lg[0],
      lineHeight: typography.fontSize.lg[1].lineHeight,
      fontWeight: typography.fontWeight.semibold,
    },
    h6: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontWeight: typography.fontWeight.semibold,
    },
  },

  // Body text
  body: {
    sm: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontWeight: typography.fontWeight.normal,
    },
    base: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontWeight: typography.fontWeight.normal,
    },
    lg: {
      fontSize: typography.fontSize.lg[0],
      lineHeight: typography.fontSize.lg[1].lineHeight,
      fontWeight: typography.fontWeight.normal,
    },
  },

  // Labels and UI text
  label: {
    sm: {
      fontSize: typography.fontSize.xs[0],
      lineHeight: typography.fontSize.xs[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    base: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
    lg: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontWeight: typography.fontWeight.medium,
      letterSpacing: typography.letterSpacing.wide,
    },
  },

  // Code/monospace
  code: {
    sm: {
      fontSize: typography.fontSize.xs[0],
      lineHeight: typography.fontSize.xs[1].lineHeight,
      fontFamily: typography.fontFamily.mono,
    },
    base: {
      fontSize: typography.fontSize.sm[0],
      lineHeight: typography.fontSize.sm[1].lineHeight,
      fontFamily: typography.fontFamily.mono,
    },
    lg: {
      fontSize: typography.fontSize.base[0],
      lineHeight: typography.fontSize.base[1].lineHeight,
      fontFamily: typography.fontFamily.mono,
    },
  },
} as const

// Type exports
export type TypographyToken = typeof typography
export type ResponsiveTypography = typeof responsiveTypography

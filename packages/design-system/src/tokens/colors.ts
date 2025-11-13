/**
 * OpticWorks Color Tokens
 *
 * Lime green brand inspired by Work Louder and Modal keyboards.
 * Designed for light and dark mode support.
 */

export const colors = {
  // Brand colors - Lime green as primary
  brand: {
    lime: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',  // Primary lime green
      400: '#a3e635',  // Vibrant accent
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
      800: '#3f6212',
      900: '#365314',
      950: '#1a2e05',
    },

    // Modal keyboard inspired accent - Electric green/teal
    modal: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',  // Secondary accent
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },

    // Dark background variants for dark mode
    dark: {
      50: '#18181b',
      100: '#27272a',
      200: '#3f3f46',
      300: '#52525b',
      400: '#71717a',
      500: '#a1a1aa',
      600: '#d4d4d8',
      700: '#e4e4e7',
      800: '#f4f4f5',
      900: '#fafafa',
      950: '#ffffff',
    }
  },

  // Semantic color mappings
  primary: {
    DEFAULT: '#a3e635', // brand.lime.400
    light: '#bef264',   // brand.lime.300
    dark: '#84cc16',    // brand.lime.500
    foreground: '#171717', // Dark text on lime background
  },

  secondary: {
    DEFAULT: '#34d399', // brand.modal.400
    light: '#6ee7b7',   // brand.modal.300
    dark: '#10b981',    // brand.modal.500
    foreground: '#171717',
  },

  // Status colors (accessible contrast ratios)
  success: {
    DEFAULT: '#10b981',
    light: '#34d399',
    dark: '#059669',
    foreground: '#ffffff',
  },

  warning: {
    DEFAULT: '#f59e0b',
    light: '#fbbf24',
    dark: '#d97706',
    foreground: '#ffffff',
  },

  error: {
    DEFAULT: '#ef4444',
    light: '#f87171',
    dark: '#dc2626',
    foreground: '#ffffff',
  },

  info: {
    DEFAULT: '#3b82f6',
    light: '#60a5fa',
    dark: '#2563eb',
    foreground: '#ffffff',
  },

  // Neutral grays (work for light and dark modes)
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },

  // Grid overlay color (lime green with low opacity)
  grid: {
    line: 'rgba(163, 230, 53, 0.1)',  // Lime green 10% opacity
    intersection: 'rgba(163, 230, 53, 0.2)', // Lime green 20% opacity
    baseline: 'rgba(163, 230, 53, 0.15)',
  },

  // Background colors
  background: {
    DEFAULT: '#ffffff',
    secondary: '#fafafa',
    tertiary: '#f5f5f5',
    dark: '#0a0a0a',
    'dark-secondary': '#171717',
    'dark-tertiary': '#262626',
  },

  // Foreground/text colors
  foreground: {
    DEFAULT: '#171717',
    secondary: '#525252',
    tertiary: '#737373',
    muted: '#a3a3a3',
    dark: '#ffffff',
    'dark-secondary': '#e5e5e5',
    'dark-tertiary': '#d4d4d4',
    'dark-muted': '#a3a3a3',
  },

  // Border colors
  border: {
    DEFAULT: '#e5e5e5',
    secondary: '#d4d4d4',
    focus: '#a3e635', // Lime green for focus states
    dark: '#262626',
    'dark-secondary': '#404040',
  },

  // Special UI elements
  card: {
    DEFAULT: '#ffffff',
    hover: '#fafafa',
    dark: '#171717',
    'dark-hover': '#262626',
  },

  input: {
    background: '#ffffff',
    border: '#e5e5e5',
    'border-focus': '#a3e635',
    placeholder: '#a3a3a3',
    dark: '#171717',
    'dark-border': '#404040',
    'dark-border-focus': '#a3e635',
  },
} as const

// Type for color token paths
export type ColorToken = typeof colors

// CSS variable names for Tailwind integration
export const colorVars = {
  '--color-primary': colors.primary.DEFAULT,
  '--color-secondary': colors.secondary.DEFAULT,
  '--color-success': colors.success.DEFAULT,
  '--color-warning': colors.warning.DEFAULT,
  '--color-error': colors.error.DEFAULT,
  '--color-info': colors.info.DEFAULT,
  '--color-background': colors.background.DEFAULT,
  '--color-foreground': colors.foreground.DEFAULT,
  '--color-border': colors.border.DEFAULT,
} as const

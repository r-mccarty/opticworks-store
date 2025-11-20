/**
 * Theme System Configuration
 * Compatible with tweakcn for dynamic theme switching
 *
 * Each theme defines:
 * - Color palette (HSL format for CSS variables)
 * - Border radius style (rounded vs square)
 * - Typography (font families)
 */

export type ThemeName = 'default' | 'brutalist' | 'elegant'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  cardForeground: string
  popover: string
  popoverForeground: string
  primary: string
  primaryForeground: string
  secondary: string
  secondaryForeground: string
  muted: string
  mutedForeground: string
  accent: string
  accentForeground: string
  destructive: string
  destructiveForeground: string
  border: string
  input: string
  ring: string
}

export interface ThemeBorders {
  radius: string
  style: 'rounded' | 'square' | 'pill'
}

export interface ThemeFonts {
  heading: string
  body: string
  display: string
  mono: string
}

export interface Theme {
  name: ThemeName
  displayName: string
  description: string
  colors: ThemeColors
  borders: ThemeBorders
  fonts: ThemeFonts
}

/**
 * Theme 1: Default (OpticWorks Brand)
 * - Warm orange primary color
 * - Medium rounded corners
 * - Colfax body, Feature display
 */
export const defaultTheme: Theme = {
  name: 'default',
  displayName: 'OpticWorks',
  description: 'Warm, modern, and approachable with balanced rounded corners',
  colors: {
    background: '0 0% 100%',
    foreground: '0 0% 3.9%',
    card: '0 0% 100%',
    cardForeground: '0 0% 3.9%',
    popover: '0 0% 100%',
    popoverForeground: '0 0% 3.9%',
    primary: '24 100% 50%',           // Orange #FF7700
    primaryForeground: '0 0% 98%',
    secondary: '0 0% 96.1%',
    secondaryForeground: '0 0% 9%',
    muted: '0 0% 96.1%',
    mutedForeground: '0 0% 45.1%',
    accent: '24 100% 95%',
    accentForeground: '24 100% 30%',
    destructive: '0 84.2% 60.2%',
    destructiveForeground: '0 0% 98%',
    border: '0 0% 89.8%',
    input: '0 0% 89.8%',
    ring: '24 100% 50%',
  },
  borders: {
    radius: '0.5rem',                 // 8px - Medium rounded
    style: 'rounded',
  },
  fonts: {
    heading: 'var(--font-colfax)',
    body: 'var(--font-colfax)',
    display: 'var(--font-feature)',
    mono: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', monospace",
  },
}

/**
 * Theme 2: Brutalist (Bold & Angular)
 * - High contrast blue/cyan
 * - No rounded corners (square)
 * - Barlow body, Feature Condensed display
 */
export const brutalistTheme: Theme = {
  name: 'brutalist',
  displayName: 'Brutalist',
  description: 'Bold, high-contrast, sharp edges with no rounded corners',
  colors: {
    background: '0 0% 100%',
    foreground: '0 0% 0%',
    card: '0 0% 98%',
    cardForeground: '0 0% 0%',
    popover: '0 0% 98%',
    popoverForeground: '0 0% 0%',
    primary: '200 100% 45%',          // Cyan Blue #0095E6
    primaryForeground: '0 0% 100%',
    secondary: '0 0% 10%',
    secondaryForeground: '0 0% 100%',
    muted: '0 0% 90%',
    mutedForeground: '0 0% 30%',
    accent: '200 100% 95%',
    accentForeground: '200 100% 25%',
    destructive: '0 100% 50%',
    destructiveForeground: '0 0% 100%',
    border: '0 0% 15%',
    input: '0 0% 85%',
    ring: '200 100% 45%',
  },
  borders: {
    radius: '0px',                    // Square corners
    style: 'square',
  },
  fonts: {
    heading: 'var(--font-barlow)',
    body: 'var(--font-barlow)',
    display: 'var(--font-feature-condensed)',
    mono: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', monospace",
  },
}

/**
 * Theme 3: Elegant (Refined & Soft)
 * - Purple/Violet palette
 * - Large rounded corners (pill-like)
 * - Feature body, Colfax display
 */
export const elegantTheme: Theme = {
  name: 'elegant',
  displayName: 'Elegant',
  description: 'Refined, soft, luxurious with smooth rounded corners',
  colors: {
    background: '270 20% 98%',
    foreground: '270 15% 10%',
    card: '0 0% 100%',
    cardForeground: '270 15% 10%',
    popover: '0 0% 100%',
    popoverForeground: '270 15% 10%',
    primary: '270 70% 60%',           // Purple #9D5CDE
    primaryForeground: '0 0% 100%',
    secondary: '270 30% 95%',
    secondaryForeground: '270 70% 30%',
    muted: '270 20% 96%',
    mutedForeground: '270 10% 50%',
    accent: '270 80% 96%',
    accentForeground: '270 70% 40%',
    destructive: '350 80% 65%',
    destructiveForeground: '0 0% 100%',
    border: '270 20% 88%',
    input: '270 20% 90%',
    ring: '270 70% 60%',
  },
  borders: {
    radius: '1rem',                   // 16px - Large rounded
    style: 'pill',
  },
  fonts: {
    heading: 'var(--font-feature)',
    body: 'var(--font-colfax)',
    display: 'var(--font-feature)',
    mono: "ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', monospace",
  },
}

/**
 * Theme registry - all available themes
 */
export const themes: Record<ThemeName, Theme> = {
  default: defaultTheme,
  brutalist: brutalistTheme,
  elegant: elegantTheme,
}

/**
 * Get theme by name
 */
export function getTheme(name: ThemeName): Theme {
  return themes[name]
}

/**
 * Get all theme names
 */
export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[]
}

/**
 * Apply theme to document root
 * This function updates CSS variables to match the selected theme
 */
export function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  // Apply colors
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    root.style.setProperty(cssVarName, value)
  })

  // Apply border radius
  root.style.setProperty('--radius', theme.borders.radius)

  // Apply fonts
  root.style.setProperty('--font-heading', theme.fonts.heading)
  root.style.setProperty('--font-body', theme.fonts.body)
  root.style.setProperty('--font-display', theme.fonts.display)
  root.style.setProperty('--font-mono', theme.fonts.mono)

  // Store theme preference
  localStorage.setItem('opticworks-theme', theme.name)
}

/**
 * Get stored theme preference
 */
export function getStoredTheme(): ThemeName {
  if (typeof window === 'undefined') return 'default'

  const stored = localStorage.getItem('opticworks-theme')
  return (stored as ThemeName) || 'default'
}

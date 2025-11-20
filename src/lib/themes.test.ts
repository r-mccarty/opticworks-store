/**
 * Theme System Validation Suite
 * Tests theme configuration, color values, border styles, and fonts
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  defaultTheme,
  brutalistTheme,
  elegantTheme,
  getTheme,
  getThemeNames,
  applyTheme,
} from './themes'

describe('Theme System', () => {
  describe('Theme Definitions', () => {
    it('should have all three themes defined', () => {
      expect(defaultTheme).toBeDefined()
      expect(brutalistTheme).toBeDefined()
      expect(elegantTheme).toBeDefined()
    })

    it('should have correct theme names', () => {
      expect(defaultTheme.name).toBe('default')
      expect(brutalistTheme.name).toBe('brutalist')
      expect(elegantTheme.name).toBe('elegant')
    })

    it('should have display names and descriptions', () => {
      const themes = [defaultTheme, brutalistTheme, elegantTheme]
      themes.forEach((theme) => {
        expect(theme.displayName).toBeTruthy()
        expect(theme.description).toBeTruthy()
        expect(theme.displayName.length).toBeGreaterThan(0)
        expect(theme.description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Color Validation', () => {
    const validateHSLColor = (color: string) => {
      // HSL format: "H S% L%" or "H S% L%"
      const hslPattern = /^\d+\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/
      return hslPattern.test(color)
    }

    it('default theme should have valid HSL colors', () => {
      Object.entries(defaultTheme.colors).forEach(([key, value]) => {
        expect(validateHSLColor(value), `${key} should be valid HSL: ${value}`).toBe(true)
      })
    })

    it('brutalist theme should have valid HSL colors', () => {
      Object.entries(brutalistTheme.colors).forEach(([key, value]) => {
        expect(validateHSLColor(value), `${key} should be valid HSL: ${value}`).toBe(true)
      })
    })

    it('elegant theme should have valid HSL colors', () => {
      Object.entries(elegantTheme.colors).forEach(([key, value]) => {
        expect(validateHSLColor(value), `${key} should be valid HSL: ${value}`).toBe(true)
      })
    })

    it('themes should have distinct primary colors', () => {
      const defaultPrimary = defaultTheme.colors.primary
      const brutalistPrimary = brutalistTheme.colors.primary
      const elegantPrimary = elegantTheme.colors.primary

      expect(defaultPrimary).not.toBe(brutalistPrimary)
      expect(defaultPrimary).not.toBe(elegantPrimary)
      expect(brutalistPrimary).not.toBe(elegantPrimary)
    })

    it('default theme should have orange primary', () => {
      // Hue ~24 is orange
      expect(defaultTheme.colors.primary).toContain('24')
    })

    it('brutalist theme should have blue/cyan primary', () => {
      // Hue ~200 is cyan/blue
      expect(brutalistTheme.colors.primary).toContain('200')
    })

    it('elegant theme should have purple primary', () => {
      // Hue ~270 is purple/violet
      expect(elegantTheme.colors.primary).toContain('270')
    })
  })

  describe('Border Style Validation', () => {
    it('default theme should have rounded borders', () => {
      expect(defaultTheme.borders.style).toBe('rounded')
      expect(defaultTheme.borders.radius).toBe('0.5rem')
      expect(parseFloat(defaultTheme.borders.radius)).toBeGreaterThan(0)
    })

    it('brutalist theme should have square borders', () => {
      expect(brutalistTheme.borders.style).toBe('square')
      expect(brutalistTheme.borders.radius).toBe('0px')
      expect(parseFloat(brutalistTheme.borders.radius)).toBe(0)
    })

    it('elegant theme should have pill borders', () => {
      expect(elegantTheme.borders.style).toBe('pill')
      expect(elegantTheme.borders.radius).toBe('1rem')
      expect(parseFloat(elegantTheme.borders.radius)).toBeGreaterThan(
        parseFloat(defaultTheme.borders.radius)
      )
    })

    it('themes should have distinct border radii', () => {
      const defaultRadius = parseFloat(defaultTheme.borders.radius)
      const brutalistRadius = parseFloat(brutalistTheme.borders.radius)
      const elegantRadius = parseFloat(elegantTheme.borders.radius)

      expect(defaultRadius).not.toBe(brutalistRadius)
      expect(defaultRadius).not.toBe(elegantRadius)
      expect(brutalistRadius).not.toBe(elegantRadius)
    })
  })

  describe('Font Validation', () => {
    it('default theme should use Colfax and Feature fonts', () => {
      expect(defaultTheme.fonts.heading).toContain('colfax')
      expect(defaultTheme.fonts.body).toContain('colfax')
      expect(defaultTheme.fonts.display).toContain('feature')
    })

    it('brutalist theme should use Barlow and Feature Condensed fonts', () => {
      expect(brutalistTheme.fonts.heading).toContain('barlow')
      expect(brutalistTheme.fonts.body).toContain('barlow')
      expect(brutalistTheme.fonts.display).toContain('feature-condensed')
    })

    it('elegant theme should use Feature and Colfax fonts', () => {
      expect(elegantTheme.fonts.heading).toContain('feature')
      expect(elegantTheme.fonts.body).toContain('colfax')
      expect(elegantTheme.fonts.display).toContain('feature')
    })

    it('all themes should have monospace font defined', () => {
      const themes = [defaultTheme, brutalistTheme, elegantTheme]
      themes.forEach((theme) => {
        expect(theme.fonts.mono).toBeTruthy()
        expect(theme.fonts.mono).toContain('monospace')
      })
    })

    it('themes should have distinct font combinations', () => {
      const defaultCombo = `${defaultTheme.fonts.heading}-${defaultTheme.fonts.body}-${defaultTheme.fonts.display}`
      const brutalistCombo = `${brutalistTheme.fonts.heading}-${brutalistTheme.fonts.body}-${brutalistTheme.fonts.display}`
      const elegantCombo = `${elegantTheme.fonts.heading}-${elegantTheme.fonts.body}-${elegantTheme.fonts.display}`

      expect(defaultCombo).not.toBe(brutalistCombo)
      expect(defaultCombo).not.toBe(elegantCombo)
      expect(brutalistCombo).not.toBe(elegantCombo)
    })
  })

  describe('Theme Registry', () => {
    it('should return correct theme by name', () => {
      expect(getTheme('default')).toEqual(defaultTheme)
      expect(getTheme('brutalist')).toEqual(brutalistTheme)
      expect(getTheme('elegant')).toEqual(elegantTheme)
    })

    it('should return all theme names', () => {
      const names = getThemeNames()
      expect(names).toContain('default')
      expect(names).toContain('brutalist')
      expect(names).toContain('elegant')
      expect(names.length).toBe(3)
    })
  })

  describe('Theme Application (DOM)', () => {
    beforeEach(() => {
      // Clear any existing styles on document.documentElement
      document.documentElement.removeAttribute('style')
    })

    afterEach(() => {
      // Clean up after each test
      document.documentElement.removeAttribute('style')
      localStorage.clear()
    })

    it('should apply theme colors to document root', () => {
      applyTheme(defaultTheme)

      const root = document.documentElement
      const primaryColor = root.style.getPropertyValue('--primary')
      expect(primaryColor).toBe(defaultTheme.colors.primary)
    })

    it('should apply border radius to document root', () => {
      applyTheme(brutalistTheme)

      const root = document.documentElement
      const radius = root.style.getPropertyValue('--radius')
      expect(radius).toBe(brutalistTheme.borders.radius)
    })

    it('should apply fonts to document root', () => {
      applyTheme(elegantTheme)

      const root = document.documentElement
      const headingFont = root.style.getPropertyValue('--font-heading')
      expect(headingFont).toBe(elegantTheme.fonts.heading)
    })

    it('should switch between themes correctly', () => {
      const root = document.documentElement

      // Apply default theme
      applyTheme(defaultTheme)
      expect(root.style.getPropertyValue('--primary')).toBe(defaultTheme.colors.primary)
      expect(root.style.getPropertyValue('--radius')).toBe(defaultTheme.borders.radius)

      // Switch to brutalist
      applyTheme(brutalistTheme)
      expect(root.style.getPropertyValue('--primary')).toBe(brutalistTheme.colors.primary)
      expect(root.style.getPropertyValue('--radius')).toBe(brutalistTheme.borders.radius)

      // Switch to elegant
      applyTheme(elegantTheme)
      expect(root.style.getPropertyValue('--primary')).toBe(elegantTheme.colors.primary)
      expect(root.style.getPropertyValue('--radius')).toBe(elegantTheme.borders.radius)
    })
  })

  describe('Theme Structure Completeness', () => {
    const requiredColorKeys = [
      'background',
      'foreground',
      'card',
      'cardForeground',
      'popover',
      'popoverForeground',
      'primary',
      'primaryForeground',
      'secondary',
      'secondaryForeground',
      'muted',
      'mutedForeground',
      'accent',
      'accentForeground',
      'destructive',
      'destructiveForeground',
      'border',
      'input',
      'ring',
    ]

    const requiredFontKeys = ['heading', 'body', 'display', 'mono']

    it('all themes should have complete color definitions', () => {
      const themes = [defaultTheme, brutalistTheme, elegantTheme]
      themes.forEach((theme) => {
        requiredColorKeys.forEach((key) => {
          expect(theme.colors).toHaveProperty(key)
          expect(theme.colors[key as keyof typeof theme.colors]).toBeTruthy()
        })
      })
    })

    it('all themes should have complete font definitions', () => {
      const themes = [defaultTheme, brutalistTheme, elegantTheme]
      themes.forEach((theme) => {
        requiredFontKeys.forEach((key) => {
          expect(theme.fonts).toHaveProperty(key)
          expect(theme.fonts[key as keyof typeof theme.fonts]).toBeTruthy()
        })
      })
    })

    it('all themes should have border configuration', () => {
      const themes = [defaultTheme, brutalistTheme, elegantTheme]
      themes.forEach((theme) => {
        expect(theme.borders).toHaveProperty('radius')
        expect(theme.borders).toHaveProperty('style')
        expect(theme.borders.radius).toBeTruthy()
        expect(theme.borders.style).toBeTruthy()
      })
    })
  })
})

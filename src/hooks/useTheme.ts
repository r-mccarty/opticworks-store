/**
 * Theme Management Hook
 * Uses Zustand for state management, following OpticWorks patterns
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type ThemeName, getTheme, applyTheme } from '@/lib/themes'

interface ThemeState {
  currentTheme: ThemeName
  setTheme: (theme: ThemeName) => void
  cycleTheme: () => void
}

const themeOrder: ThemeName[] = ['default', 'brutalist', 'elegant']

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: 'default',

      setTheme: (themeName: ThemeName) => {
        const theme = getTheme(themeName)
        applyTheme(theme)
        set({ currentTheme: themeName })
      },

      cycleTheme: () => {
        const current = get().currentTheme
        const currentIndex = themeOrder.indexOf(current)
        const nextIndex = (currentIndex + 1) % themeOrder.length
        const nextTheme = themeOrder[nextIndex]
        get().setTheme(nextTheme)
      },
    }),
    {
      name: 'opticworks-theme-storage',
    }
  )
)

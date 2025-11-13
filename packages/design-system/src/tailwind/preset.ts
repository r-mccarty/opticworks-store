import type { Config } from 'tailwindcss'
import { colors } from '../tokens/colors'
import { typography } from '../tokens/typography'
import { spacing, borderRadius, maxWidth, semanticSpacing } from '../tokens/spacing'
import { animations } from '../tokens/animations'
import { grid } from '../tokens/grid'

const semanticSpacingFlatted = {
  component: semanticSpacing.component,
  section: semanticSpacing.section,
  layout: semanticSpacing.layout,
  gutter: semanticSpacing.gutter,
}

export const preset = {
  content: [],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: grid.containerPadding.md,
        ...grid.containerPadding,
      },
      screens: grid.container,
    },
    extend: {
      colors: {
        brand: colors.brand,
        primary: colors.primary,
        secondary: colors.secondary,
        success: colors.success,
        warning: colors.warning,
        error: colors.error,
        info: colors.info,
        neutral: colors.neutral,
        background: colors.background,
        foreground: colors.foreground,
        border: colors.border,
        card: colors.card,
        grid: colors.grid,
      },
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      letterSpacing: typography.letterSpacing,
      spacing: {
        ...spacing,
        ...semanticSpacingFlatted,
      },
      borderRadius,
      maxWidth,
      screens: grid.breakpoints,
      keyframes: animations.keyframes,
      animation: Object.fromEntries(
        Object.entries(animations.keyframes).map(([key]) => [
          key,
          `${key} ${animations.duration.normal} ${animations.easing['ease-in-out-quad']}`,
        ]),
      ),
      transitionDuration: animations.duration,
      transitionTimingFunction: animations.easing,
    },
  },
} satisfies Partial<Config>

export default preset

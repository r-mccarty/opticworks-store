import type { Config } from "tailwindcss";

/**
 * OpticWorks Design System - Tailwind Configuration
 * Dark-mode only, modern rounded aesthetic
 *
 * All colors reference CSS custom properties defined in globals.css
 * This enables runtime theming and maintains a single source of truth.
 */
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // ========================================
      // COLORS
      // ========================================
      colors: {
        // Background hierarchy
        background: {
          DEFAULT: "var(--color-background)",
          elevated: "var(--color-background-elevated)",
          subtle: "var(--color-background-subtle)",
          muted: "var(--color-background-muted)",
        },

        // Foreground hierarchy
        foreground: {
          DEFAULT: "var(--color-foreground)",
          muted: "var(--color-foreground-muted)",
          subtle: "var(--color-foreground-subtle)",
        },

        // Primary accent (Orange)
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          active: "var(--color-primary-active)",
          foreground: "var(--color-primary-foreground)",
          muted: "var(--color-primary-muted)",
        },

        // Secondary (Neutral)
        secondary: {
          DEFAULT: "var(--color-secondary)",
          hover: "var(--color-secondary-hover)",
          foreground: "var(--color-secondary-foreground)",
        },

        // Semantic colors
        success: {
          DEFAULT: "var(--color-success)",
          hover: "var(--color-success-hover)",
          muted: "var(--color-success-muted)",
          foreground: "var(--color-success-foreground)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          hover: "var(--color-warning-hover)",
          muted: "var(--color-warning-muted)",
          foreground: "var(--color-warning-foreground)",
        },
        error: {
          DEFAULT: "var(--color-error)",
          hover: "var(--color-error-hover)",
          muted: "var(--color-error-muted)",
          foreground: "var(--color-error-foreground)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          hover: "var(--color-info-hover)",
          muted: "var(--color-info-muted)",
          foreground: "var(--color-info-foreground)",
        },

        // Border colors
        border: {
          DEFAULT: "var(--color-border)",
          hover: "var(--color-border-hover)",
          focus: "var(--color-border-focus)",
        },

        // Input/Form colors
        input: {
          DEFAULT: "var(--color-input)",
          border: "var(--color-input-border)",
          placeholder: "var(--color-input-placeholder)",
        },

        // Focus ring
        ring: "var(--color-ring)",
      },

      // ========================================
      // BORDER RADIUS (Modern Rounded)
      // ========================================
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        DEFAULT: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "3xl": "var(--radius-3xl)",
        full: "var(--radius-full)",
      },

      // ========================================
      // BOX SHADOWS (Dark-mode optimized)
      // ========================================
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        DEFAULT: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
        inner: "var(--shadow-inner)",
        // Glow effects
        "glow-primary": "var(--shadow-glow-primary)",
        "glow-success": "var(--shadow-glow-success)",
        "glow-info": "var(--shadow-glow-info)",
      },

      // ========================================
      // SPACING (extends Tailwind defaults)
      // ========================================
      spacing: {
        "4.5": "1.125rem", // 18px
        "5.5": "1.375rem", // 22px
        "13": "3.25rem", // 52px
        "15": "3.75rem", // 60px
        "18": "4.5rem", // 72px
        "22": "5.5rem", // 88px
      },

      // ========================================
      // TYPOGRAPHY
      // ========================================
      fontSize: {
        xs: ["var(--font-size-xs)", { lineHeight: "var(--line-height-normal)" }],
        sm: ["var(--font-size-sm)", { lineHeight: "var(--line-height-normal)" }],
        base: [
          "var(--font-size-base)",
          { lineHeight: "var(--line-height-normal)" },
        ],
        lg: ["var(--font-size-lg)", { lineHeight: "var(--line-height-snug)" }],
        xl: ["var(--font-size-xl)", { lineHeight: "var(--line-height-snug)" }],
        "2xl": [
          "var(--font-size-2xl)",
          { lineHeight: "var(--line-height-tight)" },
        ],
        "3xl": [
          "var(--font-size-3xl)",
          { lineHeight: "var(--line-height-tight)" },
        ],
        "4xl": [
          "var(--font-size-4xl)",
          { lineHeight: "var(--line-height-tight)" },
        ],
        "5xl": [
          "var(--font-size-5xl)",
          { lineHeight: "var(--line-height-none)" },
        ],
        "6xl": [
          "var(--font-size-6xl)",
          { lineHeight: "var(--line-height-none)" },
        ],
        "7xl": [
          "var(--font-size-7xl)",
          { lineHeight: "var(--line-height-none)" },
        ],
        "8xl": [
          "var(--font-size-8xl)",
          { lineHeight: "var(--line-height-none)" },
        ],
        "9xl": [
          "var(--font-size-9xl)",
          { lineHeight: "var(--line-height-none)" },
        ],
      },

      letterSpacing: {
        tighter: "var(--letter-spacing-tighter)",
        tight: "var(--letter-spacing-tight)",
        normal: "var(--letter-spacing-normal)",
        wide: "var(--letter-spacing-wide)",
        wider: "var(--letter-spacing-wider)",
        widest: "var(--letter-spacing-widest)",
      },

      // ========================================
      // TRANSITIONS
      // ========================================
      transitionDuration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
      },

      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        "in-out-expo": "cubic-bezier(0.87, 0, 0.13, 1)",
      },

      // ========================================
      // Z-INDEX SCALE
      // ========================================
      zIndex: {
        dropdown: "1000",
        sticky: "1100",
        modal: "1200",
        popover: "1300",
        toast: "1400",
        tooltip: "1500",
      },

      // ========================================
      // CONTAINER
      // ========================================
      maxWidth: {
        "8xl": "88rem", // 1408px
        "9xl": "96rem", // 1536px
      },
    },
  },
  plugins: [],
};

export default config;

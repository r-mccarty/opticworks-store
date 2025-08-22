# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

This is a Next.js 15 project with TypeScript. Use pnpm as the package manager.

```bash
# Install dependencies
pnpm install

# Development server
pnpm run dev

# Build for production
pnpm run build

# Start production server
pnpm run start

# Lint code
pnpm run lint
```

## Architecture Overview

This is a Solar/Farm technology marketing website template built with:

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4.1.12 (stable) + custom CSS variables
- **UI Components**: Custom components inspired by Tremor design system
- **Animations**: Motion library for smooth animations
- **Icons**: Remix Icons (@remixicon/react)
- **Typography**: Multiple custom fonts (Barlow, Colfax, Feature family)

### Key Architecture Patterns

**Component Structure:**
- `/src/components/` - Reusable components (Button, Icons, etc.)
- `/src/components/ui/` - Page-specific UI components (Hero, Features, etc.)
- Components use Tremor-inspired design patterns with `tailwind-variants` for styling

**Font System:**
- Four custom font families loaded via `next/font/local`
- CSS variables: `--font-barlow`, `--font-colfax`, `--font-feature`, `--font-feature-condensed`
- Default body font is Colfax (`font-colfax` class)

**Styling Approach:**
- Tailwind CSS with custom utilities in `/src/lib/utils.ts`
- `cx()` function combines `clsx` and `tailwind-merge` for conditional classes
- Predefined focus ring and input styling utilities
- Custom color scheme with orange accent colors

**Page Layout:**
- Root layout (`/src/app/layout.tsx`) includes global navigation and footer
- Main page (`/src/app/page.tsx`) is sectioned into distinct components:
  - Hero with animated background
  - Features showcase
  - Testimonials
  - Interactive map
  - Solar analytics dashboard
  - Call-to-action

**Configuration:**
- Site metadata and URLs centralized in `/src/app/siteConfig.ts`
- Tailwind config is minimal (v4 stable uses mostly defaults)

### Component Conventions

- Use `FadeContainer`, `FadeDiv`, `FadeSpan` from `@/components/Fade` for animations
- Button variants follow Tremor patterns with `tailwind-variants`
- SVG icons are typically from Remix Icons or custom React components
- Custom fonts should use the established CSS variable system
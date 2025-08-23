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

- **Framework**: Next.js 15.5.0 with App Router
- **Runtime**: React 19.1.1
- **Language**: TypeScript 5.9.2
- **Styling**: Tailwind CSS v4.1.12 (stable) + custom CSS variables
- **UI Components**: Custom components inspired by Tremor design system
- **Animations**: Motion library 12.23.12 for smooth animations
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

### Motion Library Types

When using Motion library animations, ensure proper TypeScript typing:
- Use `as const` for transition types: `type: "spring" as const`
- Use `as const` for ease arrays: `ease: [0.23, 1, 0.32, 1] as const`

### Logo System

The template uses two SVG logo components located in `/public/`:

**SolarLogo** (`/public/SolarLogo.tsx`):
- Full logo with text, dimensions: `viewBox="0 0 123 42"` (2.9:1 aspect ratio)
- Used in: Navbar (`w-22` class) and Footer (`w-20` class)
- Contains: Icon + "Solar" text in dark gray (#0f172a) with orange accent (#F97316)

**SolarMark** (`/public/SolarMark.tsx`):
- Icon-only version, dimensions: `viewBox="0 0 42 42"` (square)
- Used throughout Features, ChipViz, and other decorative components
- Contains: Orange directional star/compass icon (#F97316)

To replace with custom branding:
1. Create new TSX components following the same pattern
2. Update imports in: Navbar.tsx, Footer.tsx, Features.tsx, ChipViz.tsx
3. Maintain similar aspect ratios for consistent layout
4. Use React SVGProps<SVGSVGElement> for proper typing

### Video Background System (Feature Branch)

This branch includes a video background implementation for the hero section:

**VideoBackground Component** (`/src/components/ui/VideoBackground.tsx`):
- Replaces the Game of Life canvas animation with video background
- Play-on-demand functionality with overlay button
- Comprehensive error handling and loading states
- Graceful fallback to animated gradient background on video failure

**Key Features**:
- **Video Sources**: Accepts `videoUrl` and optional `posterUrl` props
- **User Control**: Play button overlay that disappears after video starts
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Only loads video when user initiates playback
- **Fallback**: Blue-to-black animated gradient when video fails
- **Responsive**: Object-cover scaling for all screen sizes

**Implementation Example**:
```tsx
<VideoBackground 
  videoUrl="https://your-video-cdn.com/video.mp4"
  posterUrl="https://your-video-cdn.com/poster.jpg"
/>
```

**Hero Section Changes**:
- Removed `pt-56` padding that caused navbar spacing issues
- Full-screen height with `min-h-screen` classes
- White text with drop shadows for better contrast over video
- Gradient overlays for improved text readability

**Branch Management**:
- Main branch: Original Game of Life animation
- Feature branch: Video background system
- Easy switching between implementations
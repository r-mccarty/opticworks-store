/**
 * OpticWorks Animation Tokens
 *
 * Easing functions and duration tokens for consistent motion design.
 * Includes custom easing for Lenis-style smooth scrolling.
 */

export const animations = {
  // Duration tokens
  duration: {
    instant: '75ms',
    fastest: '100ms',
    faster: '150ms',
    fast: '200ms',
    normal: '300ms',
    slow: '400ms',
    slower: '500ms',
    slowest: '700ms',
  },

  // Easing functions (CSS timing functions)
  easing: {
    // Standard CSS easings
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom cubic-bezier easings
    'ease-in-sine': 'cubic-bezier(0.12, 0, 0.39, 0)',
    'ease-out-sine': 'cubic-bezier(0.61, 1, 0.88, 1)',
    'ease-in-out-sine': 'cubic-bezier(0.37, 0, 0.63, 1)',

    'ease-in-quad': 'cubic-bezier(0.11, 0, 0.5, 0)',
    'ease-out-quad': 'cubic-bezier(0.5, 1, 0.89, 1)',
    'ease-in-out-quad': 'cubic-bezier(0.45, 0, 0.55, 1)',

    'ease-in-cubic': 'cubic-bezier(0.32, 0, 0.67, 0)',
    'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
    'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',

    'ease-in-quart': 'cubic-bezier(0.5, 0, 0.75, 0)',
    'ease-out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
    'ease-in-out-quart': 'cubic-bezier(0.76, 0, 0.24, 1)',

    'ease-in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
    'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',

    // Custom OpticWorks easings
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Lenis-style smooth
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bounce effect
    snappy: 'cubic-bezier(0.4, 0, 0.2, 1)', // Quick and responsive
    gentle: 'cubic-bezier(0.33, 0, 0.2, 1)', // Subtle and gentle
  },

  // Framer Motion variants
  framerVariants: {
    // Fade animations
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },

    // Slide animations
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },

    slideDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },

    slideLeft: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },

    slideRight: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },

    // Scale animations
    scale: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },

    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.8 },
    },

    // Stagger container
    stagger: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },

    staggerFast: {
      animate: {
        transition: {
          staggerChildren: 0.05,
        },
      },
    },

    staggerSlow: {
      animate: {
        transition: {
          staggerChildren: 0.2,
        },
      },
    },
  },

  // Transition presets
  transitions: {
    // Default transitions
    default: {
      duration: 300,
      ease: [0.4, 0, 0.2, 1],
    },

    fast: {
      duration: 200,
      ease: [0.4, 0, 0.2, 1],
    },

    slow: {
      duration: 500,
      ease: [0.4, 0, 0.2, 1],
    },

    // Smooth scrolling (Lenis-style)
    smooth: {
      duration: 700,
      ease: [0.25, 0.46, 0.45, 0.94],
    },

    // Spring animations
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },

    springBouncy: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
    },

    springGentle: {
      type: 'spring',
      stiffness: 200,
      damping: 40,
    },
  },

  // CSS keyframes
  keyframes: {
    // Fade in
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },

    // Slide up
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },

    // Pulse effect
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },

    // Spin (loading indicator)
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },

    // Shimmer (skeleton loading)
    shimmer: {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },

    // Bounce
    bounce: {
      '0%, 100%': {
        transform: 'translateY(0)',
        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
      },
      '50%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
      },
    },
  },
} as const

// Type exports
export type AnimationToken = typeof animations
export type Duration = keyof typeof animations.duration
export type Easing = keyof typeof animations.easing
export type FramerVariant = keyof typeof animations.framerVariants
export type Transition = keyof typeof animations.transitions
export type Keyframe = keyof typeof animations.keyframes

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'cyber-black': '#050505',
                'cyber-gray': {
                    800: '#141414',
                    700: '#1a1a1a',
                    600: '#202020',
                },
                'cyber-amber': {
                    300: '#fbbf24',
                    400: '#f59e0b',
                    500: '#d97706',
                },
                'cyber-blue': {
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                },
                'cyber-violet': {
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                },
            },
            fontFamily: {
                'mono': ['var(--font-geist-mono)', 'JetBrains Mono', 'monospace'],
                'colfax': ['var(--font-colfax)', 'Inter', 'system-ui', 'sans-serif'],
            },
            backdropBlur: {
                'xs': '2px',
                'cyber': '12px',
            },
            borderRadius: {
                'cyber': '24px',
                'cyber-lg': '32px',
            },
            letterSpacing: {
                'tight-cyber': '-0.04em',
            },
            lineHeight: {
                'relaxed-cyber': '1.6',
            },
            animation: {
                'border-glow': 'borderGlow 0.3s ease-out forwards',
            },
            keyframes: {
                borderGlow: {
                    '0%': { boxShadow: '0 0 0 0 rgba(251, 191, 36, 0)' },
                    '100%': { boxShadow: '0 0 0 2px rgba(251, 191, 36, 0.3)' },
                },
            },
        },
    },
    plugins: [],
}
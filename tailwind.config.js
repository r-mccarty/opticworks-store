// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // Adjust if needed
    ],
    theme: {
        extend: {
            colors: {
                // "Soft-Tech" color palette
                void: {
                    DEFAULT: '#030304',
                    50: '#0A0A0A',
                    100: '#050505',
                },
                glass: {
                    DEFAULT: 'rgba(255, 255, 255, 0.03)',
                    light: 'rgba(255, 255, 255, 0.05)',
                    lighter: 'rgba(255, 255, 255, 0.08)',
                    border: 'rgba(255, 255, 255, 0.1)',
                },
                // Choose Electric Amber as primary accent
                amber: {
                    DEFAULT: '#FF9900',
                    400: '#FFB347',
                    500: '#FF9900',
                    600: '#E68A00',
                },
                // Alternative: Deep Indigo (comment out if not using)
                indigo: {
                    DEFAULT: '#4F46E5',
                    400: '#6366F1',
                    500: '#4F46E5',
                    600: '#4338CA',
                },
            },
            fontFamily: {
                colfax: ['var(--font-colfax)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['var(--font-mono)', 'JetBrains Mono', 'Geist Mono', 'ui-monospace', 'monospace'],
            },
            fontWeight: {
                black: '800',
            },
            letterSpacing: {
                tighter: '-0.02em', // -2% for headlines
                wide: '0.02em', // +2px equivalent for eyebrows
                wider: '0.05em',
            },
            borderRadius: {
                smooth: '16px', // Smooth corner radius (standard)
                'smooth-sm': '12px',
                'smooth-lg': '20px',
                pill: '9999px', // Full pill shape
            },
            backdropBlur: {
                glass: '12px',
                'glass-lg': '24px',
            },
            boxShadow: {
                // Optical glows instead of shadows
                'glow-amber': '0 0 40px rgba(255, 153, 0, 0.3)',
                'glow-amber-lg': '0 0 80px rgba(255, 153, 0, 0.4)',
                'glow-indigo': '0 0 40px rgba(79, 70, 229, 0.3)',
                'glow-indigo-lg': '0 0 80px rgba(79, 70, 229, 0.4)',
                'glow-white': '0 0 40px rgba(255, 255, 255, 0.1)',
                'glow-white-lg': '0 0 60px rgba(255, 255, 255, 0.15)',
            },
        },
    },
}
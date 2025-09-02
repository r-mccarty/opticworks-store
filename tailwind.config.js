// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,ts,jsx,tsx,mdx}", // Adjust if needed
    ],
    theme: {
        extend: {
            colors: {
                background: 'white',
                foreground: 'black',
                popover: 'white',
                'popover-foreground': 'black',
                'muted-foreground': '#666666',
                ring: '#3b82f6',
                accent: '#f5f5f5',
                'accent-foreground': 'black',
                muted: '#f5f5f5',
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
}

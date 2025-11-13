import type { Config } from 'tailwindcss'
import { preset } from '@opticworks/design-system/tailwind'

const config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
} satisfies Config

export default config

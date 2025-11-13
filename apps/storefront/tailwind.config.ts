import type { Config } from 'tailwindcss'
import { preset } from '../../packages/design-system/src/tailwind/preset'

const config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
} satisfies Config

export default config

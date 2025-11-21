'use client'

import { cx } from "@/lib/utils"

interface AsciiBackgroundProps {
  className?: string
}

export function AsciiBackground({ className }: AsciiBackgroundProps) {
  // Generate ASCII grid pattern
  const characters = ['+', '*', '/', '/', '[', ']', '·']
  const rows = 20
  const cols = 40

  const pattern = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () =>
      characters[Math.floor(Math.random() * characters.length)]
    ).join(' ')
  )

  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
        className
      )}
    >
      <pre className="font-mono text-xs leading-relaxed text-zinc-800/40 select-none whitespace-pre">
        {pattern.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </pre>
    </div>
  )
}

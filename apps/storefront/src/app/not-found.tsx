'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { cx } from '@/lib/utils'

/**
 * 404 Not Found Page
 *
 * Features ASCII art bitmask animation inspired by Oxide Computer.
 * The animation cycles through different bit patterns to create
 * a visual effect in the terminal aesthetic.
 */

// ASCII art frames for 404 animation (bitmask style)
const ASCII_FRAMES = [
  `
   ██╗  ██╗ ██████╗ ██╗  ██╗
   ██║  ██║██╔═████╗██║  ██║
   ███████║██║██╔██║███████║
   ╚════██║████╔╝██║╚════██║
        ██║╚██████╔╝     ██║
        ╚═╝ ╚═════╝      ╚═╝
  `,
  `
   ╔═╗  ╔═╗ ╔═════╗ ╔═╗  ╔═╗
   ║ ║  ║ ║╔═╝ ╔═══╝║ ║  ║ ║
   ║ ╚══╝ ║║ ║ ╔══╗ ║ ╚══╝ ║
   ╚════╗ ║║ ╚═╝ ║ ║╚════╗ ║
        ║ ║╚══════╝      ║ ║
        ╚═╝              ╚═╝
  `,
  `
   ▄▄▄  ▄▄▄ ▄▄▄▄▄▄▄ ▄▄▄  ▄▄▄
   █  █ █  ██     █ █  █ █  █
   █  █ █  ██ ▄▄▄ █ █  █ █  █
   █    █  ███   █ █    █  █
        █  █ █████        █  █
        ████              ████
  `,
  `
   ┌─┐  ┌─┐ ┌─────┐ ┌─┐  ┌─┐
   │ │  │ │┌┘ ┌───┘│ │  │ │
   │ └──┘ ││ │ ┌──┐│ └──┘ │
   └────┐ ││ └─┘ │ │└────┐ │
        │ │└──────┘      │ │
        └─┘              └─┘
  `,
]

// Binary/hex bit pattern overlay
const BIT_PATTERNS = [
  '0x0404 0x0000 0x0404',
  '0x0101 0x0404 0x0101',
  '0x1010 0x0404 0x1010',
  '0x0404 0x1111 0x0404',
]

export default function NotFound() {
  const [frameIndex, setFrameIndex] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [bitPattern, setBitPattern] = useState(BIT_PATTERNS[0])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Animate ASCII frames
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity(0)

      setTimeout(() => {
        setFrameIndex((prev) => (prev + 1) % ASCII_FRAMES.length)
        setBitPattern(BIT_PATTERNS[Math.floor(Math.random() * BIT_PATTERNS.length)])
        setOpacity(1)
      }, 100)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // Canvas bitmask visualization
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Animation loop
    const animate = () => {
      // Clear canvas
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, width, height)

      // Draw animated bit grid
      const gridSize = 8
      const cellSize = 4

      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          // Create animated bit pattern
          const bitValue = Math.random() > 0.5 ? 1 : 0
          const alpha = bitValue * (0.5 + Math.sin(Date.now() / 1000 + x + y) * 0.3)

          ctx.fillStyle = `rgba(163, 230, 53, ${alpha})` // Lime green
          ctx.fillRect(
            x * (width / gridSize) + (width / gridSize - cellSize) / 2,
            y * (height / gridSize) + (height / gridSize - cellSize) / 2,
            cellSize,
            cellSize
          )
        }
      }
    }

    const intervalId = setInterval(animate, 100)
    return () => clearInterval(intervalId)
  })

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Background canvas animation */}
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
      />

      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full">
        {/* ASCII Art */}
        <div
          className={cx(
            'font-mono text-green-400 mb-8 text-center transition-opacity duration-100',
            'text-xs sm:text-sm md:text-base lg:text-lg'
          )}
          style={{ opacity }}
        >
          <pre className="inline-block text-left">
            {ASCII_FRAMES[frameIndex]}
          </pre>
        </div>

        {/* Bit pattern display */}
        <div className="text-center mb-8">
          <div className="font-mono text-green-400/60 text-sm tracking-wider">
            {bitPattern}
          </div>
        </div>

        {/* Error message */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-100">
            Page Not Found
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
            The page you&apos;re looking for has been moved, deleted, or doesn&apos;t exist.
            It might be in a superposition of states until you observe it somewhere else.
          </p>
        </div>

        {/* Navigation options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className={cx(
              'px-8 py-3 rounded-lg font-medium transition-all',
              'bg-green-400 text-neutral-950 hover:bg-green-300',
              'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-neutral-950'
            )}
          >
            Return Home
          </Link>
          <Link
            href="/products"
            className={cx(
              'px-8 py-3 rounded-lg font-medium transition-all',
              'border-2 border-green-400 text-green-400 hover:bg-green-400/10',
              'focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-neutral-950'
            )}
          >
            Browse Products
          </Link>
        </div>

        {/* Debug info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-16 p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <div className="font-mono text-xs text-neutral-500 space-y-1">
              <div>Frame: {frameIndex + 1}/{ASCII_FRAMES.length}</div>
              <div>Pattern: {bitPattern}</div>
              <div>Timestamp: {new Date().toISOString()}</div>
            </div>
          </div>
        )}

        {/* Easter egg hint */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-neutral-600">
            {'// Inspired by Oxide Computer bitmask aesthetics'}
          </p>
        </div>
      </div>

      {/* Grid overlay (subtle) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(163, 230, 53, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(163, 230, 53, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}

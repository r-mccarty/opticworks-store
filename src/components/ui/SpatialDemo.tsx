"use client"

import { useEffect, useState } from "react"
import { Dog, Sofa, User } from "lucide-react"

type Entity = {
  id: number
  type: "human" | "pet" | "furniture"
  x: number
  y: number
  label: string
}

export function SpatialDemo() {
  const [entities, setEntities] = useState<Entity[]>([
    { id: 1, type: "human", x: 50, y: 50, label: "Dad (Reading)" },
    { id: 2, type: "pet", x: 30, y: 70, label: "Luna" },
    { id: 3, type: "furniture", x: 50, y: 20, label: "Sofa" },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setEntities((prev) =>
        prev.map((entity) => {
          if (entity.type === "furniture") return entity
          const moveX = (Math.random() - 0.5) * 2
          const moveY = (Math.random() - 0.5) * 2

          return {
            ...entity,
            x: Math.max(10, Math.min(90, entity.x + moveX)),
            y: Math.max(10, Math.min(90, entity.y + moveY)),
          }
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-900 shadow-2xl md:aspect-[16/9]">
      <div
        className="perspective-grid absolute inset-0 z-0"
        style={{ transformOrigin: "bottom" }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent opacity-30 animate-scan" />

      <div className="absolute left-1/2 bottom-10 z-20 -translate-x-1/2">
        <div className="h-0 w-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
      </div>

      {entities.map((entity) => (
        <div
          key={entity.id}
          className="absolute z-20 flex flex-col items-center transition-all duration-1000 ease-in-out"
          style={{ left: `${entity.x}%`, top: `${entity.y}%` }}
        >
          <div className="relative">
            {entity.type === "human" && (
              <User className="h-8 w-8 text-white drop-shadow-lg" />
            )}
            {entity.type === "pet" && (
              <Dog className="h-6 w-6 text-amber-300 drop-shadow-lg" />
            )}
            {entity.type === "furniture" && (
              <Sofa className="h-10 w-10 text-neutral-600" />
            )}

            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-amber-500/30 bg-black/60 px-2 py-1 text-[10px] tracking-wider text-amber-500 uppercase opacity-80 backdrop-blur transition-opacity group-hover:opacity-100">
              {entity.label}
            </div>

            <div className="absolute -bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rounded-full bg-amber-500/20 blur-md" />
          </div>
        </div>
      ))}

      <div className="absolute top-6 left-6 z-30 flex flex-col gap-1 font-mono text-xs text-amber-500">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
          <span>LIDAR ACTIVE</span>
        </div>
        <span className="text-neutral-500">FPS: 60 | OBJECTS: {entities.length}</span>
        <span className="text-neutral-500">INFERENCE: LOCAL (NPU)</span>
      </div>

      <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full opacity-20">
        <path d="M 0 100 Q 50 50 100 100" stroke="white" fill="none" />
      </svg>
    </div>
  )
}

export default SpatialDemo

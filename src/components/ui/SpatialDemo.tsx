"use client"

import { useEffect, useState } from "react"
import { User, Dog, Sofa } from "lucide-react"

// Entity types for the radar visualization
type EntityType = "human" | "pet" | "furniture" | "device"

interface Entity {
  id: string
  type: EntityType
  x: number
  y: number
  label: string
}

// Initial entity positions (percentage of container)
const initialEntities: Entity[] = [
  { id: "human1", type: "human", x: 35, y: 40, label: "Person" },
  { id: "pet1", type: "pet", x: 65, y: 55, label: "Pet" },
  { id: "furniture1", type: "furniture", x: 20, y: 70, label: "Sofa" },
  { id: "device1", type: "device", x: 75, y: 25, label: "TV" },
]

// Smooth random movement within bounds
function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t
}

function getRandomTarget(current: number, range: number = 15) {
  const min = Math.max(10, current - range)
  const max = Math.min(90, current + range)
  return min + Math.random() * (max - min)
}

export function SpatialDemo() {
  const [entities, setEntities] = useState<Entity[]>(initialEntities)
  const [targets, setTargets] = useState<{ [key: string]: { x: number; y: number } }>({})

  // Initialize targets
  useEffect(() => {
    const newTargets: { [key: string]: { x: number; y: number } } = {}
    initialEntities.forEach((entity) => {
      newTargets[entity.id] = { x: entity.x, y: entity.y }
    })
    setTargets(newTargets)
  }, [])

  // Animate entity movement
  useEffect(() => {
    const moveInterval = setInterval(() => {
      setEntities((prev) =>
        prev.map((entity) => {
          const target = targets[entity.id]
          if (!target) return entity

          // Smooth interpolation towards target
          const newX = lerp(entity.x, target.x, 0.05)
          const newY = lerp(entity.y, target.y, 0.05)

          return { ...entity, x: newX, y: newY }
        })
      )
    }, 50)

    // Update targets periodically (only for human and pet)
    const targetInterval = setInterval(() => {
      setTargets((prev) => {
        const newTargets = { ...prev }
        entities.forEach((entity) => {
          if (entity.type === "human" || entity.type === "pet") {
            newTargets[entity.id] = {
              x: getRandomTarget(entity.x),
              y: getRandomTarget(entity.y),
            }
          }
        })
        return newTargets
      })
    }, 3000)

    return () => {
      clearInterval(moveInterval)
      clearInterval(targetInterval)
    }
  }, [entities, targets])

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case "human":
        return <User className="w-5 h-5" />
      case "pet":
        return <Dog className="w-4 h-4" />
      case "furniture":
        return <Sofa className="w-5 h-5" />
      case "device":
        return <Sofa className="w-4 h-4" />
    }
  }

  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case "human":
        return "text-amber-500 bg-amber-500/20 border-amber-500/40"
      case "pet":
        return "text-green-500 bg-green-500/20 border-green-500/40"
      case "furniture":
        return "text-neutral-400 bg-neutral-500/20 border-neutral-500/40"
      case "device":
        return "text-blue-500 bg-blue-500/20 border-blue-500/40"
    }
  }

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Background glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 via-transparent to-amber-500/5 blur-xl" />

      {/* Main container */}
      <div className="relative w-full h-full rounded-2xl border border-white/10 bg-neutral-950/80 backdrop-blur-sm overflow-hidden">
        {/* Perspective grid floor */}
        <div className="perspective-grid absolute inset-x-0 bottom-0 h-1/2 origin-bottom" />

        {/* Radar concentric circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute rounded-full border border-amber-500/10"
              style={{
                width: `${i * 22}%`,
                height: `${i * 22}%`,
              }}
            />
          ))}
        </div>

        {/* Radar sweep line */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="radar-scan absolute inset-x-0 h-24 opacity-40" />
        </div>

        {/* Center marker (sensor) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse-slow" />
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-amber-500/50 animate-ping" />
        </div>

        {/* Entities */}
        {entities.map((entity) => (
          <div
            key={entity.id}
            className="absolute transition-all duration-200 ease-out"
            style={{
              left: `${entity.x}%`,
              top: `${entity.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Ground shadow */}
            <div
              className="absolute left-1/2 top-full -translate-x-1/2 w-6 h-2 rounded-full bg-black/30 blur-sm"
              style={{ marginTop: "2px" }}
            />

            {/* Entity icon */}
            <div
              className={`relative flex items-center justify-center w-8 h-8 rounded-full border ${getEntityColor(
                entity.type
              )}`}
            >
              {getEntityIcon(entity.type)}
            </div>

            {/* Label */}
            <div className="absolute left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded bg-neutral-900/90 border border-white/10 whitespace-nowrap">
              <span className="text-[10px] font-mono text-neutral-300">{entity.label}</span>
            </div>
          </div>
        ))}

        {/* Status overlay */}
        <div className="absolute top-3 left-3 space-y-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-neutral-900/80 border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-500 tracking-wider">LIDAR ACTIVE</span>
          </div>
        </div>

        <div className="absolute top-3 right-3 space-y-1 text-right">
          <div className="px-2 py-1 rounded bg-neutral-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-neutral-500">FPS: </span>
            <span className="text-[10px] font-mono text-amber-500">60</span>
          </div>
          <div className="px-2 py-1 rounded bg-neutral-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-neutral-500">INFERENCE: </span>
            <span className="text-[10px] font-mono text-blue-500">LOCAL (NPU)</span>
          </div>
        </div>

        {/* Bottom coordinates display */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <div className="px-2 py-1 rounded bg-neutral-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-neutral-500">ENTITIES: </span>
            <span className="text-[10px] font-mono text-amber-500">{entities.length}</span>
          </div>
          <div className="px-2 py-1 rounded bg-neutral-900/80 border border-white/5">
            <span className="text-[10px] font-mono text-neutral-500">ZONE: </span>
            <span className="text-[10px] font-mono text-neutral-300">LIVING_ROOM</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpatialDemo

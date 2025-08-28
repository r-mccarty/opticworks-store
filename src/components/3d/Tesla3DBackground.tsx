'use client'

import Scene from './Scene'
import TeslaModel from './TeslaModel'

export default function Tesla3DBackground() {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Scene className="w-full h-full">
        <TeslaModel />
      </Scene>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_60%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  )
}

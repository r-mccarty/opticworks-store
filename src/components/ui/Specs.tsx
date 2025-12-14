"use client"

import Link from "next/link"
import { Layers, Server, Wifi } from "lucide-react"
import Image from "next/image"

export function Specs() {
  const product = {
    name: "OpticWorks OW-1 Developer Kit",
    price: 89,
    description: "Includes 1x Sensor Node, USB-C Cable, Wall Mount.",
  }

  return (
    <section id="specs" className="bg-[#e5e5e5] py-24 text-neutral-900">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-6 lg:grid-cols-2">
        <div className="group relative aspect-square overflow-hidden rounded-3xl bg-neutral-200 shadow-2xl">
          <Image
            src="/images/stock/ow1-devkit.webp"
            alt="OpticWorks OW-1 Developer Kit"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover mix-blend-multiply opacity-80 transition-transform duration-700 group-hover:scale-105"
            priority
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-neutral-200/50 to-transparent" />
          <div className="absolute bottom-8 left-8">
            <h3 className="font-display text-4xl font-bold tracking-tight text-neutral-900">
              OW-1
            </h3>
            <p className="text-neutral-600">Spatial Node</p>
          </div>
        </div>

        <div>
          <h2 className="mb-12 font-display text-4xl font-medium tracking-tight md:text-5xl">
            Designed to disappearance.
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-6 border-b border-neutral-300 pb-8">
              <Layers className="mt-1 h-8 w-8 text-neutral-400" />
              <div>
                <h4 className="mb-2 text-xl font-bold">60GHz mmWave Radar</h4>
                <p className="text-neutral-600">
                  Automotive-grade resolution. Capable of detecting breathing
                  from 5 meters away and tracking up to 5 people simultaneously.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 border-b border-neutral-300 pb-8">
              <Server className="mt-1 h-8 w-8 text-neutral-400" />
              <div>
                <h4 className="mb-2 text-xl font-bold">Dual-Core RISC-V</h4>
                <p className="text-neutral-600">
                  Dedicated NPU for running lightweight spatial models. No data
                  leaves the device unless you want it to.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6 pb-8">
              <Wifi className="mt-1 h-8 w-8 text-neutral-400" />
              <div>
                <h4 className="mb-2 text-xl font-bold">Matter over Thread</h4>
                <p className="text-neutral-600">
                  Seamlessly joins your mesh network. Extremely low power
                  consumption allows for months of battery life, or run wired
                  via USB-C.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-medium">{product.name}</span>
              <span className="text-2xl font-bold">${product.price}</span>
            </div>
            <p className="mb-6 text-sm text-neutral-500">
              {product.description}
            </p>
            <Link
              href="/store"
              className="block w-full rounded-lg bg-amber-500 py-4 text-center font-bold text-black transition-colors hover:bg-amber-400 active:scale-[0.98]"
            >
              Add to Cart
            </Link>
            <div className="mt-4 text-center text-xs text-neutral-400">
              Ships Q4 2025. Limited Batch.
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Specs

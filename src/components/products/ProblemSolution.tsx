import { FadeDiv } from "@/components/Fade"
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline"

const painPoints = [
  {
    title: "PIR & motion sensors",
    detail: "Trigger on fans, pets, and hallway movement. Clear the bed the moment you stop moving.",
  },
  {
    title: "Bed mats & pressure pads",
    detail: "Uncomfortable, require tucking wires under mattresses, and drift over time.",
  },
  {
    title: "Camera-based presence",
    detail: "Invades privacy and requires cloud AI. Latency plus a constant data stream from your bedroom.",
  },
]

const solutions = [
  "4-state engine waits for sustained change before toggling ON or OFF.",
  "Absolute Clear Delay remembers the last confident reading so still sleepers stay counted.",
  "Still-energy sensing ignores fans and cats but loves humans under blankets.",
  "Every threshold, debounce, and debug string is visible in Home Assistant.",
]

export function ProblemSolution() {
  return (
    <div className="bg-slate-950 py-16 text-white">
      <div className="px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
              Traditional sensors watch for motion. We watch for presence.
            </h2>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8">
                <div className="mb-6 flex items-center gap-3 text-red-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500">
                    <XMarkIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">Why legacy sensors fail</h3>
                </div>
                <div className="space-y-4 text-sm text-red-100">
                  {painPoints.map((pain) => (
                    <div key={pain.title} className="rounded-xl border border-red-400/20 p-4">
                      <p className="font-semibold text-white">{pain.title}</p>
                      <p className="mt-1 text-red-100/80">{pain.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-8">
                <div className="mb-6 flex items-center gap-3 text-emerald-200">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500">
                    <CheckIcon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white">How the Bed Presence Sensor fixes it</h3>
                </div>
                <div className="space-y-4 text-sm text-emerald-50">
                  {solutions.map((line) => (
                    <div key={line} className="flex items-start gap-3">
                      <CheckIcon className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                      <p>{line}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/20 p-4 text-sm">
                  “It&apos;s the first sensor that understands the context of a bedroom. Calm when you&apos;re still, decisive when you&apos;re gone.”
                </div>
              </div>
            </div>
          </FadeDiv>
        </div>
      </div>
    </div>
  )
}

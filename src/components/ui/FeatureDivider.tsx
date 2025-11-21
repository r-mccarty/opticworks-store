import { Divider } from "../Divider"

export default function FeatureDivider({ className }: { className?: string }) {
  return (
    <Divider className={className}>
      <div className="relative h-px w-full max-w-lg overflow-hidden rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent">
        <div className="absolute left-1/2 top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.6)]" />
      </div>
    </Divider>
  )
}

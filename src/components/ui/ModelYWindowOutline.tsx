import { cx } from "@/lib/utils"

interface ModelYWindowOutlineProps {
  className?: string
}

export function ModelYWindowOutline({ className }: ModelYWindowOutlineProps) {
  return (
    <div className={cx("w-full max-w-md", className)}>
      <svg
        viewBox="0 0 400 200"
        className="h-auto w-full"
        fill="none"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M30 150H370L350 120L300 100H100L70 120Z"
          stroke="#4b5563"
        />
        <path
          d="M110 110H290L320 135H90Z"
          stroke="#0ea5e9"
          strokeDasharray="600"
          strokeDashoffset="600"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="600"
            to="0"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  )
}

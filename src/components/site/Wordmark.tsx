import Image from "next/image"

import { cx } from "@/lib/utils"

export function Wordmark({ className }: { className?: string }) {
  return (
    <Image
      src="/brand/opticworks-wordmark.svg?v=2"
      alt="OpticWorks"
      width={880}
      height={140}
      unoptimized
      className={cx("block h-auto w-44 shrink-0 sm:w-48", className)}
    />
  )
}

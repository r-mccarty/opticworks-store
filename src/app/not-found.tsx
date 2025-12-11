import { Button } from "@/components/Button"
import { AsciiAnimation } from "@/components/ui/AsciiAnimation"
import Link from "next/link"
import { siteConfig } from "./siteConfig"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 dark:from-gray-900 dark:to-gray-950">
      <div className="flex flex-col items-center space-y-8">
        {/* ASCII Art Animation */}
        <div className="rounded-lg border border-gray-300 bg-white/50 p-6 shadow-lg backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50">
          <AsciiAnimation />
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            The page you&apos;re looking for has no presence signature.
          </p>
        </div>

        {/* Action Button */}
        <Button asChild className="group" variant="light">
          <Link href={siteConfig.baseLinks.home}>Return to Home</Link>
        </Button>
      </div>
    </div>
  )
}

import { Button } from "@/components/Button"
import { AsciiAnimation } from "@/components/ui/AsciiAnimation"
import Link from "next/link"
import { siteConfig } from "./siteConfig"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/40 px-4 text-foreground">
      <div className="flex flex-col items-center space-y-8">
        {/* ASCII Art Animation */}
        <div className="rounded-lg border border-border bg-card/50 p-6 shadow-elevation-2 backdrop-blur-sm">
          <AsciiAnimation />
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
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

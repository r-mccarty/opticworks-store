import { Button } from "@/components/ui/button";
import { AsciiAnimation } from "@/components/ui/AsciiAnimation";
import Link from "next/link";
import { siteConfig } from "./siteConfig";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center space-y-8">
        {/* ASCII Art Animation */}
        <div className="rounded-2xl border border-border bg-background-elevated p-6 shadow-lg">
          <AsciiAnimation />
        </div>

        {/* Error Message */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">
            Page Not Found
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            The page you&apos;re looking for has no presence signature.
          </p>
        </div>

        {/* Action Button */}
        <Button asChild className="group" variant="outline">
          <Link href={siteConfig.baseLinks.home}>Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}

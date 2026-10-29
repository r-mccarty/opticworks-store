import { siteConfig } from "@/app/siteConfig"

interface SupportEmailCardProps {
  title: string
  /** What the customer should include in their email. */
  include: string[]
}

/**
 * Email-based support while the website has no working form or backend.
 * Messages go directly to the support mailbox; nothing is submitted via this site.
 */
export function SupportEmailCard({ title, include }: SupportEmailCardProps) {
  const { email } = siteConfig.contact

  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-elevation-1">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <p className="mt-3 text-muted-foreground">
        Email us at{" "}
        <a href={`mailto:${email}`} className="font-medium text-foreground underline underline-offset-4">
          {email}
        </a>
        . Please include:
      </p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-muted-foreground">
        {include.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        Online forms, order lookup and account features are temporarily unavailable
        while we rebuild our website.
      </p>
    </div>
  )
}

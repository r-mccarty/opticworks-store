import { siteConfig } from "@/app/siteConfig"
import { ArrowLink, Container } from "@/components/site/primitives"

interface ServiceUnavailableProps {
  title: string
  description: string
}

/**
 * Shown on legacy store, account and order routes while commerce is offline.
 * See src/lib/commerce.ts.
 */
export function ServiceUnavailable({ title, description }: ServiceUnavailableProps) {
  const { email } = siteConfig.contact

  return (
    <main>
      <Container className="flex min-h-[70vh] items-center py-24">
        <div className="max-w-2xl">
          <p className="annotation">Temporarily unavailable</p>
          <h1 className="mt-4 text-4xl font-light tracking-tight text-text sm:text-5xl">{title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-text-muted">{description}</p>
          <p className="mt-4 leading-relaxed text-text-muted">
            For questions about an existing order or device, email{" "}
            <a href={`mailto:${email}`} className="text-text underline decoration-line-strong underline-offset-4 hover:decoration-amber">
              {email}
            </a>
            .
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <ArrowLink href={siteConfig.baseLinks.products} variant="primary">
              Our products
            </ArrowLink>
            <ArrowLink href={siteConfig.baseLinks.home} variant="secondary">
              Return home
            </ArrowLink>
          </div>
        </div>
      </Container>
    </main>
  )
}

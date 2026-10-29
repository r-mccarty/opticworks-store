import { ArrowLink, Container } from "@/components/site/primitives"
import { RegistrationMark } from "@/components/site/visuals"

export default function NotFound() {
  return (
    <main>
      <Container className="flex min-h-[70vh] flex-col items-start justify-center py-24">
        <RegistrationMark className="text-amber" size={28} />
        <p className="annotation mt-8">Error 404</p>
        <h1 className="mt-4 text-4xl font-light tracking-tight text-text sm:text-5xl">This page isn&apos;t here.</h1>
        <p className="mt-4 max-w-xl text-text-muted">
          It may have moved when we rebuilt the site, or the address may be mistyped.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <ArrowLink href="/" variant="primary">
            Go to the homepage
          </ArrowLink>
          <ArrowLink href="/products" variant="secondary">
            Our products
          </ArrowLink>
        </div>
      </Container>
    </main>
  )
}

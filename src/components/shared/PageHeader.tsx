interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mx-auto flex max-w-4xl flex-col items-start gap-6 text-left">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
        {eyebrow}
      </span>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
      </div>
    </header>
  )
}

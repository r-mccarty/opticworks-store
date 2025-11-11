import { PageHeader } from "@/components/shared/PageHeader"
import { comparisonTable } from "@/lib/marketingContent"

const competitors = ['OpticWorks', 'Pressure Mats', 'PIR Sensors', 'mmWave Alternatives', 'Camera Solutions']

export default function ComparisonPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <PageHeader
        eyebrow="comparison"
        title="Why smart homes choose OpticWorks"
        description="Evaluate OpticWorks against common presence solutions across accuracy, transparency, privacy, and integration depth."
      />
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_40px_140px_-80px_rgba(15,23,42,0.4)]">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-900 text-xs font-semibold uppercase tracking-[0.3em] text-white">
            <tr>
              <th scope="col" className="px-6 py-4">Criterion</th>
              {competitors.map((competitor) => (
                <th key={competitor} scope="col" className="px-6 py-4">
                  {competitor}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {comparisonTable.map((row) => (
              <tr key={row.criterion} className="odd:bg-slate-50/60">
                <th scope="row" className="px-6 py-4 text-sm font-semibold text-slate-900">
                  {row.criterion}
                </th>
                <td className="px-6 py-4 text-slate-900">{row.opticWorks}</td>
                <td className="px-6 py-4">{row.pressureMats}</td>
                <td className="px-6 py-4">{row.pirSensors}</td>
                <td className="px-6 py-4">{row.mmwaveAlternatives}</td>
                <td className="px-6 py-4">{row.cameraSolutions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-100 bg-white/90 p-8">
          <h2 className="text-xl font-semibold text-slate-900">Total cost of ownership</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            OpticWorks ships as a kit with provisioning scripts. You get a known deployment pattern, ongoing OTA updates, and support for multi-bed installations.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-slate-900 p-8 text-white">
          <h2 className="text-xl font-semibold">Privacy position</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            No cameras. No external cloud analytics. Local decisions streamed through a Worker BFF that you control.
          </p>
        </div>
      </section>
    </div>
  )
}

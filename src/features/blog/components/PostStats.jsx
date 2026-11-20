export default function PostStats({ stats }) {
  const items = [
    { label: 'Total Artikel', value: stats.total },
    { label: 'Total Terbit', value: stats.published },
    { label: 'Belum Selesai (Draf)', value: stats.draft },
  ]
  return (
    <section aria-label="Statistik artikel" className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="card p-4">
          <p className="muted text-sm font-medium">{item.label}</p>
          <p className="mt-1 text-3xl font-bold">{item.value}</p>
        </div>
      ))}
    </section>
  )
}

export default function VehicleCatalogLoading() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="space-y-2">
          <div className="h-9 w-48 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-full max-w-2xl animate-pulse rounded-full bg-muted" />
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-5 shadow-sm">
                <div className="space-y-1">
                  <div className="h-6 w-36 animate-pulse rounded-full bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-8 w-28 animate-pulse rounded-full bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

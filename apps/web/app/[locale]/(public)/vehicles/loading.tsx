export default function VehicleCatalogLoading() {
  return (
    <main className="overflow-x-hidden min-h-screen">
      <div className="bg-foreground pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="h-3 w-24 animate-pulse rounded-full bg-white/10" />
          <div className="h-12 w-96 max-w-full animate-pulse rounded-xl bg-white/10" />
          <div className="h-4 w-80 max-w-full animate-pulse rounded-full bg-white/10" />
          <div className="flex gap-8 pt-6 border-t border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1">
                <div className="h-6 w-12 animate-pulse rounded-full bg-white/10" />
                <div className="h-3 w-20 animate-pulse rounded-full bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 py-12 max-w-7xl mx-auto">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <div className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden">
                <div className="h-52 animate-pulse bg-muted" />
                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <div className="h-5 w-40 animate-pulse rounded-full bg-muted" />
                    <div className="h-3.5 w-24 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-9 animate-pulse rounded-xl bg-muted" />
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                    <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                  </div>
                  <div className="h-11 animate-pulse rounded-xl bg-muted" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

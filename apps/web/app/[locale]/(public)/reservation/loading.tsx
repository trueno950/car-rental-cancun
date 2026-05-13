import { MapSkeleton } from "@features/map";
import { MotionSkeleton } from "@shared/components/motion";

export default function ReservationLoading() {
  return (
    <main className="min-h-screen bg-muted/30 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            <MotionSkeleton className="h-6 w-44 rounded-full" />
            <MotionSkeleton className="h-10 w-72 rounded-full" />
            <MotionSkeleton className="h-4 w-full max-w-3xl rounded-full" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-5">
              <MotionSkeleton className="h-24 w-full rounded-[1.5rem]" />
              <MotionSkeleton className="h-24 w-full rounded-[1.5rem]" />
              <MotionSkeleton className="h-72 w-full rounded-[1.75rem]" />
              <MotionSkeleton className="h-11 w-48 rounded-full" />
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-border/60 bg-muted/30 p-5">
              <MotionSkeleton className="h-20 w-full rounded-[1.5rem]" />
              <MotionSkeleton className="h-32 w-full rounded-[1.5rem]" />
            </div>
          </div>
        </section>

        <MapSkeleton />
      </div>
    </main>
  );
}

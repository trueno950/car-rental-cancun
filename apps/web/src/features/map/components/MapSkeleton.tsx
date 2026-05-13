import { MapPinnedIcon } from "lucide-react";

import { MotionSkeleton } from "@shared/components/motion";

export function MapSkeleton() {
  return (
    <section className="space-y-6 rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <MotionSkeleton className="h-7 w-56 rounded-full" />
          <MotionSkeleton className="h-4 w-full max-w-2xl rounded-full" />
          <MotionSkeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <MapPinnedIcon className="size-3.5" aria-hidden="true" />
          <MotionSkeleton className="h-3 w-14 rounded-full bg-primary/20" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-muted/20">
          <MotionSkeleton className="h-[24rem] w-full rounded-none" />
        </div>

        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-[1.5rem] border border-border/70 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <MotionSkeleton className="size-10 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-2">
                  <MotionSkeleton className="h-4 w-32 rounded-full" />
                  <MotionSkeleton className="h-4 w-full rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

"use client";

import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MAX_ATTEMPTS = 10;
const POLL_INTERVAL_MS = 2500;

export interface BookingConfirmationPollerCopy {
  pendingHeading: string;
  pendingHelper: string;
  timeoutHeading: string;
  timeoutHelper: string;
  viewBooking: string;
}

interface BookingConfirmationPollerProps {
  bookingId: string;
  locale: string;
  copy: BookingConfirmationPollerCopy;
}

export function BookingConfirmationPoller({
  bookingId,
  locale,
  copy,
}: BookingConfirmationPollerProps) {
  const router = useRouter();
  const [attempts, setAttempts] = useState(0);
  const timedOut = attempts >= MAX_ATTEMPTS;

  useEffect(() => {
    if (timedOut) return;

    const interval = setInterval(() => {
      setAttempts((a) => a + 1);
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [timedOut, router]);

  if (timedOut) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
          <TriangleAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {copy.timeoutHeading}
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            {copy.timeoutHelper}
          </p>
        </div>
        <Link
          href={`/${locale}/bookings/${bookingId}`}
          className="rounded-2xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {copy.viewBooking}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="h-14 w-14 animate-spin rounded-full border-4 border-muted border-t-primary" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {copy.pendingHeading}
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          {copy.pendingHelper}
        </p>
      </div>
    </div>
  );
}

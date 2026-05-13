interface FormErrorSummaryProps {
  message?: string | null;
}

export function FormErrorSummary({ message }: FormErrorSummaryProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <p className="font-medium">We couldn&apos;t process the reservation request.</p>
      <p className="mt-1 text-destructive/80">{message}</p>
    </div>
  );
}

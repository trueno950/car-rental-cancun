import type { DepositCallToActionProps } from "../types";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function DepositCallToAction({
  depositAmount,
  totalPrice,
  copy,
}: DepositCallToActionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <p className="mb-3 text-sm text-muted-foreground">{copy.helper}</p>
      <dl className="space-y-2">
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">{copy.totalLabel}</dt>
          <dd className="font-medium">{formatCurrency(totalPrice)}</dd>
        </div>
        <div className="flex justify-between text-sm">
          <dt className="text-muted-foreground">{copy.depositLabel}</dt>
          <dd className="font-semibold text-primary">
            {formatCurrency(depositAmount)}
          </dd>
        </div>
      </dl>
    </div>
  );
}

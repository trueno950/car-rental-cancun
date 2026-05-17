import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p
        className="font-bold text-muted-foreground/20 select-none leading-none mb-8"
        style={{ fontSize: "clamp(6rem, 18vw, 14rem)" }}
        aria-hidden="true"
      >
        404
      </p>
      <div className="space-y-3 -mt-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Página no encontrada
        </h1>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
          Esta página no existe o fue movida. Volvé al inicio y seguí explorando la flota.
        </p>
      </div>
      <div className="flex gap-3 mt-10">
        <Link
          href="/es"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Ir al inicio
        </Link>
        <Link
          href="/es/vehicles"
          className="inline-flex items-center rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-muted transition-colors"
        >
          Ver flota
        </Link>
      </div>
    </main>
  );
}

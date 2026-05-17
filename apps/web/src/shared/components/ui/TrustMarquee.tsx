import { ShieldCheck, MapPin, Clock, Star, CreditCard, Car } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "Seguro incluido" },
  { icon: MapPin, text: "Entrega en aeropuerto" },
  { icon: Clock, text: "Confirmación en minutos" },
  { icon: Star, text: "4.9 estrellas en Google" },
  { icon: CreditCard, text: "Sin cargos ocultos" },
  { icon: Car, text: "Flota 2022–2024" },
  { icon: ShieldCheck, text: "Seguro incluido" },
  { icon: MapPin, text: "Entrega en aeropuerto" },
  { icon: Clock, text: "Confirmación en minutos" },
  { icon: Star, text: "4.9 estrellas en Google" },
  { icon: CreditCard, text: "Sin cargos ocultos" },
  { icon: Car, text: "Flota 2022–2024" },
];

export function TrustMarquee() {
  return (
    <div className="border-y border-border/60 bg-muted/20 py-4 overflow-hidden">
      <div
        className="flex gap-12 whitespace-nowrap"
        style={{
          animation: "marquee 28s linear infinite",
          willChange: "transform",
        }}
      >
        {TRUST_ITEMS.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground font-medium flex-shrink-0"
          >
            <item.icon className="h-4 w-4 text-primary flex-shrink-0" />
            {item.text}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

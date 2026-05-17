"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@shared/lib";

type NavBarProps = {
  locale: string;
  session: { user?: { role?: string } | null } | null;
  navLabels: {
    vehicles: string;
    myBookings: string;
    adminVehicles: string;
    signIn: string;
    signOut: string;
  };
  signOutAction: () => Promise<void>;
};

export function NavBar({ locale, session, navLabels, signOutAction }: NavBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isAdmin =
    session?.user?.role === "manager" || session?.user?.role === "admin";

  return (
    <header className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-4">
      <nav
        className={cn(
          "flex items-center justify-between gap-8 rounded-full px-6 py-3 transition-all duration-300 w-full max-w-5xl",
          scrolled
            ? "bg-background/90 backdrop-blur-xl shadow-md border border-border"
            : "bg-background/60 backdrop-blur-md border border-border/50"
        )}
      >
        <Link
          href={`/${locale}`}
          className="text-sm font-bold tracking-tight text-foreground"
        >
          CancunRent
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <Link
            href={`/${locale}/vehicles`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {navLabels.vehicles}
          </Link>
          {session && (
            <Link
              href={`/${locale}/bookings`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {navLabels.myBookings}
            </Link>
          )}
          {isAdmin && (
            <Link
              href={`/${locale}/admin/vehicles`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {navLabels.adminVehicles}
            </Link>
          )}
        </div>

        <div>
          {session ? (
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full bg-muted px-4 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                {navLabels.signOut}
              </button>
            </form>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {navLabels.signIn}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

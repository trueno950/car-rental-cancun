"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Car, Users } from "lucide-react";

import { cn } from "@shared/lib";

type AdminSidebarProps = {
  locale: string;
  labels: {
    bookings: string;
    fleet: string;
    users: string;
  };
};

export function AdminSidebar({ locale, labels }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/${locale}/admin/bookings`,
      label: labels.bookings,
      Icon: BookOpen,
    },
    {
      href: `/${locale}/admin/vehicles`,
      label: labels.fleet,
      Icon: Car,
    },
    {
      href: `/${locale}/admin/users`,
      label: labels.users,
      Icon: Users,
    },
  ];

  return (
    <aside className="w-56 shrink-0 self-start sticky top-[57px] h-[calc(100vh-57px)] border-r border-border bg-sidebar overflow-y-auto">
      <nav className="p-3 space-y-1">
        {navItems.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith(href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

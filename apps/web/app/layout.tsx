import type { ReactNode } from "react";

import { getWebEnv } from "../env";

import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@shared/lib";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  const env = getWebEnv();

  return (
    <html lang="es" className={cn("font-sans", inter.variable)}>
      <body
        className="min-h-screen bg-background font-sans text-foreground antialiased"
        data-site-url={env.NEXT_PUBLIC_SITE_URL}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";
import { PwaRegister } from "@/components/pwa-register";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "MistriHub - Trusted Workers Near You",
  description: "Book nearby trusted electricians, plumbers, mechanics, painters, AC technicians and repair workers.",
  applicationName: "MistriHub",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f5cff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <SiteHeader />
        {children}
        <BottomNav />
        <InstallPrompt />
      </body>
    </html>
  );
}

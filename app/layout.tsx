import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { InstallPrompt } from "@/components/install-prompt";
import { LocationPopup } from "@/components/location-popup";
import { PwaRegister } from "@/components/pwa-register";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mistrihub-radar.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MistriHub.In - Nearby Trusted Workers for Home Services",
    template: "%s | MistriHub.In"
  },
  description: "Find nearby trusted electricians, plumbers, mechanics, painters, AC repair workers, carpenters, drivers and helpers. Book local workers with contact unlock after acceptance.",
  applicationName: "MistriHub.In",
  keywords: [
    "nearby workers",
    "nearby electrician",
    "nearby plumber",
    "local mechanic",
    "AC repair near me",
    "painter near me",
    "carpenter near me",
    "labour helper",
    "driver near me",
    "home service worker",
    "MistriHub.In"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "MistriHub.In - Nearby Trusted Workers",
    description: "Book local electricians, plumbers, mechanics, painters and repair workers near your area.",
    url: siteUrl,
    siteName: "MistriHub.In",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MistriHub.In - Nearby Trusted Workers",
    description: "Find and book nearby trusted workers for Indian home services."
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  themeColor: "#0f5cff",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PwaRegister />
        <SiteHeader />
        {children}
        <SiteFooter />
        <BottomNav />
        <LocationPopup />
        <InstallPrompt />
      </body>
    </html>
  );
}

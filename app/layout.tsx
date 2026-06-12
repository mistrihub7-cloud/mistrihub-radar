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
    default: "MistriHub.In - Nearby Workers, Electricians, Plumbers & Trusted Professionals",
    template: "%s | MistriHub.In"
  },
  description: "Find nearby trusted workers, electricians, plumbers, mechanics, painters, AC repair experts, carpenters, mistri and local service professionals. Book with contact unlock after acceptance.",
  applicationName: "MistriHub.In",
  keywords: [
    "nearby professionals",
    "nearby workers",
    "worker near me",
    "mistri near me",
    "electrician near me",
    "plumber near me",
    "mechanic near me",
    "labour near me",
    "nearby electrical expert",
    "nearby plumbing expert",
    "local mechanic",
    "AC repair near me",
    "painter near me",
    "carpenter near me",
    "skilled professional",
    "driver near me",
    "home service professional",
    "MistriHub.In"
  ],
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "MistriHub.In - Nearby Trusted Workers & Professionals",
    description: "Book local workers, electricians, plumbers, mechanics, painting professionals and repair experts near your area.",
    url: siteUrl,
    siteName: "MistriHub.In",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MistriHub.In - Nearby Trusted Workers & Professionals",
    description: "Find and book nearby trusted workers and professionals for Indian home services."
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

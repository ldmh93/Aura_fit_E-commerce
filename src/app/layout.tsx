import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { MetaPixel, GoogleAnalytics } from "@/components/analytics/Analytics";
import { SITE } from "@/lib/config";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    "ropa deportiva",
    "performance wear",
    "ropa fitness premium",
    "leggings deportivos",
    "playera de compresión",
    "AURA FIT",
  ],
  authors: [{ name: SITE.name }],
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [{ url: SITE.logo, width: 1240, height: 1240, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [SITE.logo],
  },
  robots: { index: true, follow: true },
  icons: { icon: SITE.logo, apple: SITE.logo },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={geist.variable}>
      <body className="min-h-screen antialiased">
        {children}
        <MetaPixel />
        <GoogleAnalytics />
      </body>
    </html>
  );
}

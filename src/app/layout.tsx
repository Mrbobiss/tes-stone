import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { PwaProvider } from "@/components/pwa-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appDescription = "Prends un selfie, choisis ta ref, et découvre jusqu'où ton regard a quitté la conversation.";

export const metadata: Metadata = {
  title: "T'es stone ?",
  description: appDescription,
  applicationName: "T'es stone ?",
  keywords: [
    "test stone selfie",
    "stonometre",
    "analyse selfie fun",
    "vibe planante",
    "score stone",
    "mini app selfie",
    "carte partageable selfie",
  ],
  authors: [{ name: "Mrbobiss" }],
  creator: "Mrbobiss",
  publisher: "Mrbobiss",
  category: "entertainment",
  metadataBase: new URL("https://tes-stone.vercel.app"),
  manifest: "/manifest.webmanifest",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon", type: "image/png" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: "/icon", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "T'es stone ?",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "T'es stone ?",
    description: "Le stonomètre selfie qui juge ta vibe planante, version fun, partageable et totalement locale côté punchlines.",
    url: "https://tes-stone.vercel.app",
    type: "website",
    siteName: "T'es stone ?",
    locale: "fr_FR",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "T'es stone ?, mini app fun pour mesurer une vibe planante sur 100.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "T'es stone ?",
    description: "Mini-app mobile-first pour obtenir un score stone fun et une carte à partager.",
    images: ["/twitter-image"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fffaf5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <body className="min-h-full overflow-x-hidden bg-[linear-gradient(180deg,#fffaf5_0%,#fff9fd_45%,#f4fbff_100%)] text-zinc-950 antialiased">
        {children}
        <PwaProvider />
        <Analytics />
      </body>
    </html>
  );
}

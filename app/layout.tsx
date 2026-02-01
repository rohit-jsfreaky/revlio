import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// SEO Metadata
export const metadata: Metadata = {
  metadataBase: new URL("https://revlio.dev"),
  title: {
    default:
      "Revlio - Get Real Feedback for Your Projects | Feedback Economy Platform",
    template: "%s | Revlio",
  },
  description:
    "Revlio is a feedback economy platform for indie developers. Get guaranteed, structured feedback for your projects by contributing to the community. No fake engagement - just real, actionable reviews.",
  keywords: [
    "developer feedback",
    "project reviews",
    "indie developer",
    "side project feedback",
    "code review",
    "structured feedback",
    "developer community",
    "project showcase",
    "builder community",
    "feedback platform",
    "earn credits",
    "guaranteed reviews",
  ],
  authors: [{ name: "Revlio Team" }],
  creator: "Revlio",
  publisher: "Revlio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://revlio.dev",
    siteName: "Revlio",
    title: "Revlio - Get Real Feedback for Your Projects",
    description:
      "A feedback economy platform where developers earn credits by reviewing others to get guaranteed feedback on their own projects.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Revlio - Feedback Economy Platform for Developers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revlio - Get Real Feedback for Your Projects",
    description:
      "A feedback economy platform where developers earn credits by reviewing others to get guaranteed feedback on their own projects.",
    images: ["/og.png"],
    creator: "@revlio_dev",
    site: "@revlio_dev",
  },
  applicationName: "Revlio",
  generator: "Next.js",
  alternates: {
    canonical: "https://revlio.dev",
  },
  category: "Technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1520" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

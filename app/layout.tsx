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
  metadataBase: new URL("https://www.getrevlio.com"),
  title: {
    default:
      "Revlio - Developer Feedback Platform | Get Project Reviews & Code Feedback for Indie Developers",
    template: "%s | Revlio",
  },
  description:
    "Get real feedback for your projects. Revlio is a feedback economy platform where indie developers earn credits by reviewing others to get guaranteed, structured feedback on their own projects. Join thousands of builders getting actionable code reviews and project feedback.",
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
    "get feedback on project",
    "developer review platform",
    "code feedback",
    "project feedback tool",
    "indie developer community",
    "startup feedback",
    "side project reviews",
    "developer portfolio feedback",
    "get code reviews",
    "project critique",
    "developer networking",
    "build in public feedback",
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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/revlio_logo.png", type: "image/png", sizes: "32x32" },
      { url: "/revlio_logo.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/revlio_logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.getrevlio.com",
    siteName: "Revlio",
    title: "Revlio - Developer Feedback Platform | Get Project Reviews & Code Feedback",
    description:
      "Get real feedback for your projects. A feedback economy platform where indie developers earn credits by reviewing others to get guaranteed, structured feedback on their own projects.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Revlio - Developer Feedback Platform for Indie Developers and Builders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Revlio - Developer Feedback Platform | Get Project Reviews & Code Feedback",
    description:
      "Get real feedback for your projects. Join thousands of developers getting actionable code reviews and project feedback through our feedback economy platform.",
    images: ["/og.png"],
    creator: "@revlio_dev",
    site: "@revlio_dev",
  },
  other: {
    "twitter:domain": "getrevlio.com",
    "twitter:url": "https://www.getrevlio.com/",
    "og:image:secure_url": "https://www.getrevlio.com/og.png",
  },
  applicationName: "Revlio",
  generator: "Next.js",
  verification: {
    google: "b6f7c2enVZ4-58O3JBgrGgON1pqkkd_RCIXRngee2M4",
  },
  alternates: {
    canonical: "https://www.getrevlio.com",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Revlio",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1000"
    },
    "description": "A feedback economy platform where indie developers earn credits by reviewing others to get guaranteed, structured feedback on their own projects.",
    "url": "https://www.getrevlio.com",
    "logo": "https://www.getrevlio.com/revlio_logo.png",
    "screenshot": "https://www.getrevlio.com/og.png",
    "featureList": [
      "Get guaranteed feedback on your projects",
      "Earn credits by reviewing others",
      "Structured feedback format",
      "Developer community",
      "Project reviews and code feedback"
    ],
    "keywords": "developer feedback, project reviews, code review, indie developer, feedback platform, developer community"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Primary favicon for Google Search - must be accessible at root */}
        <link rel="icon" href="/favicon.ico" type="image/x-icon" sizes="any" />
        {/* PNG favicons for modern browsers */}
        <link rel="icon" href="/revlio_logo.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/revlio_logo.png" type="image/png" sizes="16x16" />
        {/* Apple touch icon */}
        <link rel="apple-touch-icon" href="/revlio_logo.png" sizes="180x180" />
        {/* Web manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

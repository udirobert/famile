import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { JsonLd } from "@/components/JsonLd";
import { siteGraphSchema } from "@/lib/schema";

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

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

const description =
  "famile is a suite of AI-native and AI-enabled health products built for the long arc of staying well. Meet Sukari — a daily companion for metabolic care — and Orbura — recovery intelligence for people and the teams around them.";

export const metadata: Metadata = {
  metadataBase: new URL("https://famile.xyz"),
  title: {
    default: "famile - a suite of health products, AI-native and AI-enabled",
    template: "%s · famile",
  },
  description,
  applicationName: "famile",
  authors: [{ name: "famile", url: "https://famile.xyz" }],
  creator: "famile",
  publisher: "famile",
  keywords: [
    "famile",
    "health AI",
    "metabolic care",
    "adherence",
    "recovery intelligence",
    "Sukari",
    "Orbura",
    "AI-native health",
    "AI-enabled care",
    "continuous care",
    "GLP-1",
    "prediabetes",
    "type 2 diabetes",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://famile.xyz",
    siteName: "famile",
    title: "famile - a suite of health products",
    description,
  },
  twitter: {
    card: "summary_large_image",
    title: "famile - a suite of health products",
    description,
    creator: "@famile",
  },
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
  manifest: "/manifest.webmanifest",
  category: "health",
};

export const viewport: Viewport = {
  themeColor: "#1a1438",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <JsonLd data={siteGraphSchema()} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

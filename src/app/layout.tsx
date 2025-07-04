import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Website Builder - Create Beautiful Websites with Drag & Drop",
    template: "Website Builder",
  },
  description:
    "Build stunning websites with our intuitive drag-and-drop website builder. Create professional hero sections, CTAs, and footers without coding. Export your designs instantly.",
  keywords: [
    "website builder",
    "drag and drop",
    "web design",
    "website creator",
    "landing page builder",
    "web development tool",
  ],
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
    url: "https://website-builder-git-main-riad-alnajjars-projects.vercel.app/",
    siteName: "Website Builder",
    title: "Website Builder - Create Beautiful Websites with Drag & Drop",
    description:
      "Build stunning websites with our intuitive drag-and-drop website builder. Create professional hero sections, CTAs, and footers without coding.",
    images: [
      {
        url: "https://website-builder-git-main-riad-alnajjars-projects.vercel.app/nasa_robert_stewart_spacewalk_2.jpg",
        width: 100,
        height: 100,
        alt: "Website Builder - Drag & Drop Website Creation Tool",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Website Builder - Create Beautiful Websites with Drag & Drop",
    description:
      "Build stunning websites with our intuitive drag-and-drop website builder. Create professional hero sections, CTAs, and footers without coding.",
    images: [
      "https://website-builder-riad-alnajjars-projects.vercel.app/nasa_robert_stewart_spacewalk_2.jpg",
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          property="twitter:image"
          content="https://website-builder-riad-alnajjars-projects.vercel.app/nasa_robert_stewart_spacewalk_2.jpg"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const description =
  "Shop Amazon.com from Nigeria. Paste a product link, get your total in naira, and we buy it, ship it and track it to your door.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "http://localhost:3000"),
  title: { default: "Shopbrow: Amazon, delivered to Nigeria", template: "%s | Shopbrow" },
  description,
  openGraph: {
    title: "Shopbrow: Amazon, delivered to Nigeria",
    description,
    siteName: "Shopbrow",
    type: "website",
    images: [{ url: "/logo.png", width: 727, height: 512, alt: "Shopbrow" }],
  },
  twitter: { card: "summary", title: "Shopbrow: Amazon, delivered to Nigeria", description },
};

export const viewport: Viewport = { themeColor: "#faf8f4" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={geistSans.variable + " " + geistMono.variable + " antialiased"}>{children}</body>
    </html>
  );
}

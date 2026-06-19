import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bluesea-cattery.ru"),
  title: {
    default: "Blue Sea — Питомник невских маскарадных кошек",
    template: "%s | Blue Sea",
  },
  description:
    "Питомник невских маскарадных кошек Blue Sea. Породистые котята с документами, чемпионы породы. Санкт-Петербург.",
  keywords: [
    "невская маскарадная",
    "питомник",
    "котята",
    "Blue Sea",
    "кошки",
    "породистые котята",
    "нева маскарадная",
  ],
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "msapplication-TileImage", url: "/mstile-150x150.png" },
    ],
  },
  manifest: "/site.webmanifest",
  other: {
    "msapplication-TileColor": "#336699",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#336699",
  },
  openGraph: {
    title: "Blue Sea — Питомник невских маскарадных кошек",
    description:
      "Породистые невские маскарадные кошки и котята от титулованных родителей",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${playfair.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <NextTopLoader color="#336699" height={3} showSpinner={false} />
        {children}
      </body>
    </html>
  );
}

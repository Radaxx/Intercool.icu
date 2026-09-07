import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Intercool.icu — Mes séances",
  description:
    "Un affichage moderne de mes séances de sport, synchronisées depuis intervals.icu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="font-sans text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}

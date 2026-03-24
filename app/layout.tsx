import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Shell } from "@/components/layout/shell";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Productify - Productiviteits Dashboard",
  description: "Persoonlijk productiviteits dashboard met to-do's, pomodoro timer, notities en dagplanning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${inter.variable} dark h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full bg-background text-foreground transition-colors duration-300">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

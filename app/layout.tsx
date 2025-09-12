import type React from "react";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Pomodoro Focus - Temporizador Minimalista",
  description: "Aplicación minimalista de Pomodoro con reloj digital en tiempo real",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`font-sans ${dmSans.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
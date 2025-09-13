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
  title: 'The Clock App',
  description: 'Pomodoro timer and productivity app',
}


// LO SIGUIENTE ROMPE LA WEB
// Configuración de headers de seguridad para desarrollo
// export async function generateMetadata() {
//   return {
//     title: 'The Clock App',
//     description: 'Pomodoro timer and productivity app',
//     other: {
//       'Content-Security-Policy': process.env.NODE_ENV === 'development'
//         ? "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: http://192.168.0.110:3001; connect-src 'self' http://192.168.0.110:3001 ws://192.168.0.110:3001"
//         : "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self';"
//     }
//   }
// }

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
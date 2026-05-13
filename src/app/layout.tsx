'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';
import { LanguageProvider } from '@/context/language-context';
import PageLoader from '@/components/ui/page-loader';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700&family=Manrope:wght@400;600;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-accent selection:text-white" suppressHydrationWarning>
        <FirebaseClientProvider>
          <LanguageProvider>
            <PageLoader />
            {children}
            <Toaster />
          </LanguageProvider>
        </FirebaseClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

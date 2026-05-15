import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { SiteNav } from "@/components/SiteNav";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Interview AI — Practice technical interviews",
  description:
    "Voice-friendly technical interviews: ready-made practice tests and AI-generated questions with Gemini or OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body
        suppressHydrationWarning
        className="font-sans h-full min-h-0 text-slate-900 dark:text-slate-100"
      >
        <div className="mesh-bg flex h-full min-h-0 flex-col">
          <SiteNav />
          <main className="relative flex min-h-0 flex-1 flex-col">{children}</main>
        </div>
      </body>
    </html>
  );
}

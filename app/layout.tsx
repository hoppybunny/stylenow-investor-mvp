import { Suspense } from "react";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from "@vercel/analytics/react";

import "./globals.css";

export const metadata = {
  title: "Styled By Clara",
  description: "See yourself in new outfits using AI",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <section className="border-b border-neutral-200">
          <Suspense
            fallback={
              <div className="flex w-full px-4 lg:px-40 py-6 items-center text-center gap-8 justify-between h-[80px]" />
            }
          >
            <Navbar />
          </Suspense>
        </section>
        <main className="flex-1 fashion-container py-12 sm:py-20">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

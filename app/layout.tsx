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
      <body className="min-h-screen flex flex-col">
        <section>
          <Suspense
            fallback={
              <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between h-[69px]" />
            }
          >
            <Navbar />
          </Suspense>
        </section>
        <main className="flex flex-1 flex-col items-center py-16">
          {children}
        </main>
        <Footer />
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

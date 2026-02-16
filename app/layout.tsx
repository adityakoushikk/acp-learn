import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "ACPLearn - Deep Learning Anti-Cancer Peptide Predictor",
  description:
    "ACPLearn is a novel deep learning model for the prediction and discovery of anti-cancer peptides from FASTA sequences.",
};

export const viewport: Viewport = {
  themeColor: "#1b8a7a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <div className="flex min-h-screen min-w-0 flex-col overflow-x-hidden">
          <Navbar />
          <main className="min-w-0 flex-1">{children}</main>
          <footer className="border-t border-border bg-card py-6">
            <div className="mx-auto max-w-5xl px-4 text-center text-sm text-muted-foreground">
              ACPLearn v1.0 &mdash; Deep learning-based anti-cancer peptide
              predictor. Built for research purposes.
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

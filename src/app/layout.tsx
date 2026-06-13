import type { Metadata } from "next";
import { Outfit, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ConvexClientProvider from "@/components/ConvexClientProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XENO",
  description: "Internal AI-native Campaign Intelligence Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} antialiased bg-black min-h-screen text-[#EDEDED] relative selection:bg-white/20`}>
        {/* Ambient Radial Glow (Resend style) */}
        <div className="fixed inset-0 z-[-1] flex justify-center pt-20 pointer-events-none">
          <div className="w-[800px] h-[300px] bg-white opacity-[0.03] blur-[120px] rounded-[100%]" />
        </div>
        
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
        <Toaster theme="dark" toastOptions={{
          style: {
            background: '#111',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#EDEDED'
          }
        }} />
      </body>
    </html>
  );
}

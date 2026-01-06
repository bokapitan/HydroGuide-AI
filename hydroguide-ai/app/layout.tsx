import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "HydroGuide AI",
  description: "AI-Powered Hydration Tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* ADDED: suppressHydrationWarning to silence the extension error */}
      <body
        suppressHydrationWarning
        className={`${poppins.variable} font-sans text-slate-800 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
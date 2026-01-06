import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

// 1. Configure the Poppins font
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"], // We need these weights for the bold design
});

// 2. Update the Site Metadata
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
      <body
        // 3. Apply the font variable and default text color
        className={`${poppins.variable} font-sans text-slate-800 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
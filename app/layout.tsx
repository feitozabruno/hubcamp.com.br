import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Hubcamp",
  description: "Learning technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${poppins.variable} antialiased`}>{children}</body>
    </html>
  );
}

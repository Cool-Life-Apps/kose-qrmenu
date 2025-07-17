import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kose QR Menu",
  description: "QR Menu for Kose",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

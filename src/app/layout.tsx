import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Köşe QR Menu",
  description: "QR Menu for Köşe",
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

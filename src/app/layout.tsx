import "./globals.css";
import { Montserrat, Playfair_Display, Bebas_Neue } from 'next/font/google';
const montserrat = Montserrat({ subsets: ['latin'], weight: ["400", "500", "600"] });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ["400", "500", "600"] });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ["400"] });

export const metadata = {
  title: "QR Menu",
  description: "QR Menu",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className={montserrat.className}>{children}</body>
    </html>
  );
}

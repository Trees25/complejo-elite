import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SiteHeader from "../components/general/SiteHeader";
import Footer from "../components/general/Footer";
import WhatsappButton from "../components/general/WhatsappButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Complejo Elite",
  description:
    "El mejor complejo deportivo de San Juan, con excelente gastronomia y de los mejores salones de eventos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-black text-foreground antialiased">
        {/* El Header aparecerá en TODAS las páginas */}
        <SiteHeader />

        {/* Aquí Next.js inyecta el contenido de la page.tsx en la que estés */}
        <main className="min-h-screen">{children}</main>
        <WhatsappButton />
        {/* El Footer aparecerá en TODAS las páginas */}
        <Footer />
      </body>
    </html>
  );
}

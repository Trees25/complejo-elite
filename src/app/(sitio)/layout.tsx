import SiteHeader from "../../components/general/SiteHeader";
import Footer from "../../components/general/Footer";
import WhatsappButton from "../../components/general/WhatsappButton";

export default function SitioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* El Header aparecerá en TODAS las páginas de (sitio) */}
      <SiteHeader />

      {/* Contenido de la página */}
      <main className="min-h-screen">{children}</main>

      <WhatsappButton />

      {/* El Footer aparecerá en TODAS las páginas de (sitio) */}
      <Footer />
    </>
  );
}

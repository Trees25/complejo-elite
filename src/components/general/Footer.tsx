import Link from "next/link";
import { MessageCircle, Mail, MapPin, Clock, Phone } from "lucide-react";

// Bypass: Componente SVG nativo exacto al de Lucide para evitar el error de importación
const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card" id="contacto">
      <div className="container-elite grid gap-12 py-16 md:grid-cols-4">
        <div>
          <div className="text-3xl font-display font-black tracking-[0.25em] text-gold-gradient">
            ELITE
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">
            Marcamos la diferencia
          </p>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Un predio donde el deporte, la pasión, la exclusividad y el disfrute
            se encuentran.
          </p>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold">
            Navegación
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li>
              <Link
                href="/#nosotros"
                className="hover:text-gold transition-colors"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/complejo-deportivo"
                className="hover:text-gold transition-colors"
              >
                Complejo Deportivo
              </Link>
            </li>
            <li>
              <Link
                href="/salon-eventos"
                className="hover:text-gold transition-colors"
              >
                Salón de Eventos
              </Link>
            </li>
            <li>
              <Link
                href="/gastronomia"
                className="hover:text-gold transition-colors"
              >
                Gastronomía
              </Link>
            </li>
            <li>
              <Link
                href="/#contacto"
                className="hover:text-gold transition-colors"
              >
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold">
            Contacto
          </h4>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" /> Calle
              Alfonzo 13 y Nacional, Médano de Oro, Rawson — San Juan
            </li>
            <li className="flex gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-gold" />{" "}
              Próximamente
            </li>
            <li className="flex gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-gold" />{" "}
              eliteclub.sanjuan@gmail.com
            </li>
            <li className="flex gap-3">
              <Clock size={16} className="mt-0.5 shrink-0 text-gold" /> Lun a
              Vie 17:00–01:00 · Sáb 09:00–01:00
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-[0.3em] text-gold">
            Redes
          </h4>
          <div className="mt-5 flex gap-3">
            <a
              href="#"
              className="grid h-11 w-11 place-items-center border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              aria-label="Instagram"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="#"
              className="grid h-11 w-11 place-items-center border border-border text-muted-foreground transition-colors hover:border-gold hover:text-gold"
              aria-label="WhatsApp"
            >
              <MessageCircle size={18} />
            </a>
          </div>
          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-gold">
            Auspician
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-20 border border-dashed border-border"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-elite flex flex-col items-center justify-between gap-2 py-6 text-xs uppercase tracking-[0.3em] text-muted-foreground md:flex-row">
          <p>
            © {new Date().getFullYear()} Elite Club. Todos los derechos
            reservados.
          </p>
          <span>
            Desarrollado por{" "}
            <Link
              href="https://www.treestech.dev/"
              target="_blank"
              rel="noreferrer"
              className="text-gold hover:text-gold-hover font-semibold transition-colors"
            >
              TREESTECH
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      <a
        href="#"
        aria-label="WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-gold text-background shadow-lg transition-transform hover:scale-110"
      >
        <MessageCircle size={22} />
      </a>
    </div>
  );
}

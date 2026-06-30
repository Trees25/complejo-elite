"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import logo from "../../../public/logo.png";

const LINKS_HOME = [
  { href: "/", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#contacto", label: "Contacto" },
];

const LINKS_PAGINAS = [
  { href: "/salon-eventos", label: "Eventos" },
  { href: "/gastronomia", label: "Gastronomía" },
  { href: "/complejo-deportivo", label: "Complejo deportivo" },
  { href: "/#contacto", label: "Contacto" },
];
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const currentLinks = pathname === "/" ? LINKS_HOME : LINKS_PAGINAS;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setOpen(false);

    if (href === "/") {
      if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" });
      else router.push("/");
      return;
    }

    const targetId = href.replace("/#", "");

    if (pathname === "/") {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(href);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur border-b border-border"
          : "bg-transparent backdrop-blur-none border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          onClick={(e) => handleNavClick(e, "/")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Image
            src={logo}
            alt="Logo Elite"
            width={60}
            height={60}
            className="h-15 w-auto object-contain"
          />
          <div className="flex flex-col leading-none">
            <span
              className={`font-display text-2xl tracking-[0.25em] transition-colors ${
                scrolled ? "text-gold-gradient" : "text-white"
              }`}
            >
              ELITE CLUB
            </span>
            <span
              className={`text-[10px] tracking-[0.4em] mt-1 transition-colors ${
                scrolled ? "text-muted-foreground" : "text-foreground/80"
              }`}
            >
              COMPLEJO DEPORTIVO Y MÁS
            </span>
          </div>
        </Link>

        {/* Navegación de Escritorio */}
        <nav className="hidden lg:flex items-center gap-8">
          {currentLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              className={`text-xs tracking-[0.2em] uppercase transition-colors hover:text-gold cursor-pointer ${
                scrolled ? "text-gold-gradient" : "text-white"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Botón Menú Móvil */}
        <button
          className={`lg:hidden transition-colors ${
            scrolled ? "text-foreground" : "text-foreground/90"
          }`}
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Menú Móvil */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            /* Cambiado bg-[#F2F2F2] a bg-background para mantener el Dark Mode */
            className="fixed inset-0 h-dvh w-full bg-background z-50 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <span className="font-display text-xl tracking-[0.25em] text-foreground">
                ELITE CLUB
              </span>
              <button onClick={() => setOpen(false)} aria-label="Cerrar">
                <X className="h-6 w-6 text-foreground hover:text-gold transition-colors" />
              </button>
            </div>

            <nav className="flex flex-col items-center mt-5 flex-1 gap-6">
              {currentLinks.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => handleNavClick(e as any, l.href)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  /* Cambiado el hover viejo por text-gold */
                  className="font-display text-3xl cursor-pointer text-foreground hover:text-gold transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

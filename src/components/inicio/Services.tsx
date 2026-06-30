"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Trophy, Sparkles, Utensils } from "lucide-react";

// Importa tus imágenes aquí (ajusta los paths según tu estructura)
import deportivo from "../../../public/deportivo.jpg";
import salon from "../../../public/salon.jpg";
import gastronomia from "../../../public/gastronomia.jpg";

const services = [
  {
    href: "/complejo-deportivo",
    img: deportivo,
    title: "Complejo Deportivo",
    desc: "Canchas de primer nivel, iluminación LED y amenities premium.",
    icon: Trophy,
  },
  {
    href: "/salon-eventos",
    img: salon,
    title: "Salón de Eventos",
    desc: "Hasta 1.000 personas. Eventos sociales y corporativos inolvidables.",
    icon: Sparkles,
  },
  {
    href: "/gastronomia",
    img: gastronomia,
    title: "Gastronomía",
    desc: "Resto, parrilla y cerveza artesanal. El tercer tiempo perfecto.",
    icon: Utensils,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Services() {
  return (
    <section
      className="border-t border-border bg-card/30 py-32 "
      id="servicios"
    >
      <div className="container-elite">
        <motion.div
          {...fadeUp}
          className="mb-20 flex items-end justify-between gap-6"
        >
          <div>
            <p className="text-xl font-bold uppercase tracking-[0.4em] text-gold">
              Espacios
            </p>
            <h2 className="mt-4 font-display text-5xl md:text-6xl">
              Una experiencia, tres mundos.
            </h2>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((c, i) => (
            <motion.div
              key={c.href}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: i * 0.15 }}
            >
              <Link
                href={c.href}
                className="group relative block h-[520px] overflow-hidden border border-border transition-colors hover:border-gold"
              >
                {/* Imagen optimizada */}
                <Image
                  src={c.img}
                  alt={c.title}
                  fill
                  className="object-cover transition-transform duration-[1.4s] group-hover:scale-105"
                />

                {/* Gradiente para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

                <div className="absolute inset-0 flex flex-col justify-end p-10">
                  <c.icon size={24} className="text-gold" />
                  <h3 className="mt-4 font-display text-3xl">{c.title}</h3>
                  <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                    {c.desc}
                  </p>

                  <span className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold transition-all group-hover:gap-4">
                    Descubrir <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

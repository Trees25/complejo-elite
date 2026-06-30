"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Beer, UtensilsCrossed, Coffee, Flame } from "lucide-react";
const parilla = "/parilla.jpg";
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const propuesta = [
  {
    i: UtensilsCrossed,
    t: "Almuerzo & Cena",
    d: "Cocina sencilla con producto local y de estación.",
  },
  {
    i: Flame,
    t: "Parrilla Argentina",
    d: "Carnes a la cruz y achuras al carbón.",
  },
  {
    i: Beer,
    t: "Cerveza Artesanal",
    d: "Tirada fresca y selección de etiquetas.",
  },
  {
    i: Coffee,
    t: "Desayuno & Merienda",
    d: "Café de especialidad y pastelería casera.",
  },
];

export default function GastronomiaClient() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="border-t border-border py-32">
        <div className="container-elite grid gap-16 md:grid-cols-12 items-start">
          <motion.div {...fadeUp} className="md:col-span-4">
            <span className="text-xl font-bold uppercase tracking-[0.4em] text-gold">
              El espacio
            </span>
            <h2 className="mt-6 font-display text-5xl md:text-6xl leading-[0.9]">
              Bar, parrilla y encuentro.
            </h2>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="md:col-span-7 md:col-start-6 space-y-8"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              Un restobar pensado para el después del partido y los encuentros
              informales. Cantina, parrilleros al aire libre y una barra siempre
              lista.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Con capacidad para 200 cubiertos, es el lugar ideal para celebrar
              la amistad alrededor de una buena mesa.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Propuesta con Grid "Insano" */}

      <section className="border-t border-border bg-card/30 py-28">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-14">
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Propuesta
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Sabores y rituales.
            </h2>
          </motion.div>
          <div className="grid gap-px bg-border md:grid-cols-4">
            {propuesta.map((p, i) => (
              <motion.div
                key={p.t}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 4) * 0.08 }}
                className="bg-background p-8"
              >
                <p.i className="text-gold" size={26} />
                <h3 className="mt-5 font-display text-xl">{p.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* Foto parrilla con efecto parallax */}
      <section className="border-t border-border">
        <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
          <Image
            src={parilla}
            alt="Parrilla argentina"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
          <div className="container-elite absolute inset-0 flex items-center">
            <motion.div {...fadeUp} className="max-w-xl">
              <p className="text-xl uppercase tracking-[0.4em] text-gold">
                A la parrilla
              </p>
              <h2 className="mt-4 font-display text-4xl md:text-6xl">
                El asado siempre une.
              </h2>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Eventos informales */}
      <section className="border-t border-border py-28">
        <div className="container-elite grid gap-16 md:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Eventos informales
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Para festejos chicos.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Cumpleaños, asados de equipo, despedidas de año. Disponemos del
              sector para grupos íntimos con servicio personalizado.
            </p>
            <a
              href="#"
              className="mt-10 inline-block bg-gold px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink hover:bg-gold-soft"
            >
              Consultar disponibilidad
            </a>
          </motion.div>
          <motion.ul
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="space-y-4"
          >
            {[
              "Capacidad 200 cubiertos",
              "Estacionamiento privado",
              "Baños con duchas y vestuarios",
              "Reservas por WhatsApp",
            ].map((x) => (
              <li
                key={x}
                className="border-l border-gold pl-4 text-foreground/85"
              >
                {x}
              </li>
            ))}
          </motion.ul>
        </div>
      </section>
    </div>
  );
}

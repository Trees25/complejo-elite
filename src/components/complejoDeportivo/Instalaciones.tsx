"use client";
import CarouselScale from "./CarouselScale";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ShowerHead,
  Lightbulb,
  Car,
  Shield,
  Dumbbell,
  Coffee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const valores = [
  {
    t: "Fútbol 11",
    d: "Césped sintético última generación.",
  },
  {
    t: "Fútbol 5",
    d: "Sintético profesional.",
  },
  {
    t: "Capacidad",
    d: "1000 personas.",
  },
];

const amenities = [
  {
    i: ShowerHead,
    t: "Vestuarios Premium",
    d: "Duchas individuales y lockers.",
  },
  {
    i: Lightbulb,
    t: "Iluminación LED",
    d: "Visibilidad profesional de noche.",
  },
  { i: Car, t: "Estacionamiento Privado", d: "Autos y motos con vigilancia." },
  { i: Shield, t: "Seguridad 24/7", d: "Control de acceso y cámaras." },
  {
    i: Dumbbell,
    t: "Área de entrenamiento",
    d: "Espacio de calentamiento y fitness.",
  },
  { i: Coffee, t: "Resto al pie", d: "Tercer tiempo sin moverte del predio." },
];
// Reemplaza con las rutas reales de tus imágenes
const fotosGaleria = [
  "/cancha1.jpeg",
  "/cancha2.jpeg",
  "/cancha3.jpeg",
  "/cancha4.jpeg",
  "/cancha5.jpeg",
  "/cancha6.jpeg",
];

// Variantes para el carrusel insano
const sliderVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

// Helper para indexación circular
const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};
const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export default function Instalaciones() {
  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = wrap(0, fotosGaleria.length, page);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };
  return (
    <div className="bg-background">
      {/* Instalaciones */}
      <section className="border-t border-border  py-32">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
              Instalaciones
            </span>
            <h2 className="mt-4 font-display text-5xl">
              Cada disciplina, su escenario.
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-l border-border">
            {valores.map((v, i) => (
              <motion.div
                key={v.t}
                {...fadeUp}
                transition={{ delay: (i % 3) * 0.1 }}
                className="border-b border-r border-border p-10 hover:bg-background/50 transition-colors"
              >
                <span className="font-display text-2xl text-gold/30">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-display text-2xl">{v.t}</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {v.d}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Galeria fotos canchas */}
      <section className="border-t border-border bg-card/30 py-28">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-14 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
              Galería
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Conocé el predio.
            </h2>
          </motion.div>

          {/* AQUÍ INSERTAS EL CARRUSEL */}
          <CarouselScale />
        </div>
      </section>

      {/* Amenities */}
      <section className="border-t border-border bg-card/50 py-28">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-14">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">
              Amenities
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Servicios pensados para tu bienestar.
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {amenities.map((a, i) => (
              <motion.div
                key={a.t}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 3) * 0.1 }}
                className="border border-border p-8 transition-colors hover:border-gold"
              >
                <a.i className="text-gold" size={28} />
                <h3 className="mt-5 font-display text-xl">{a.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reservas */}
      <section className="border-t border-border py-28">
        <div className="container-elite max-w-3xl text-center">
          <motion.p
            {...fadeUp}
            className="text-xs uppercase tracking-[0.4em] text-gold"
          >
            Reservas
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="mt-4 font-display text-4xl md:text-5xl"
          >
            ¿Listo para jugar?
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-6 text-muted-foreground"
          >
            Reservá por WhatsApp en horarios de atención. Sistema online
            próximamente.
          </motion.p>
          <motion.a
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.3 }}
            href="#"
            className="mt-10 inline-block bg-gold px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink hover:bg-gold-soft"
          >
            Reservar por WhatsApp
          </motion.a>
        </div>
      </section>
    </div>
  );
}

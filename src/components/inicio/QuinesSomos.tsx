"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const valores = [
  {
    t: "Excelencia",
    d: "Máxima calidad en instalaciones, servicios deportivos y propuesta gastronómica.",
  },
  {
    t: "Familia",
    d: "Espacios seguros y agradables donde construir recuerdos inolvidables.",
  },
  {
    t: "Amistad y Comunidad",
    d: "Vínculos genuinos, compañerismo y sentido de pertenencia.",
  },
  {
    t: "Pasión por el Deporte",
    d: "La actividad física como bienestar, superación y unión.",
  },
  {
    t: "Hospitalidad",
    d: "Atención cercana, una experiencia que hace sentir como en casa.",
  },
  {
    t: "Gastronomía y Encuentro",
    d: "Una buena mesa que reúne a la familia y los amigos.",
  },
  {
    t: "Respeto",
    d: "Convivencia basada en inclusión y valoración de cada persona.",
  },
  { t: "Innovación", d: "Evolucionamos para superar expectativas." },
  { t: "Integridad", d: "Honestidad, responsabilidad y compromiso." },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutSection() {
  return (
    <div className="bg-background" id="nosotros">
      {/* Bienvenido */}
      <section className="border-t border-border py-32">
        <div className="container-elite grid gap-16 md:grid-cols-12 items-start">
          <motion.div {...fadeUp} className="md:col-span-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
              Bienvenido
            </span>
            <h2 className="mt-6 font-display text-5xl md:text-6xl leading-[0.9]">
              Mucho más que un predio.
            </h2>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="md:col-span-7 md:col-start-6 space-y-8"
          >
            <p className="text-lg leading-relaxed text-muted-foreground">
              Creamos este predio con un objetivo claro: ofrecer mucho más que
              un espacio para vivir un momento diferente. Pensamos cada detalle
              para que encuentren un lugar exclusivo, cómodo y distinto.
            </p>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Creemos que el deporte no es solo actividad física; es compartir,
              desconectarse de la rutina, generar vínculos y crear momentos
              inolvidables.
            </p>
            {/*<Link
              href="/nosotros"
              className="group inline-flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-gold hover:text-white transition-colors"
            >
              Nuestra historia{" "}
              <ArrowRight
                className="transition-transform group-hover:translate-x-2"
                size={16}
              />
            </Link>*/}
          </motion.div>
        </div>
      </section>

      {/* Misión / Visión */}
      <section className="border-t border-border py-20">
        <div className="container-elite grid gap-8 md:grid-cols-2">
          {[
            {
              t: "Misión",
              d: "Brindar una experiencia integral de excelencia, combinando deporte, gastronomía, recreación y bienestar en un entorno exclusivo.",
            },
            {
              t: "Visión",
              d: "Ser el predio deportivo y social de referencia en la región, reconocido por su excelencia, exclusividad y calidez humana.",
            },
          ].map((item, i) => (
            <motion.div
              key={item.t}
              {...fadeUp}
              transition={{ delay: i * 0.2 }}
              className="group relative border border-border/50 p-12 hover:border-gold/80 transition-colors"
            >
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold">
                {item.t}
              </span>
              <p className="mt-8 font-display text-3xl leading-snug">
                {item.d}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Valores */}
      <section className="border-t border-border bg-card/50 py-32">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold">
              Valores
            </span>
            <h2 className="mt-4 font-display text-5xl">Lo que nos define.</h2>
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

      {/* Propósito */}
      <section className="border-t border-border py-32">
        <div className="container-elite max-w-4xl text-center">
          <motion.span
            {...fadeUp}
            className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold"
          >
            Nuestro propósito
          </motion.span>
          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.1 }}
            className="mt-8 font-display text-4xl md:text-6xl leading-[1.1]"
          >
            Crear un lugar donde el deporte, la gastronomía, la familia y la
            amistad se encuentren para dar vida a experiencias únicas.
          </motion.h2>
        </div>
      </section>
    </div>
  );
}

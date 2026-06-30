"use client";

import { motion } from "framer-motion";
import heroPoster from "../../../public/salon.jpg";

// Asegúrate de que el video esté en public/video/videos/video.mp4
const heroVideo = "/video/videos/video.mp4";

export default function Hero() {
  return (
    <section id="inicio" className="relative h-screen w-full overflow-hidden">
      {/* Video de fondo */}
      <motion.video
        autoPlay
        loop
        muted
        playsInline
        poster={heroPoster.src}
        className="absolute inset-0 h-full w-full object-cover"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <source src={heroVideo} type="video/mp4" />
      </motion.video>

      {/* Overlay oscuro para legibilidad */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Contenido */}
      <div className="h-full w-full z-10 flex flex-col items-center justify-center sm:items-start sm:justify-end px-6 py-16 ">
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xs tracking-[0.5em] uppercase text-white drop-shadow-md"
        >
          Salón de Eventos
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl tracking-wide text-balance text-white drop-shadow-lg"
        >
          El escenario de tus{" "}
          <span className="mt-6 font-display text-5xl sm:text-7xl md:text-8xl tracking-wide text-balance text-gold-gradient drop-shadow-lg">
            grandes momentos
          </span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="my-8 h-[1px] w-40 bg-gold"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 1 }}
          className="max-w-xl text-sm sm:text-base tracking-[0.25em] uppercase text-foreground drop-shadow-md"
        >
          Infraestructura de elite para que cada evento se viva como uno único.
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-foreground/70 text-[10px] tracking-[0.4em] uppercase"
      >
        Scroll
      </motion.div>
    </section>
  );
}

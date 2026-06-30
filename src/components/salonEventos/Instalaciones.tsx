"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check, Send } from "lucide-react";

// NOTA: En Next.js, importa desde la carpeta public
const salon = "/salon.jpg";
const noche = "/evento-noche.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

const servicios = [
  "Climatización integral",
  "Grupo electrógeno",
  "Limpieza profesional",
  "Seguridad privada",
  "Suite para homenajeados",
  "Estacionamiento privado",
  "Áreas al aire libre",
  "Iluminación profesional",
];

const galerias = [
  { t: "Eventos sociales — Día", img: salon },
  { t: "Eventos sociales — Noche", img: noche },
  { t: "Eventos corporativos", img: salon },
];

export default function Instalaciones() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    tipo: "Social",
    mensaje: "",
  });
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola Elite Club, soy ${form.nombre}. Me interesa un evento ${form.tipo}.\n${form.mensaje}\nTel: ${form.telefono}\nEmail: ${form.email}`,
    );
    window.open(`https://wa.me/2644590545?text=${msg}`, "_blank");
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Ficha técnica */}
      <section className="border-t border-border py-28">
        <div className="container-elite grid gap-16 md:grid-cols-12">
          <motion.div {...fadeUp} className="md:col-span-5">
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Ficha técnica
            </p>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              Versatilidad sin límites.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Diseñado para casamientos, cumpleaños de 15, eventos corporativos
              y celebraciones íntimas.
            </p>
          </motion.div>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="md:col-span-7 grid grid-cols-2 gap-px bg-border"
          >
            {[
              { k: "Banquete", v: "1.000" },
              { k: "Auditorio", v: "1.200" },
              { k: "Cocktail", v: "1.500" },
              { k: "Metros cuadrados", v: "1.200 m²" },
            ].map((s) => (
              <div key={s.k} className="bg-background p-8">
                <div className="font-display text-5xl text-gold">{s.v}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  {s.k}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Galerías */}
      <section className="border-t border-border bg-card/30 py-28">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-14">
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Galería
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Un salón, mil maneras.
            </h2>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-3">
            {galerias.map((g, i) => (
              <motion.figure
                key={g.t}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                className="group relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={g.img}
                  alt={g.t}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-6 font-display text-2xl ">
                  {g.t}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios incluidos */}
      <section className="border-t border-border py-28">
        <div className="container-elite">
          <motion.div {...fadeUp} className="mb-14">
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Incluye
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Todo resuelto.
            </h2>
          </motion.div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {servicios.map((s, i) => (
              <motion.div
                key={s}
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: (i % 4) * 0.06 }}
                className="flex items-center gap-3 border border-border p-5"
              >
                <Check size={18} className="shrink-0 text-gold" />
                <span className="text-sm">{s}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form ventas */}
      <section className="border-t border-border bg-card/30 py-28">
        <div className="container-elite grid gap-16 md:grid-cols-2">
          <motion.div {...fadeUp}>
            <p className="text-xl uppercase tracking-[0.4em] text-gold">
              Equipo de ventas
            </p>
            <h2 className="mt-3 font-display text-4xl md:text-5xl">
              Hablemos de tu evento.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Contanos qué tenés en mente y un asesor te responde en horario de
              atención.
            </p>
          </motion.div>
          <motion.form
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            onSubmit={submit}
            className="space-y-4"
          >
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre"
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email"
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Teléfono"
                className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
              />
            </div>
            <select
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value })}
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            >
              <option>Social</option>
              <option>Corporativo</option>
              <option>Casamiento</option>
              <option>Cumpleaños de 15</option>
              <option>Cumpleaños de 18</option>
            </select>
            <textarea
              value={form.mensaje}
              onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
              rows={5}
              placeholder="Contanos sobre tu evento"
              className="w-full border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-3 bg-gold px-8 py-4 text-xs uppercase tracking-[0.3em] text-ink hover:bg-gold-soft"
            >
              Enviar consulta <Send size={14} />
            </button>
            {sent && (
              <p className="text-sm text-gold">
                ¡Gracias! Te contactamos a la brevedad.
              </p>
            )}
          </motion.form>
        </div>
      </section>
    </div>
  );
}

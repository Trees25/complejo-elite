"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import Link from "next/link";
export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Configura aquí tu número y el mensaje inicial
  const phoneNumber = "542644590545";
  const defaultMessage = encodeURIComponent(
    "¡Hola! Quisiera hacer una consulta.",
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-72 sm:w-80 overflow-hidden rounded-2xl bg-background shadow-2xl border border-border origin-bottom-right"
          >
            {/* Header verde estilo WhatsApp */}
            <div className="flex items-center justify-between bg-[#128C7E] px-4 py-3 text-white">
              <div className="flex items-center gap-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  className="h-6 w-6 fill-current"
                >
                  <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.9c-32 0-63.3-8.6-90.8-24.8l-6.5-3.8-67.5 17.7 18-65.9-4.2-6.7C55.4 302.2 45.3 264 45.3 222c0-98 79.8-177.8 178.6-177.8 47.5 0 92.1 18.5 125.7 52.1 33.6 33.6 52.1 78.2 52.1 125.8-.1 98-80 177.8-177.8 177.8zm97.3-133c-5.3-2.7-31.5-15.5-36.4-17.3-4.9-1.8-8.5-2.7-12 2.7-3.6 5.3-13.8 17.3-16.9 20.9-3.1 3.6-6.2 4-11.6 1.3-5.3-2.7-22.5-8.3-42.8-26.6-15.7-14.1-26.3-31.5-29.4-36.9-3.1-5.3-.3-8.2 2.4-10.9 2.4-2.4 5.3-6.2 8-9.3 2.7-3.1 3.6-5.3 5.3-8.9 1.8-3.6.9-6.7-.4-9.3-1.3-2.7-12-28.9-16.4-39.6-4.3-10.5-8.6-9.1-12-9.3-3.1-.2-6.7-.2-10.2-.2-3.6 0-9.3 1.3-14.2 6.7-4.9 5.3-18.7 18.2-18.7 44.5s19.1 51.6 21.8 55.1c2.7 3.6 37.6 57.4 91 80.5 12.7 5.5 22.6 8.8 30.4 11.3 12.8 4.1 24.5 3.5 33.8 2.1 10.4-1.5 31.5-12.9 36-25.3 4.4-12.4 4.4-23.1 3.1-25.3-1.3-2.2-4.9-3.6-10.2-6.2z" />
                </svg>
                <div className="flex flex-col">
                  <span className="font-semibold leading-tight">
                    ELITE CLUB
                  </span>
                  <span className="text-[10px] text-white/80">
                    Respondemos al instante
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-white/20 transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cuerpo del chat (Fondo gris claro para simular WA) */}
            <div className="bg-[#E5DDD5] p-5">
              {/* Burbuja de mensaje */}
              <div className="mb-6 w-max max-w-[85%] rounded-2xl rounded-tl-none bg-white px-4 py-3 text-sm text-[#111b21] shadow-sm relative">
                <p>¡Hola! 👋 ¿En qué podemos ayudarte?</p>
                <span className="text-[10px] text-gray-400 mt-1 block text-right">
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              {/* Botón de enviar que redirige a la app */}
              <Link
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex w-full text-black items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold  shadow-md transition-transform hover:scale-105"
              >
                <Send className="h-4 w-4 text-black" />
                Abrir chat
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante inicial */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all duration-300 hover:scale-110 hover:bg-[#20ba56] ${
          isOpen
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100"
        }`}
        aria-label="Contactar por WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          className="h-8 w-8 fill-current"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 414.9c-32 0-63.3-8.6-90.8-24.8l-6.5-3.8-67.5 17.7 18-65.9-4.2-6.7C55.4 302.2 45.3 264 45.3 222c0-98 79.8-177.8 178.6-177.8 47.5 0 92.1 18.5 125.7 52.1 33.6 33.6 52.1 78.2 52.1 125.8-.1 98-80 177.8-177.8 177.8zm97.3-133c-5.3-2.7-31.5-15.5-36.4-17.3-4.9-1.8-8.5-2.7-12 2.7-3.6 5.3-13.8 17.3-16.9 20.9-3.1 3.6-6.2 4-11.6 1.3-5.3-2.7-22.5-8.3-42.8-26.6-15.7-14.1-26.3-31.5-29.4-36.9-3.1-5.3-.3-8.2 2.4-10.9 2.4-2.4 5.3-6.2 8-9.3 2.7-3.1 3.6-5.3 5.3-8.9 1.8-3.6.9-6.7-.4-9.3-1.3-2.7-12-28.9-16.4-39.6-4.3-10.5-8.6-9.1-12-9.3-3.1-.2-6.7-.2-10.2-.2-3.6 0-9.3 1.3-14.2 6.7-4.9 5.3-18.7 18.2-18.7 44.5s19.1 51.6 21.8 55.1c2.7 3.6 37.6 57.4 91 80.5 12.7 5.5 22.6 8.8 30.4 11.3 12.8 4.1 24.5 3.5 33.8 2.1 10.4-1.5 31.5-12.9 36-25.3 4.4-12.4 4.4-23.1 3.1-25.3-1.3-2.2-4.9-3.6-10.2-6.2z" />
        </svg>
      </button>
    </div>
  );
}

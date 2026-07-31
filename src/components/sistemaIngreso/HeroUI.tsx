"use client";

import logoMutual from "../../../public/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import Dashboard from "@/components/sistemaIngreso/Dashboard";
import BuscarSocio from "@/components/sistemaIngreso/BuscarSocio";
import CierreCaja from "@/components/sistemaIngreso/CierreCaja";
//import EditarPrecios from "@/components/sistemaIngreso/EditarPrecios";
import FormGenerarTickets from "@/components/sistemaIngreso/FormGenerarTickets";

// Recibimos el rol como parámetro desde el servidor
export default function HeroUI({ rolInicial }: { rolInicial: string }) {
  // Inicializamos el estado con el rol recibido
  const [usuario] = useState({ rol: rolInicial });
  const [activeTab, setActiveTab] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 text-black p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 border-b-4 border-[#3FA7AC] pb-6 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            <Image
              src={logoMutual}
              alt="Fondo Mutual"
              priority
              className="h-16 sm:h-20 w-auto object-contain rounded"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black">
                Administración Complejo Deportivo{" "}
                <span className="text-3xl font-display font-black tracking-[0.25em] text-gold-gradient">
                  ELITE
                </span>
              </h1>
              <p className="text-gray-600 mt-1 font-medium text-sm sm:text-base">
                Seleccione la acción a realizar.
              </p>
            </div>
          </div>
        </header>

        {/* NAVEGACIÓN */}
        <nav className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {rolInicial.includes("admin") && (
            <Button
              className={
                activeTab === "Dashboard"
                  ? "bg-[#3FA7AC] px-4 py-4 border-white text-white font-bold shadow-md w-full text-base sm:w-auto"
                  : "bg-white px-4 py-4 text-base text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-white hover:shadow-xl w-full sm:w-auto "
              }
              onClick={() => setActiveTab("Dashboard")}
            >
              Dashboard
            </Button>
          )}

          {(rolInicial.includes("admin") || rolInicial.includes("ingreso")) && (
            <>
              <Button
                className={
                  activeTab === "tickets"
                    ? "bg-[#3FA7AC] px-4 py-4 border-white text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white px-4 py-4 text-base text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-white hover:shadow-xl w-full sm:w-auto "
                }
                onClick={() => setActiveTab("tickets")}
              >
                Imprimir tickets
              </Button>
              <Button
                className={
                  activeTab === "buscar socio"
                    ? "bg-[#3FA7AC] px-4 py-4 border-white text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white px-4 py-4 text-base text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-white hover:shadow-xl w-full sm:w-auto "
                }
                onClick={() => setActiveTab("buscar socio")}
              >
                Buscar socio
              </Button>

              <Button
                className={
                  activeTab === "cerrar caja"
                    ? "bg-[#3FA7AC] px-4 py-4 border-white text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white px-4 py-4 text-base text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-white hover:shadow-xl w-full sm:w-auto "
                }
                onClick={() => setActiveTab("cerrar caja")}
              >
                Cerrar caja
              </Button>
            </>
          )}

          {/* Bloque Admin Final */}
          {rolInicial.includes("admin") && (
            <Button
              className={
                activeTab === "editar precios"
                  ? "bg-[#3FA7AC] px-4 py-4 border-white text-white font-bold shadow-md w-full text-base sm:w-auto"
                  : "bg-white px-4 py-4 text-base text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-white hover:shadow-xl w-full sm:w-auto "
              }
              onClick={() => setActiveTab("editar precios")}
            >
              Editar precios
            </Button>
          )}
        </nav>

        <main>
          {activeTab === "Dashboard" && <Dashboard usuario={rolInicial} />}

          {activeTab === "tickets" && (
            <FormGenerarTickets usuario={rolInicial} />
          )}
          {activeTab === "buscar socio" && <BuscarSocio usuario={rolInicial} />}
          {activeTab === "cerrar caja" && <CierreCaja usuario={rolInicial} />}
          {/*{activeTab === "editar precios" && (
            <EditarPrecios usuario={rolInicial} />
          )}*/}
        </main>
      </div>
    </div>
  );
}

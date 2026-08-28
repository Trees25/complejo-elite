"use client";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import logoMutual from "../../../public/logo.png";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Image from "next/image";
import Dashboard from "@/components/sistemaIngreso/Dashboard";
import BuscarSocio from "@/components/sistemaIngreso/BuscarSocio";
import CierreCaja from "@/components/sistemaIngreso/CierreCaja";
import EditarPrecios from "@/components/sistemaIngreso/EditarPrecios";
import FormGenerarTickets from "@/components/sistemaIngreso/FormGenerarTickets";
import CrearTicket from "@/components/sistemaIngreso/CrearTicket";
import ThemeToggle from "@/components/ThemeToggle"; // Verifica que la ruta de importación sea correcta
import DashboardSupervisor from "./DashboardSupervisor";
// Recibimos el rol como parámetro desde el servidor
export default function HeroUI({ rolInicial }: { rolInicial: string }) {
  const [activeTab, setActiveTab] = useState("");
  const supabase = createClient();
  const router = useRouter(); // <-- 1. Inicializa el enrutador

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // 3. Limpia la caché del cliente para que Next.js note el cambio
    router.refresh();

    // 4. Redirige al usuario al login
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-black dark:text-white p-4 sm:p-8 transition-colors duration-600">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* HEADER */}
        <header className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 sm:gap-6 border-b-4 border-[#C4A77D] pb-6 bg-white dark:bg-card/50 p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-600">
          <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6">
            <Image
              src={logoMutual}
              alt="Fondo Mutual"
              priority
              className="h-16 sm:h-20 w-auto object-contain rounded"
            />
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                Administración Complejo Deportivo{" "}
                <span className="text-3xl text-gold-gradient font-display font-black tracking-[0.25em] text-[#C4A77D] drop-shadow-md dark:text-gold-gradient">
                  ELITE
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 font-medium text-sm sm:text-base">
                Seleccione la acción a realizar.
              </p>
            </div>
          </div>
          {/* Controles de Sesión y Tema */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-gray-300 bg-white text-black hover:bg-red-50 hover:text-red-600 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
            >
              Cerrar sesión
            </Button>
          </div>
        </header>

        {/* NAVEGACIÓN */}
        <nav className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
          {(rolInicial.includes("admin") ||
            rolInicial.includes("supervisor")) && (
            <Button
              className={
                activeTab === "Dashboard"
                  ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                  : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
              }
              onClick={() => setActiveTab("Dashboard")}
            >
              Dashboard
            </Button>
          )}

          {(rolInicial.includes("admin") ||
            rolInicial.includes("ingreso") ||
            rolInicial.includes("supervisor")) && (
            <>
              <Button
                className={
                  activeTab === "tickets"
                    ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
                }
                onClick={() => setActiveTab("tickets")}
              >
                Gestión de accesos
              </Button>
              <Button
                className={
                  activeTab === "buscar socio"
                    ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
                }
                onClick={() => setActiveTab("buscar socio")}
              >
                Buscar socio
              </Button>

              <Button
                className={
                  activeTab === "cerrar caja"
                    ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
                }
                onClick={() => setActiveTab("cerrar caja")}
              >
                Gestión Cajas
              </Button>
            </>
          )}

          {/* Bloque Admin Final */}
          {(rolInicial.includes("admin") ||
            rolInicial.includes("supervisor")) && (
            <>
              <Button
                className={
                  activeTab === "crear ticket"
                    ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
                }
                onClick={() => setActiveTab("crear ticket")}
              >
                Administración
              </Button>
            </>
          )}
          {rolInicial.includes("admin") && (
            <>
              <Button
                className={
                  activeTab === "supervision"
                    ? "bg-[#C4A77D] px-4 py-4 border-2 border-[#C4A77D] text-white font-bold shadow-md w-full text-base sm:w-auto"
                    : "bg-white dark:bg-[#C4A77D]/80 px-4 py-4 text-base text-gray-700 dark:text-black border-2 border-gray-300 hover:border-black hover:text-black hover:bg-[#C4A77D] hover:shadow-xl w-full sm:w-auto transition-all duration-600"
                }
                onClick={() => setActiveTab("supervision")}
              >
                Registros/historial de movimientos
              </Button>
            </>
          )}
        </nav>

        <main>
          {activeTab === "Dashboard" && <Dashboard usuario={rolInicial} />}

          {activeTab === "tickets" && (
            <FormGenerarTickets usuario={rolInicial} />
          )}
          {activeTab === "buscar socio" && <BuscarSocio usuario={rolInicial} />}
          {activeTab === "cerrar caja" && <CierreCaja usuario={rolInicial} />}
          {activeTab === "editar precios" && (
            <EditarPrecios usuario={rolInicial} />
          )}
          {activeTab === "crear ticket" && <CrearTicket usuario={rolInicial} />}
          {activeTab === "supervision" && (
            <DashboardSupervisor usuario={rolInicial} />
          )}
        </main>
      </div>
    </div>
  );
}

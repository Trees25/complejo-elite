"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface DetalleItem {
  nombre?: string;
  cantidad?: number;
  recaudacion?: number;
  [key: string]: any;
}

interface CierreData {
  detalles: DetalleItem[];
  [key: string]: any;
}
export default function CierreCaja({ usuario }: { usuario: String }) {
  const [datosCierre, setDatosCierre] = useState<CierreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (!usuario || !usuario.includes("admin")) {
    console.log(usuario);
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>
          No tienes los permisos de administrador necesarios para esta sección.
        </p>
      </div>
    );
  }

  // Obtener la fecha actual en formato legible para la interfaz
  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const consultarCajaHoy = async () => {
    setLoading(true);
    try {
      // Pedimos los datos al endpoint (por defecto el PHP usa la fecha actual)
      const response = await fetch(
        "https://mutualunsj.org.ar/api-cierre-caja.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const json = await response.json();

      if (json.exito) {
        setDatosCierre(json);
      } else {
        alert("Error al consultar la caja: " + json.error);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const guardarCierreDefinitivo = async () => {
    // Aquí confirmamos antes de hacer una acción destructiva/permanente
    const confirmar = window.confirm(
      "¿Estás seguro de guardar el cierre? Esta acción no se puede modificar.",
    );
    if (!confirmar) return;

    setGuardando(true);
    try {
      // Este endpoint lo crearemos en el próximo paso
      const response = await fetch(
        "https://mutualunsj.org.ar/api-guardar-cierre.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosCierre),
        },
      );

      const json = await response.json();

      if (json.exito) {
        alert("¡Cierre de caja guardado exitosamente!");
        // Limpiamos la pantalla tras guardar
        setDatosCierre(null);
      } else {
        alert("Error al guardar: " + json.error);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 bg-white text-gray-800 rounded-xl shadow-lg border border-gray-200">
      <div className="border-b-2 border-[#3FA7AC] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            Cierre de Caja
          </h2>
          <p className="text-gray-500 capitalize">{fechaHoy}</p>
        </div>
        <Button
          onClick={consultarCajaHoy}
          disabled={loading || guardando}
          className="bg-[#3FA7AC] hover:bg-[#32868a] text-white font-bold mt-4 sm:mt-0"
        >
          {loading ? "Calculando..." : "Consultar Totales de Hoy"}
        </Button>
      </div>

      {!datosCierre && !loading && (
        <div className="text-center py-12 text-gray-400">
          <p>
            Presiona "Consultar Totales de Hoy" para ver la recaudación actual.
          </p>
        </div>
      )}

      {datosCierre && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-gray-700 uppercase">
            Detalle por forma de pago
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {datosCierre.detalles.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center"
              >
                <span className="text-sm font-bold text-gray-500 uppercase">
                  {item.forma_pago}
                </span>
                <span className="text-3xl font-black text-gray-800 mt-1">
                  ${Number(item.total).toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-[#eaf5f6] p-6 rounded-lg border border-[#3FA7AC] flex flex-col sm:flex-row justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#3FA7AC] uppercase">
                Recaudación Total del Día
              </p>
              <p className="text-5xl font-black text-[#3FA7AC] mt-1">
                ${Number(datosCierre.gran_total).toLocaleString("es-AR")}
              </p>
            </div>

            <Button
              onClick={guardarCierreDefinitivo}
              disabled={guardando}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white font-bold w-full sm:w-auto mt-6 sm:mt-0 shadow-md px-8 py-6 text-lg"
            >
              {guardando ? "Guardando..." : "Guardar Cierre Definitivo"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface DetalleItem {
  tipo_ticket: string;
  cantidad: number;
  recaudacion: number;
}

interface CierreData {
  turno_id: string;
  detalles: DetalleItem[];
  gran_total: number;
}

export default function CierreCaja({ usuario }: { usuario: string }) {
  const supabase = createClient();
  const [datosCierre, setDatosCierre] = useState<CierreData | null>(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Validación de permisos
  if (!usuario || !usuario.includes("admin")) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>
          No tienes los permisos de administrador necesarios para esta sección.
        </p>
      </div>
    );
  }

  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const consultarCajaHoy = async () => {
    setLoading(true);
    try {
      // 1. Buscar si hay un turno de caja abierto
      const { data: turno, error: errorTurno } = await supabase
        .from("turnos_caja")
        .select("*")
        .eq("estado", "ABIERTA")
        .maybeSingle();

      if (errorTurno) throw errorTurno;
      if (!turno) {
        alert("No hay ningún turno de caja abierto actualmente.");
        return;
      }

      // 2. Obtener todos los tickets vinculados a este turno que NO sean sobrantes
      const { data: tickets, error: errorTickets } = await supabase
        .from("tickets")
        .select(
          `
          id,
          estado,
          lotes_impresion!inner(turno_caja_id),
          tipos_ticket(id, nombre, precio)
        `,
        )
        .eq("lotes_impresion.turno_caja_id", turno.id)
        .neq("estado", "SOBRANTE");

      if (errorTickets) throw errorTickets;

      // 3. Agrupar totales por tipo de ticket
      const detallesMap = new Map<
        string,
        { cantidad: number; recaudacion: number }
      >();
      let gran_total = 0;

      (tickets || []).forEach((t: any) => {
        const nombre = t.tipos_ticket.nombre;
        const precio = Number(t.tipos_ticket.precio);

        if (!detallesMap.has(nombre)) {
          detallesMap.set(nombre, { cantidad: 0, recaudacion: 0 });
        }
        const actual = detallesMap.get(nombre)!;
        actual.cantidad += 1;
        actual.recaudacion += precio;
        gran_total += precio;
      });

      // 4. Convertir el mapa a un array para renderizar
      const detalles = Array.from(detallesMap.entries()).map(
        ([nombre, valores]) => ({
          tipo_ticket: nombre,
          cantidad: valores.cantidad,
          recaudacion: valores.recaudacion,
        }),
      );

      setDatosCierre({
        turno_id: turno.id,
        detalles,
        gran_total,
      });
    } catch (error: any) {
      console.error("Error consultando caja:", error);
      alert("Error al calcular: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const guardarCierreDefinitivo = async () => {
    if (!datosCierre) return;

    const confirmar = window.confirm(
      "¿Estás seguro de cerrar la caja? El turno pasará a 'CERRADA' y no se podrán emitir más tickets.",
    );
    if (!confirmar) return;

    setGuardando(true);
    try {
      // Actualizar el turno a cerrado y asentar el monto
      const { error } = await supabase
        .from("turnos_caja")
        .update({
          estado: "CERRADA",
          fecha_cierre: new Date().toISOString(),
          monto_declarado: datosCierre.gran_total,
        })
        .eq("id", datosCierre.turno_id);

      if (error) throw error;

      alert("¡Cierre de caja guardado exitosamente!");
      setDatosCierre(null);
    } catch (error: any) {
      console.error("Error al guardar cierre:", error);
      alert("Error al guardar: " + error.message);
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
            Presiona "Consultar Totales de Hoy" para ver la recaudación del
            turno abierto.
          </p>
        </div>
      )}

      {datosCierre && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="font-bold text-gray-700 uppercase">
            Detalle por Tipo de Ticket
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {datosCierre.detalles.map((item, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center"
              >
                <span className="text-sm font-bold text-gray-500 uppercase">
                  {item.tipo_ticket}
                </span>
                <span className="text-xs text-gray-400 font-semibold mb-1">
                  Cantidad vendida: {item.cantidad}
                </span>
                <span className="text-3xl font-black text-gray-800">
                  ${Number(item.recaudacion).toLocaleString("es-AR")}
                </span>
              </div>
            ))}

            {/* Si no hay ventas, mostrar mensaje */}
            {datosCierre.detalles.length === 0 && (
              <p className="text-gray-500 text-sm">
                No se han emitido tickets en este turno.
              </p>
            )}
          </div>

          <div className="bg-[#eaf5f6] p-6 rounded-lg border border-[#3FA7AC] flex flex-col sm:flex-row justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#3FA7AC] uppercase">
                Recaudación Total del Turno
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
              {guardando ? "Guardando..." : "Cerrar Turno de Caja"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import FormatDate from "@/utils/FormatearFechaSupa";
import FormatMoney from "@/utils/FormatearNumeros";

export default function DashboardSupervisor({ usuario }: { usuario: string }) {
  const supabase = createClient();
  const [metricasCajas, setMetricasCajas] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // <-- NUEVO: Estado para el filtro de fecha (por defecto hoy en formato YYYY-MM-DD)
  const [fechaLogs, setFechaLogs] = useState(
    new Date().toLocaleDateString("en-CA"),
  );

  if (
    !usuario ||
    (!usuario.includes("admin") && !usuario.includes("supervisor"))
  ) {
    return (
      <div className="p-8 bg-red-100 text-red-800 rounded-lg">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
      </div>
    );
  }

  useEffect(() => {
    async function cargarAuditoria() {
      setLoading(true);
      try {
        // 1. CARGAR MÉTRICAS DE CAJAS
        const { data: turnos, error: turnosError } = await supabase
          .from("turnos_caja")
          .select(
            "id, estado, fecha_apertura, fecha_cierre, monto_declarado, efectivo_abrir, perfiles(nombre)",
          )
          .order("fecha_apertura", { ascending: false })
          .limit(10);

        if (turnosError) throw turnosError;

        if (turnos) {
          const turnosConMetricas = await Promise.all(
            turnos.map(async (turno) => {
              const { count: emitidos } = await supabase
                .from("tickets")
                .select("id, lotes_impresion!inner(turno_caja_id)", {
                  count: "exact",
                  head: true,
                })
                .eq("lotes_impresion.turno_caja_id", turno.id)
                .neq("estado", "SOBRANTE");

              const { count: bajas } = await supabase
                .from("tickets")
                .select("id, lotes_impresion!inner(turno_caja_id)", {
                  count: "exact",
                  head: true,
                })
                .eq("lotes_impresion.turno_caja_id", turno.id)
                .eq("estado", "SOBRANTE");

              return {
                ...turno,
                // <-- CORRECCIÓN: Se elimina el [0] porque Supabase devuelve un objeto, no un array
                empleado:
                  (turno.perfiles as any)?.nombre ||
                  (turno.perfiles as any)?.[0]?.nombre ||
                  "Desconocido",
                ticketsEmitidos: emitidos || 0,
                ticketsBaja: bajas || 0,
              };
            }),
          );
          setMetricasCajas(turnosConMetricas);
        }

        // 2. CARGAR HISTORIAL DE MOVIMIENTOS (LOGS) FILTRADO POR FECHA
        // <-- NUEVO: Calculamos el inicio y fin del día seleccionado
        const inicioDia = new Date(
          `${fechaLogs}T00:00:00.000-03:00`,
        ).toISOString();
        const finDia = new Date(
          `${fechaLogs}T23:59:59.999-03:00`,
        ).toISOString();

        const { data: logsData, error: logsError } = await supabase
          .from("logs_auditoria")
          .select("id, accion, descripcion, created_at, perfiles(nombre)")
          .gte("created_at", inicioDia) // Mayor o igual al inicio del día
          .lte("created_at", finDia) // Menor o igual al final del día
          .order("created_at", { ascending: false })
          .limit(100); // <-- Aumentado a 100 para ver un día completo de operaciones

        if (logsError) throw logsError;
        if (logsData) setLogs(logsData);
      } catch (error) {
        console.error("Error cargando auditoría:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarAuditoria();
  }, [supabase, fechaLogs]); // <-- NUEVO: React vuelve a ejecutar si cambia la fecha seleccionada

  return (
    <div className="space-y-8 p-4 sm:p-8 bg-gray-50 dark:bg-zinc-950 min-h-screen">
      {/* SECCIÓN 1: CAJAS */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow border border-gray-200 dark:border-white/10">
        <div className="border-b-2 border-[#C4A77D] pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
            Auditoría Operativa de Cajas
          </h2>
        </div>
        {loading ? (
          <p className="text-center text-gray-500 py-4">Cargando métricas...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/10 text-[#C4A77D] uppercase text-sm">
                  <th className="p-3">Empleado</th>
                  <th className="p-3">Apertura</th>
                  <th className="p-3">Cierre</th>
                  <th className="p-3 text-center">T. Emitidos</th>
                  <th className="p-3 text-center text-red-500">T. Bajas</th>
                  <th className="p-3 text-right">Recaudación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                {metricasCajas.map((turno) => (
                  <tr
                    key={turno.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 text-gray-900 dark:text-zinc-300"
                  >
                    <td className="p-3 font-bold">{turno.empleado}</td>
                    <td className="p-3 text-sm">
                      {FormatDate(turno.fecha_apertura)}
                    </td>
                    <td className="p-3 text-sm">
                      {turno.fecha_cierre
                        ? FormatDate(turno.fecha_cierre)
                        : "-"}
                    </td>
                    <td className="p-3 text-center font-bold">
                      {turno.ticketsEmitidos}
                    </td>
                    <td className="p-3 text-center font-bold text-red-500">
                      {turno.ticketsBaja}
                    </td>
                    <td className="p-3 text-right font-mono text-[#C4A77D]">
                      {FormatMoney(turno.monto_declarado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 2: HISTORIAL DE MOVIMIENTOS (LOGS) */}
      <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl shadow border border-gray-200 dark:border-white/10">
        <div className="border-b-2 border-[#C4A77D] pb-4 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
            Registro de Actividades
          </h2>

          {/* <-- NUEVO: Selector de Fecha --> */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
              Día:
            </label>
            <input
              type="date"
              value={fechaLogs}
              onChange={(e) => setFechaLogs(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-md focus:ring-[#C4A77D] focus:border-[#C4A77D] block px-3 py-1.5 dark:bg-zinc-950/50 dark:border-white/10 dark:text-white shadow-sm"
            />
          </div>
        </div>
        {loading ? (
          <p className="text-center text-gray-500 py-4">
            Cargando historial...
          </p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {logs.map((log) => {
              // Extraer la hora local de forma sencilla
              const hora = new Date(log.created_at).toLocaleTimeString(
                "es-AR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <div
                  key={log.id}
                  className="flex gap-4 p-3 rounded-lg bg-gray-50 dark:bg-zinc-950/50 border border-gray-100 dark:border-white/5"
                >
                  <div className="text-xs font-mono text-gray-400 dark:text-zinc-500 pt-1 shrink-0">
                    {hora}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-bold text-[#C4A77D]">
                        {(log.perfiles as any)?.nombre ||
                          (log.perfiles as any)?.[0]?.nombre ||
                          "Usuario Desconocido"}
                      </span>{" "}
                      {log.descripcion}
                    </p>
                    <span className="text-xs font-bold text-gray-400 bg-gray-200 dark:bg-zinc-800 px-2 py-0.5 rounded mt-1 inline-block">
                      {log.accion}
                    </span>
                  </div>
                </div>
              );
            })}
            {logs.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay actividades registradas en la fecha seleccionada.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

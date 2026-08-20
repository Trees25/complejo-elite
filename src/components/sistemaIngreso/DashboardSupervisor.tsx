import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import FormatDate from "@/utils/FormatearFechaSupa";
import FormatMoney from "@/utils/FormatearNumeros";

export default function DashboardSupervisor({ usuario }: { usuario: string }) {
  const supabase = createClient();
  const [metricasCajas, setMetricasCajas] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                empleado: turno.perfiles?.nombre || "Desconocido",
                ticketsEmitidos: emitidos || 0,
                ticketsBaja: bajas || 0,
              };
            }),
          );
          setMetricasCajas(turnosConMetricas);
        }

        // 2. CARGAR HISTORIAL DE MOVIMIENTOS (LOGS)
        const { data: logsData, error: logsError } = await supabase
          .from("logs_auditoria")
          .select("id, accion, descripcion, created_at, perfiles(nombre)")
          .order("created_at", { ascending: false })
          .limit(30); // Trae los últimos 30 movimientos

        if (logsError) throw logsError;
        if (logsData) setLogs(logsData);
      } catch (error) {
        console.error("Error cargando auditoría:", error);
      } finally {
        setLoading(false);
      }
    }

    cargarAuditoria();
  }, [supabase]);

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
        <div className="border-b-2 border-[#C4A77D] pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white uppercase">
            Registro de Actividades (En Vivo)
          </h2>
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
                        {log.perfiles?.nombre || "Usuario Desconocido"}
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
              <p className="text-sm text-gray-500">
                No hay actividades recientes registradas.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ResumenTicket {
  nombre: string;
  cantidad: number;
  recaudacion: number;
}

interface TipoTicket {
  id: string;
  nombre: string;
}

const CHART_COLORS = ["#C4A77D", "#E2C792", "#8A7350", "#d4af37", "#997a00"];

export default function Dashboard({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const { resolvedTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);
  const [desglose, setDesglose] = useState<ResumenTicket[]>([]);
  const [tiposDisponibles, setTiposDisponibles] = useState<TipoTicket[]>([]);
  const [sobrantes, setSobrantes] = useState(0);

  const hoy = new Date().toISOString().split("T")[0];
  const primerDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const [filtros, setFiltros] = useState({
    desde: primerDiaMes,
    hasta: hoy,
    tipoTicket: "todos",
  });

  if (
    !usuario ||
    (!usuario.includes("admin") &&
      !usuario.includes("ingreso") &&
      !usuario.includes("supervisor"))
  ) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para ver este dashboard.</p>
      </div>
    );
  }

  const handleFiltroChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (
      e.target.name === "desde" &&
      filtros.hasta &&
      e.target.value > filtros.hasta
    ) {
      toast.error("ERROR EN LAS FECHAS", {
        description: "LA FECHA 'DESDE' NO PUEDE SER MAYOR A LA FECHA 'HASTA'",
      });
    } else if (
      e.target.name === "hasta" &&
      filtros.desde &&
      e.target.value < filtros.desde
    ) {
      toast.error("ERROR EN LAS FECHAS", {
        description: "LA FECHA 'HASTA' NO PUEDE SER MENOR A LA FECHA 'DESDE'",
      });
    }
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const cargarTiposTicket = async () => {
    const { data, error } = await supabase
      .from("tipos_ticket")
      .select("id, nombre");
    if (!error && data) {
      setTiposDisponibles(data);
    }
  };

  const cargarMetricas = async () => {
    setLoading(true);
    try {
      // Agregamos la hora inicial (00:00:00) y el huso horario de Argentina (-03:00)
      // .toISOString() lo convierte automáticamente a '2026-08-13T03:00:00.000Z' (UTC)
      const fechaDesde = new Date(
        `${filtros.desde}T00:00:00.000-03:00`,
      ).toISOString();

      // Agregamos la hora final (23:59:59) y el huso horario de Argentina (-03:00)
      // .toISOString() lo convierte automáticamente a '2026-08-14T02:59:59.000Z' (UTC)
      const fechaHasta = new Date(
        `${filtros.hasta}T23:59:59.999-03:00`,
      ).toISOString();

      const { count: sobrantes, error } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true })
        .gte("created_at", fechaDesde)
        .lte("created_at", fechaHasta)
        .eq("estado", "SOBRANTE");

      if (error) throw error;
      if (sobrantes) {
        setSobrantes(Number(sobrantes || 0));
      }

      let query = supabase
        .from("tickets")
        .select(
          `
          id,
          created_at,
          tipo_ticket_id,
          tipos_ticket (nombre, precio)
        `,
        )
        .gte("created_at", fechaDesde)
        .lte("created_at", fechaHasta)
        .neq("estado", "SOBRANTE");

      if (filtros.tipoTicket !== "todos") {
        query = query.eq("tipo_ticket_id", filtros.tipoTicket);
      }

      const { data: ticketsData, error: ticketError } = await query;

      if (ticketError) throw ticketError;

      if (ticketsData) {
        setTotalTickets(ticketsData.length);

        let totalDinero = 0;
        const mapaDesglose: {
          [key: string]: { cantidad: number; precio: number };
        } = {};

        ticketsData.forEach((t: any) => {
          const tipoInfo = t.tipos_ticket;
          if (tipoInfo) {
            const nombre = tipoInfo.nombre;
            const precio = Number(tipoInfo.precio) || 0;

            totalDinero += precio;

            if (!mapaDesglose[nombre]) {
              mapaDesglose[nombre] = { cantidad: 0, precio };
            }
            mapaDesglose[nombre].cantidad += 1;
          }
        });

        setRecaudacionTotal(totalDinero);

        const arrayDesglose: ResumenTicket[] = Object.keys(mapaDesglose).map(
          (nombre) => ({
            nombre,
            cantidad: mapaDesglose[nombre].cantidad,
            recaudacion:
              mapaDesglose[nombre].cantidad * mapaDesglose[nombre].precio,
          }),
        );

        setDesglose(arrayDesglose);
      }
    } catch (error: any) {
      toast.error("ERROR AL CARGAR METRICAS", {
        description: `OCURRIÓ UN ERROR AL CARGAR LAS METRICAS ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTiposTicket();
    cargarMetricas();
  }, [supabase]);

  const axisColor = resolvedTheme === "dark" ? "#a1a1aa" : "#374151";
  const tooltipBg = resolvedTheme === "dark" ? "#18181b" : "#ffffff";
  const tooltipText = resolvedTheme === "dark" ? "#ffffff" : "#111827";

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#C4A77D] pb-3 text-gray-900 dark:text-white">
        Dashboard General - Control de Accesos
      </h2>

      {/* BLOQUE FILTROS */}
      <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5">
        <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
          Filtros
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Desde
            </Label>
            <Input
              type="date"
              name="desde"
              value={filtros.desde}
              onChange={handleFiltroChange}
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Hasta
            </Label>
            <Input
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={handleFiltroChange}
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Tipo de Ticket
            </Label>
            <select
              name="tipoTicket"
              value={filtros.tipoTicket}
              onChange={handleFiltroChange}
              className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4A77D] dark:border-[#C4A77D] dark:bg-zinc-950/50 dark:text-white"
            >
              <option value="todos" className="dark:bg-zinc-900">
                Todos los tickets
              </option>
              {tiposDisponibles.map((tipo) => (
                <option
                  key={tipo.id}
                  value={tipo.id}
                  className="dark:bg-zinc-900"
                >
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={cargarMetricas}
            disabled={loading}
            className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black font-bold h-10 shadow-lg w-full transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
          >
            {loading ? "Filtrando..." : "Aplicar Filtro"}
          </Button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between text-gray-900 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:text-white dark:ring-1 dark:ring-white/5">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide text-sm">
            Total Tickets Emitidos
          </h3>
          <p className="text-4xl font-extrabold mt-4 ">
            {loading ? "..." : totalTickets}{" "}
            <span className="text-sm font-normal text-gray-500 dark:text-zinc-400">
              tickets
            </span>
          </p>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide text-sm">
            Ingresos Totales
          </h3>
          <p className="text-4xl font-extrabold mt-4 text-green-600 dark:text-green-400">
            {loading ? "..." : `$${recaudacionTotal.toLocaleString("es-AR")}`}
          </p>
        </div>
      </div>

      {/* GRÁFICOS */}
      {!loading && desglose.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {/* Gráfico de Barras: Recaudación */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-gray-900 shadow-sm dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:text-white dark:ring-1 dark:ring-white/5">
            <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide mb-4">
              Recaudación por Tipo ($)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={desglose}
                  margin={{ top: 20, right: 0, left: 0, bottom: 5 }}
                >
                  <XAxis dataKey="nombre" stroke={axisColor} fontSize={12} />
                  <YAxis stroke={axisColor} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: "rgba(196,167,125,0.3)",
                      color: tooltipText,
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    formatter={(value: any) => [
                      `$${value.toLocaleString("es-AR")}`,
                      "Recaudación",
                    ]}
                  />
                  <Bar
                    dataKey="recaudacion"
                    fill="#C4A77D"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico Circular: Cantidad */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 text-gray-900 shadow-sm dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:text-white dark:ring-1 dark:ring-white/5">
            <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide mb-4">
              Volumen de Tickets Emitidos
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={desglose}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                    nameKey="nombre"
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {desglose.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      borderColor: "rgba(196,167,125,0.3)",
                      color: tooltipText,
                      borderRadius: "8px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    formatter={(value: any) => [value, "Cantidad"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* DESGLOSE EN TEXTO */}
      <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 text-gray-900 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:text-white dark:ring-1 dark:ring-white/5">
        <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
          Desglose Detallado
        </h3>
        {loading ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            Actualizando métricas...
          </p>
        ) : desglose.length === 0 && sobrantes === 0 ? (
          <p className="text-sm py-4 text-gray-600 dark:text-zinc-400">
            No hay registros de tickets en este rango y filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {desglose.map((item, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-md border border-gray-200 shadow-sm space-y-2 text-gray-900 dark:bg-zinc-950/60 dark:border-white/10 dark:text-white dark:shadow-lg"
              >
                <h4 className="font-bold text-base">{item.nombre}</h4>
                <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                  <span>Cantidad:</span>
                  <span className="font-semibold text-[#C4A77D]">
                    {item.cantidad}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400 pt-1 border-t border-gray-200 dark:border-white/10">
                  <span>Recaudación:</span>
                  <span className="font-bold text-[#C4A77D]">
                    ${item.recaudacion.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            ))}
            <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm space-y-2 text-gray-900 dark:bg-zinc-950/60 dark:border-white/10 dark:text-white dark:shadow-lg">
              <h4 className="font-bold text-base">Anulados</h4>
              <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                <span>Cantidad:</span>
                <span className="font-semibold text-[#C4A77D]">
                  {sobrantes}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400 pt-1 border-t border-gray-200 dark:border-white/10">
                <span>Recaudación:</span>
                <span className="font-bold text-[#C4A77D]">0</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

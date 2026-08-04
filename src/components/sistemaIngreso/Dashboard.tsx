"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

interface UsuarioProps {
  id: string;
  rol: string;
}

interface ResumenTicket {
  nombre: string;
  cantidad: number;
  recaudacion: number;
}

export default function Dashboard({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [recaudacionTotal, setRecaudacionTotal] = useState(0);
  const [desglose, setDesglose] = useState<ResumenTicket[]>([]);
  const [errorFechas, setErrorFechas] = useState(false);

  // Fechas por defecto: Desde el primer día del mes actual hasta hoy
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
  });

  if (
    !usuario ||
    (!usuario.includes("admin") && !usuario.includes("ingreso"))
  ) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para ver este dashboard.</p>
      </div>
    );
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const cargarMetricas = async () => {
    setLoading(true);
    try {
      // Ajustamos las fechas para abarcar el día completo (desde las 00:00:00 hasta las 23:59:59)
      const fechaDesde = `${filtros.desde}T00:00:00`;
      const fechaHasta = `${filtros.hasta}T23:59:59`;

      let query = supabase
        .from("tickets")
        .select(
          `
          id,
          created_at,
          tipo_ticket_id,
          tipos_ticket (
            nombre,
            precio
          )
        `,
        )
        .gte("created_at", fechaDesde)
        .lte("created_at", fechaHasta);

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
    } catch (error) {
      toast.error("ERROR AL CARGAR METRICAS", {
        description: `OCURRIÓ UN ERROR AL CARGAR LAS METRICAS ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar al montar el componente y al hacer clic en filtrar
  useEffect(() => {
    cargarMetricas();
  }, [supabase]);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-card text-black border border-gray-200 rounded-xl shadow-lg text-white">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-gold pb-3 text-white">
        Dashboard General - Control de Accesos
      </h2>

      {/* BLOQUE FILTRO POR INTERVALO DE FECHAS */}
      <div className="space-y-4 bg-card/60 p-4 sm:p-5 rounded-lg border border-gray-200">
        <h3 className="font-bold text-gold-gradient uppercase tracking-wide">
          Filtrar por Rango de Fechas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end ">
          <div className="space-y-2">
            <Label className="font-semibold">Desde</Label>
            <Input
              type="date"
              name="desde"
              value={filtros.desde}
              onChange={handleDateChange}
              className="bg-card focus-visible:ring-[#C4A77D]"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Hasta</Label>
            <Input
              type="date"
              name="hasta"
              value={filtros.hasta}
              onChange={handleDateChange}
              className="bg-card focus-visible:ring-[#C4A77D]"
            />
          </div>
          <Button
            onClick={cargarMetricas}
            disabled={loading}
            className="bg-black hover:bg-gray-800 text-gold font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
          >
            {loading ? "Filtrando..." : "Aplicar Filtro"}
          </Button>
        </div>
      </div>

      {/* TARJETAS DE RESUMEN PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card/60 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between text-white">
          <h3 className="font-bold text-gold-gradient uppercase tracking-wide text-sm">
            Total Tickets Emitidos (En el periodo)
          </h3>
          <p className="text-4xl font-extrabold mt-4 ">
            {loading ? "..." : totalTickets}{" "}
            <span className="text-sm font-normal text-gray-300">tickets</span>
          </p>
        </div>

        <div className="bg-card/60 p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-gold-gradient uppercase tracking-wide text-sm">
            Ingresos Totales (En el periodo)
          </h3>
          <p className="text-4xl font-extrabold mt-4 text-green-600">
            {loading ? "..." : `$${recaudacionTotal.toLocaleString("es-AR")}`}
          </p>
        </div>
      </div>

      {/* DESGLOSE POR TIPO DE TICKET */}
      <div className="space-y-4 bg-card/60 p-4 sm:p-5 rounded-lg border border-gray-200 text-white">
        <h3 className="font-bold text-gold-gradient uppercase tracking-wide">
          Desglose por Tipo de Acceso
        </h3>

        {loading ? (
          <p className="text-sm text-gray-500 py-4 text-center">
            Actualizando métricas...
          </p>
        ) : desglose.length === 0 ? (
          <p className="text-sm  py-4">
            No hay registros de tickets en este rango de fechas.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {desglose.map((item, index) => (
              <div
                key={index}
                className="bg-black/70 p-4 rounded-md border border-gray-200 shadow-sm space-y-2 text-white"
              >
                <h4 className="font-bold text-base ">{item.nombre}</h4>
                <div className="flex justify-between text-sm text-gray-300">
                  <span>Cantidad:</span>
                  <span className="font-semibold text-gold-gradient">
                    {item.cantidad}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-300 pt-1 border-t border-gray-100">
                  <span>Recaudación:</span>
                  <span className="font-bold text-gold-gradient">
                    ${item.recaudacion.toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

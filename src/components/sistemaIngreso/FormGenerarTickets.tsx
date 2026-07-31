"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { createClient } from "@/utils/supabase/client";

interface TipoTicket {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

interface TicketGenerado {
  id: string;
}

export default function FormGenerarTickets({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [cargandoTurno, setCargandoTurno] = useState(true);
  const [turnoAbierto, setTurnoAbierto] = useState<{ id: string } | null>(null);
  const [tiposTicket, setTiposTicket] = useState<TipoTicket[]>([]);

  const [data, setData] = useState({
    tipo_ticket_id: "",
    cantidad: "10",
  });

  // 1. Verificar turno abierto y cargar tipos de tickets al iniciar
  useEffect(() => {
    async function inicializar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar turno abierto del usuario
      const { data: turno } = await supabase
        .from("turnos_caja")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("estado", "ABIERTA")
        .maybeSingle();

      setTurnoAbierto(turno);

      // Cargar tipos de tickets
      const { data: tipos } = await supabase
        .from("tipos_ticket")
        .select("*")
        .eq("activo", true);

      if (tipos) setTiposTicket(tipos as TipoTicket[]);
      setCargandoTurno(false);
    }
    inicializar();
  }, [supabase]);

  // 2. Función para abrir caja manualmente
  const handleAbrirCaja = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      const { data: nuevoTurno, error } = await supabase
        .from("turnos_caja")
        .insert({
          usuario_id: user.id,
          estado: "ABIERTA",
        })
        .select("id")
        .single();

      if (error) throw error;
      setTurnoAbierto(nuevoTurno);
    } catch (error) {
      console.error("Error al abrir caja:", error);
      alert("No se pudo abrir la caja.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
  };

  const generarQRComando = (dataString: string) => {
    const GS = "\x1d";
    const n = dataString.length + 3;
    const pL = String.fromCharCode(n & 0xff);
    const pH = String.fromCharCode((n >> 8) & 0xff);

    return (
      GS +
      "(k\x04\x00\x31\x41\x32\x00" +
      GS +
      "(k\x03\x00\x31\x43\x05" +
      GS +
      "(k\x03\x00\x31\x45\x30" +
      GS +
      "(k" +
      pL +
      pH +
      "\x31\x50\x30" +
      dataString +
      GS +
      "(k\x03\x00\x31\x51\x30"
    );
  };

  const enviarAImpresora = async (
    ticketsGenerados: TicketGenerado[],
    nombreTipo: string,
    precio: number,
  ) => {
    const ESC = "\x1b";
    const GS = "\x1d";
    const INICIO = ESC + "@";
    const TABLA_LATINA = ESC + "t" + "\x02";
    const CENTRO = ESC + "a" + "\x01";
    const NEGRITA_ON = ESC + "E" + "\x01";
    const NEGRITA_OFF = ESC + "E" + "\x00";
    const DOBLE_ON = GS + "!" + "\x11";
    const DOBLE_OFF = GS + "!" + "\x00";
    const SALTO = "\n";
    const CORTE = GS + "V" + "\x41" + "\x03";

    let payloadImpresion = "";

    ticketsGenerados.forEach((ticket, index) => {
      payloadImpresion += INICIO + TABLA_LATINA + CENTRO;
      payloadImpresion += DOBLE_ON + "ELITE CLUB" + DOBLE_OFF + SALTO;
      payloadImpresion += "Complejo Deportivo y Eventos" + SALTO + SALTO;
      payloadImpresion +=
        NEGRITA_ON + nombreTipo.toUpperCase() + NEGRITA_OFF + SALTO;
      payloadImpresion +=
        "VALOR: $" + Math.round(precio).toLocaleString("es-AR") + SALTO + SALTO;
      payloadImpresion += generarQRComando(ticket.id) + SALTO + SALTO;
      payloadImpresion +=
        "Ticket #" + (index + 1) + " - Valido por el dia de emision" + SALTO;
      payloadImpresion += "ID: " + ticket.id.substring(0, 8) + "..." + SALTO;
      payloadImpresion += CORTE;
    });

    try {
      await fetch("http://localhost:8080/imprimir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: payloadImpresion }),
      });
      alert("¡Lote enviado a imprimir correctamente!");
    } catch (error) {
      console.error("Error al imprimir:", error);
      alert("Error de conexión con la impresora local (puerto 8080).");
    }
  };

  const handleGenerarLote = async () => {
    if (!data.tipo_ticket_id || !data.cantidad) {
      return alert("Selecciona un tipo de ticket y la cantidad.");
    }

    if (!turnoAbierto) {
      return alert("Debe abrir la caja antes de emitir tickets.");
    }

    setLoading(true);
    try {
      // 1. Registrar el Lote vinculado al turno abierto
      const { data: lote, error: errorLote } = await supabase
        .from("lotes_impresion")
        .insert({
          turno_caja_id: turnoAbierto.id,
          tipo_ticket_id: Number(data.tipo_ticket_id),
          cantidad: Number(data.cantidad),
        })
        .select()
        .single();

      if (errorLote) throw errorLote;

      // 2. Preparar tickets
      const ticketsAInsertar = Array.from({
        length: Number(data.cantidad),
      }).map(() => ({
        lote_id: lote.id,
        tipo_ticket_id: Number(data.tipo_ticket_id),
        estado: "IMPRESO",
      }));

      // 3. Insertar tickets
      const { data: ticketsGuardados, error: errorTickets } = await supabase
        .from("tickets")
        .insert(ticketsAInsertar)
        .select("id");

      if (errorTickets) throw errorTickets;

      const tipoSeleccionado = tiposTicket.find(
        (t) => t.id === Number(data.tipo_ticket_id),
      );

      if (!tipoSeleccionado) throw new Error("Tipo de ticket no encontrado.");

      await enviarAImpresora(
        ticketsGuardados as TicketGenerado[],
        tipoSeleccionado.nombre,
        tipoSeleccionado.precio,
      );

      setData({ ...data, cantidad: "" });
    } catch (error) {
      console.error("Error al generar el lote:", error);
      alert("Ocurrió un error al generar los tickets.");
    } finally {
      setLoading(false);
    }
  };

  if (cargandoTurno) {
    return <div className="p-8 text-center">Verificando estado de caja...</div>;
  }

  // Si NO hay caja abierta, muestra pantalla de bloqueo con botón para abrir
  if (!turnoAbierto) {
    return (
      <div className="space-y-6 p-8 bg-white text-center border border-gray-200 rounded-xl shadow-lg max-w-lg mx-auto mt-10">
        <h2 className="text-2xl font-bold text-red-600">Caja Cerrada</h2>
        <p className="text-gray-600">
          No tienes un turno de caja abierto actualmente. Debes abrir la caja
          para comenzar a generar e imprimir tickets.
        </p>
        <Button
          onClick={handleAbrirCaja}
          disabled={loading}
          className="w-full bg-[#3FA7AC] hover:bg-[#358f94] text-white font-bold py-3 text-lg"
        >
          {loading ? "Abriendo caja..." : "Abrir Caja"}
        </Button>
      </div>
    );
  }

  // Si la caja está abierta, muestra el formulario completo
  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-black border border-gray-200 rounded-xl shadow-lg">
      <div className="flex justify-between items-center border-b-2 border-black pb-3">
        <h2 className="text-xl sm:text-2xl font-bold">
          Generación de Tickets (Impresión Física)
        </h2>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded">
          Caja Abierta
        </span>
      </div>

      <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
        <h3 className="font-bold text-[#3FA7AC] uppercase tracking-wide">
          Configuración del Lote
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="font-semibold">Tipo de Acceso</Label>
            <Select
              value={data.tipo_ticket_id}
              onValueChange={(val) => handleSelectChange("tipo_ticket_id", val)}
            >
              <SelectTrigger className="w-full bg-white border-[#3FA7AC]">
                <SelectValue placeholder="Seleccione qué va a imprimir" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {tiposTicket.map((tipo) => (
                    <SelectItem key={tipo.id} value={String(tipo.id)}>
                      {tipo.nombre} - ${tipo.precio}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="font-semibold">Cantidad a imprimir</Label>
            <Input
              name="cantidad"
              type="number"
              min="1"
              max="500"
              value={data.cantidad}
              onChange={handleChange}
              className="bg-white focus-visible:ring-[#3FA7AC]"
              placeholder="Ej: 100"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading || !data.tipo_ticket_id}
          size="lg"
          onClick={handleGenerarLote}
          className="bg-black hover:bg-gray-800 text-gold font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
        >
          {loading ? "Generando e Imprimiendo..." : "Imprimir Lote"}
        </Button>
      </div>
    </div>
  );
}

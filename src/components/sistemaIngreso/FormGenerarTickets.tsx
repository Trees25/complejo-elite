"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";

import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  Camera,
  X,
  UserPlus,
  Upload,
} from "lucide-react";

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
  const [loadingSobrantes, setLoadingSobrantes] = useState(false);
  const [cargandoTurno, setCargandoTurno] = useState(true);
  const [turnoAbierto, setTurnoAbierto] = useState<{ id: string } | null>(null);
  const [tiposTicket, setTiposTicket] = useState<TipoTicket[]>([]);
  const [modalMontoInicial, setModalMontoInicial] = useState(false);
  const [guardandoMonto, setGuardandoMonto] = useState(false);
  const [scannerActivoTickets, setScannerActivoTickets] = useState(false);

  // Estado para la vista previa del ticket
  const [modalPreview, setModalPreview] = useState(false);

  // <-- NUEVO: Estado para guardar el nombre real del operario -->
  const [nombreOperario, setNombreOperario] = useState<string>("");

  // Estado para impresión
  const [data, setData] = useState({
    tipo_ticket_id: "",
    cantidad: "10",
    monto_abrir: "0",
  });

  // Estado para sobrantes
  const [sobranteData, setSobranteData] = useState({
    tipo_ticket_id: "",
    cantidad: "",
  });

  // Función auxiliar centralizada para guardar logs
  const registrarLog = async (accion: string, descripcion: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("logs_auditoria")
        .insert([{ usuario_id: user.id, accion, descripcion }]);
    }
  };

  // 1. Verificar turno abierto y cargar tipos de tickets al iniciar
  useEffect(() => {
    async function inicializar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // <-- NUEVO: Buscamos el nombre del operario en la tabla perfiles -->
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("nombre")
        .eq("id", user.id)
        .maybeSingle();

      if (perfil && perfil.nombre) {
        setNombreOperario(perfil.nombre);
      }

      const { data: turno } = await supabase
        .from("turnos_caja")
        .select("id")
        .eq("usuario_id", user.id)
        .eq("estado", "ABIERTA")
        .maybeSingle();

      setTurnoAbierto(turno);

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
  const handleAbrirCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      if (Number(data.monto_abrir) < 0) {
        toast.error("ERROR AL ABRIR LA CAJA", {
          description: `MONTO DE APERTURA INVÁLIDO`,
        });
        setLoading(false);
        return;
      }

      const { data: nuevoTurno, error } = await supabase
        .from("turnos_caja")
        .insert({
          usuario_id: user.id,
          estado: "ABIERTA",
          efectivo_abrir: data.monto_abrir,
        })
        .select("id")
        .single();

      if (error) throw error;
      setTurnoAbierto(nuevoTurno);

      if (user) {
        await supabase.from("logs_auditoria").insert([
          {
            usuario_id: user.id,
            accion: "APERTURA CAJA",
            descripcion: `EL USUARIO ABRIÓ LA CAJA`,
          },
        ]);
      }
    } catch (error: any) {
      toast.error("ERROR AL ABRIR LA CAJA", {
        description: `OCURRIÓ UN ERROR AL ABRIR LA CAJA ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scannerActivoTickets) {
      const config = {
        fps: 5,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      };

      scanner = new Html5QrcodeScanner("reader", config, false);

      scanner.render(
        async (decodedText) => {
          handleDeclararSobranteQR(decodedText);

          try {
            if (scanner) {
              await scanner.clear();
            }
          } catch (error: any) {
            console.error("Error al limpiar:", error);
          } finally {
            setScannerActivoTickets(false);
          }
        },
        (error) => {
          // Silenciar errores de lectura continua
        },
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scannerActivoTickets]);

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

    // <-- NUEVO: Obtenemos fecha y hora para la impresión -->
    const fechaActual = new Date().toLocaleDateString("es-AR");
    const horaActual = new Date().toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

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

      // <-- NUEVO: Reemplazamos el pie de página del ticket físico -->
      payloadImpresion += `Fecha: ${fechaActual}  Hora: ${horaActual}` + SALTO;
      payloadImpresion += `Operario: ${nombreOperario || "Caja"}` + SALTO;
      //payloadImpresion += "ID: " + ticket.id.substring(0, 8) + "..." + SALTO;

      payloadImpresion += CORTE;
    });

    try {
      await fetch("http://localhost:8080/imprimir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenido: payloadImpresion }),
      });
      toast.success("LOTE ENVIADO", {
        description: `LOTE ENVIADO A IMPRIMIR CORRECTAMENTE`,
      });
    } catch (error: any) {
      toast.error("ERROR AL IMPRIMIR", {
        description: `ERROR DE CONEXION CON LA IMPRESORA LOCAL (PUERTO 8080)`,
      });
    }
  };

  const handleGenerarLote = async () => {
    if (!data.tipo_ticket_id || !data.cantidad) {
      return toast.error("ERROR AL GENERAR LOTE", {
        description: `SELECCIONE UN TIPO DE TICKET Y SU CANTIDAD`,
      });
    }
    if (!turnoAbierto) {
      return toast.error("ERROR AL GENERAR LOTE", {
        description: `DEBE ABRIR LA CAJA ANTES DE EMITIR TICKETS`,
      });
    }

    setLoading(true);
    if (Number(data.cantidad) < 1) {
      toast.error("ERROR EN LA CANTIDAD", {
        description: "LA CANTIDAD DE TICKETS NO PUEDE SER MENOR A 1",
      });
      setLoading(false);
      return;
    }
    try {
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

      const ticketsAInsertar = Array.from({
        length: Number(data.cantidad),
      }).map(() => ({
        lote_id: lote.id,
        tipo_ticket_id: Number(data.tipo_ticket_id),
        estado: "IMPRESO",
      }));

      const { data: ticketsGuardados, error: errorTickets } = await supabase
        .from("tickets")
        .insert(ticketsAInsertar)
        .select("id");

      if (errorTickets) throw errorTickets;

      const tipoSeleccionado = tiposTicket.find(
        (t) => t.id === Number(data.tipo_ticket_id),
      );

      if (!tipoSeleccionado) {
        return toast.error("ERROR AL GENERAR LOTE", {
          description: `TIPO DE TICKET NO ENCONTRADO`,
        });
      }
      await enviarAImpresora(
        ticketsGuardados as TicketGenerado[],
        tipoSeleccionado.nombre,
        tipoSeleccionado.precio,
      );

      // Registro de log al imprimir tickets
      await registrarLog(
        "IMPRESION_TICKETS",
        `Generó e imprimió ${data.cantidad} tickets de tipo ${tipoSeleccionado.nombre}`,
      );

      setData({ ...data, cantidad: "" });
    } catch (error: any) {
      toast.error("ERROR AL GENERAR LOTE", {
        description: `OCURRIÓ UN ERROR AL GENERAR EL LOTE DE TICKETS ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // 3. Función para anular los X últimos tickets del turno actual
  const handleDeclararSobrantes = async () => {
    if (!sobranteData.tipo_ticket_id || !sobranteData.cantidad) {
      return toast.error("DATOS INCOMPLETOS", {
        description: "Seleccione el tipo de ticket y la cantidad sobrante.",
      });
    }

    const cantidadSobrante = Number(sobranteData.cantidad);
    if (cantidadSobrante <= 0) {
      return toast.error("CANTIDAD INVÁLIDA", {
        description: "La cantidad debe ser mayor a 0.",
      });
    }

    setLoadingSobrantes(true);
    try {
      const { data: tickets, error: fetchError } = await supabase
        .from("tickets")
        .select("id, lotes_impresion!inner(turno_caja_id)")
        .eq("lotes_impresion.turno_caja_id", turnoAbierto!.id)
        .eq("tipo_ticket_id", Number(sobranteData.tipo_ticket_id))
        .neq("estado", "SOBRANTE")
        .order("id", { ascending: false })
        .limit(cantidadSobrante);

      if (fetchError) throw fetchError;

      if (!tickets || tickets.length < cantidadSobrante) {
        toast.error("EXCEDE EL LÍMITE", {
          description: `No puede declarar ${cantidadSobrante} sobrantes. Solo hay ${tickets?.length || 0} tickets disponibles de este tipo en su turno actual.`,
        });
        setLoadingSobrantes(false);
        return;
      }

      const idsActualizar = tickets.map((t) => t.id);

      const { error: updateError } = await supabase
        .from("tickets")
        .update({ estado: "SOBRANTE" })
        .in("id", idsActualizar);

      if (updateError) throw updateError;

      toast.success("SOBRANTES DECLARADOS", {
        description: `Se marcaron los últimos ${cantidadSobrante} tickets como sobrantes correctamente.`,
      });

      const tipoSobrante = tiposTicket.find(
        (t) => t.id === Number(sobranteData.tipo_ticket_id),
      );
      await registrarLog(
        "DECLARACION_SOBRANTES",
        `Marcó ${cantidadSobrante} tickets de tipo ${tipoSobrante?.nombre || "Desconocido"} como sobrantes`,
      );

      setSobranteData({ tipo_ticket_id: "", cantidad: "" });
    } catch (error: any) {
      toast.error("ERROR AL DECLARAR", {
        description: `OCURRIÓ UN ERROR: ${error.message}`,
      });
    } finally {
      setLoadingSobrantes(false);
    }
  };

  if (cargandoTurno) {
    return (
      <div className="p-8 text-center text-gray-900 dark:text-zinc-400">
        Verificando estado de caja...
      </div>
    );
  }

  if (!turnoAbierto) {
    return (
      <div className="space-y-6 p-8 bg-white text-gray-900 text-center border border-gray-200 rounded-xl shadow-lg max-w-lg mx-auto mt-10 dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
          Caja Cerrada
        </h2>
        <p className="text-gray-600 dark:text-zinc-300">
          No tienes un turno de caja abierto actualmente. Debes abrir la caja
          para comenzar a generar e imprimir tickets.
        </p>
        <h2 className="text-xl font-bold mb-4 border-b border-[#C4A77D] pb-2 text-gray-900 dark:text-white">
          Registrar Efectivo Inicial en la caja
        </h2>
        <form onSubmit={handleAbrirCaja} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-zinc-300">
              Monto Inicial
            </Label>
            <Input
              type="number"
              placeholder="Ej: 10000"
              value={data.monto_abrir}
              onChange={(e) =>
                setData({ ...data, monto_abrir: e.target.value })
              }
              required
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold py-3 text-lg transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40 shadow-lg"
          >
            {loading ? "Abriendo caja..." : "Abrir Caja"}
          </Button>
        </form>
      </div>
    );
  }

  const handleDeclararSobranteQR = async (idQR: any) => {
    if (!idQR) {
      return toast.error("QR INVÁLIDO", {
        description: "El codigo QR no es válido.",
      });
    }

    setLoadingSobrantes(true);
    try {
      const { data, error: updateError } = await supabase
        .from("tickets")
        .update({ estado: "SOBRANTE" })
        .eq("id", idQR)
        .select("id, tipos_ticket(nombre)");

      if (updateError) throw updateError;
      const ticketsActualizados = data as any as
        | {
            id: string;
            tipos_ticket: { nombre: string } | null;
          }[]
        | null;
      let nombreTicket = "";
      if (ticketsActualizados && ticketsActualizados.length > 0) {
        nombreTicket =
          ticketsActualizados[0].tipos_ticket?.nombre || "Desconocido";
      }
      toast.success("SOBRANTE DECLARADO", {
        description: `Se marcó como sobrante correctamente`,
      });
      await registrarLog(
        "DECLARACION_SOBRANTES",
        `Se marcó como sobrante un ticket de tipo ${nombreTicket} via qr`,
      );

      setSobranteData({ tipo_ticket_id: "", cantidad: "" });
    } catch (error: any) {
      toast.error("ERROR AL DECLARAR", {
        description: `OCURRIÓ UN ERROR: ${error.message}`,
      });
    } finally {
      setLoadingSobrantes(false);
    }
  };

  const tipoSeleccionado = tiposTicket.find(
    (t) => t.id === Number(data.tipo_ticket_id),
  );

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
      {/* MODAL VISTA PREVIA TICKET */}
      {modalPreview && tipoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-gray-100 rounded-xl shadow-2xl p-6 w-full max-w-sm relative flex flex-col items-center border border-gray-300 dark:bg-zinc-900 dark:border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-800"
              onClick={() => setModalPreview(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="font-bold mb-6 text-gray-800 dark:text-white border-b border-[#C4A77D] pb-2 w-full text-center uppercase tracking-wider">
              Diseño del Ticket
            </h2>

            {/* MOCKUP DEL PAPEL TÉRMICO (Simulación 80mm) */}
            <div className="bg-white border border-gray-300 p-6 w-[320px] flex flex-col items-center text-black font-mono shadow-sm">
              <h1 className="text-xl font-bold tracking-wide text-center mt-2">
                ELITE CLUB
              </h1>
              <p className="text-[11px] text-center mb-8">
                Complejo Deportivo y Eventos
              </p>

              <h2 className="text-[13px] font-bold uppercase text-center leading-tight">
                {tipoSeleccionado.nombre}
              </h2>
              <p className="text-[13px] font-bold text-center mb-8">
                VALOR: $
                {Math.round(tipoSeleccionado.precio).toLocaleString("es-AR")}
              </p>

              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VISTA-PREVIA-123456`}
                alt="QR Code"
                className="mb-8 w-[110px] h-[110px]"
              />

              {/* <-- NUEVO: Pie de ticket modificado en la vista previa --> */}
              <p className="text-[10px] text-center leading-tight">
                Fecha: {new Date().toLocaleDateString("es-AR")} Hora:{" "}
                {new Date().toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-[10px] text-center leading-tight mb-2">
                Operario: {nombreOperario || "Caja"}
              </p>
              {/*
              <p className="text-[10px] text-center mb-2 leading-tight">
                ID: 1b0a88a9...
              </p>*/}
            </div>

            <div className="mt-6 w-full flex justify-end">
              <Button
                onClick={() => setModalPreview(false)}
                className="bg-gray-800 text-white hover:bg-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700"
              >
                Cerrar vista previa
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center border-b-2 border-[#C4A77D] pb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Control de Tickets
        </h2>
        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded dark:bg-green-950/60 dark:text-green-400 dark:border dark:border-green-800/40">
          Caja Abierta
        </span>
      </div>

      {/* SECCIÓN 1: IMPRESIÓN */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full h-full">
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5 transition-colors duration-300">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
            Generar Impresión Física
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                Tipo de Acceso
              </Label>
              <Select
                value={data.tipo_ticket_id}
                onValueChange={(val) =>
                  handleSelectChange("tipo_ticket_id", val)
                }
              >
                <SelectTrigger className="w-full bg-white border-[#C4A77D] text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white">
                  <SelectValue placeholder="Seleccione qué va a imprimir" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-white/10 dark:text-white">
                  <SelectGroup>
                    {tiposTicket.map((tipo) => (
                      <SelectItem
                        key={tipo.id}
                        value={String(tipo.id)}
                        className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {tipo.nombre} - ${tipo.precio}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                Cantidad a imprimir
              </Label>
              <Input
                name="cantidad"
                type="number"
                min="1"
                max="2000"
                value={data.cantidad}
                onChange={handleChange}
                className="bg-white text-gray-900 focus-visible:ring-[#C4A77D] border-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner transition-colors duration-300"
                placeholder="Ej: 100"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              type="button"
              disabled={!data.tipo_ticket_id}
              variant="outline"
              size="lg"
              onClick={() => setModalPreview(true)}
              className=" bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40 "
            >
              Ver diseño
            </Button>

            <Button
              disabled={loading || !data.tipo_ticket_id}
              size="lg"
              onClick={handleGenerarLote}
              className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
            >
              {loading ? "Generando e Imprimiendo..." : "Imprimir Lote"}
            </Button>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: SOBRANTES */}
      <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full h-full">
        <div className="space-y-4 p-4 sm:p-5 rounded-lg border border-gray-200 bg-gray-50 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5 transition-colors duration-300">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
            Declarar Tickets Sobrantes
          </h3>
          <p className="text-sm text-gray-600 dark:text-zinc-300">
            Indique el tipo de ticket y la cantidad sobrante. El sistema anulará
            los <strong>últimos tickets generados</strong> de ese tipo durante
            su turno actual.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                Tipo de Acceso
              </Label>
              <Select
                value={sobranteData.tipo_ticket_id}
                onValueChange={(val) =>
                  setSobranteData({ ...sobranteData, tipo_ticket_id: val })
                }
              >
                <SelectTrigger className="w-full bg-white border-[#C4A77D] text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-[#C4A77D] dark:text-white">
                  <SelectGroup>
                    {tiposTicket.map((tipo) => (
                      <SelectItem
                        key={tipo.id}
                        value={String(tipo.id)}
                        className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {tipo.nombre}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                Cantidad Sobrante
              </Label>
              <Input
                type="number"
                min="1"
                value={sobranteData.cantidad}
                onChange={(e) =>
                  setSobranteData({ ...sobranteData, cantidad: e.target.value })
                }
                className="bg-white text-gray-900 focus-visible:ring-[#C4A77D] border-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner transition-colors duration-300"
                placeholder="Ej: 10"
              />
            </div>

            <Button
              type="button"
              onClick={() => setScannerActivoTickets(!scannerActivoTickets)}
              className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:text-black font-bold flex items-center gap-2 bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40 shadow-lg"
            >
              <Camera className="w-4 h-4" />
              {scannerActivoTickets ? "Cerrar Escáner" : "Escanear ticket"}
            </Button>
          </div>

          {/* VENTANA DEL ESCÁNER DE CÁMARA */}
          {scannerActivoTickets && (
            <div className="bg-gray-50 border border-gray-300 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 p-4 rounded-lg relative transition-colors duration-300">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-sm text-[#C4A77D]">
                  Apunte la cámara al código de barras o QR
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScannerActivoTickets(false)}
                  className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-800"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div id="reader" className="w-full max-w-md mx-auto"></div>
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
          <Button
            disabled={loadingSobrantes || !sobranteData.tipo_ticket_id}
            size="lg"
            onClick={handleDeclararSobrantes}
            className="bg-[#C4A77D] hover:bg-red-600 hover:text-white text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black dark:hover:bg-red-500 dark:hover:text-white font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
          >
            {loadingSobrantes ? "Procesando..." : "Marcar como sobrantes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

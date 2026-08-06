"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

interface Ticket {
  nombre: string;
  precio: string | number;
}
interface Precio {
  id: number;
  nombre: string;
  tipo_usuario: string;
  precio: string | number;
}
interface TipoTicket {
  id: number;
  nombre: string;
  precio: number;
  activo: boolean;
}

export default function CrearTicket({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [tiposTicket, setTiposTicket] = useState<TipoTicket[]>([]);

  const [data, setData] = useState({
    nombre: "",
    precio: "",
    ticket: "",
    ticketEstado: "",
  });

  if (!usuario || !usuario.includes("admin")) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>
          No tienes los permisos de administrador necesarios para esta sección.
        </p>
      </div>
    );
  }

  useEffect(() => {
    async function fetchPrecios() {
      const { data, error } = await supabase
        .from("tipos_ticket")
        .select("*")
        .order("id", { ascending: true });
      if (error) {
        toast.error("ERROR AL CARGAR LOS PRECIOS", {
          description: `OCURRIÓ UN ERROR AL CARGAR LOS PRECIOS ${error.message}`,
        });
      } else if (data) {
        setPrecios(data);
      }
      const { data: tipos } = await supabase.from("tipos_ticket").select("*");
      if (tipos) setTiposTicket(tipos as TipoTicket[]);
    }

    fetchPrecios();
  }, [supabase]);

  const handleGuardarTicket = async () => {
    setLoading(true);
    if (!data.nombre || !data.precio) {
      toast.error("TICKET NO CREADO", {
        description: `LOS CAMPOS NO DEBEN ESTAR VACIOS`,
      });
      setLoading(false);
      return;
    } else if (Number(data.precio) < 0) {
      toast.error("TICKET NO CREADO", {
        description: `EL PRECIO NO PUEDE SER MENOR A 0`,
      });
      setLoading(false);
      return;
    }
    try {
      const { data: ticketCreado, error } = await supabase
        .from("tipos_ticket")
        .insert([
          {
            nombre: data.nombre,
            precio: data.precio,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      toast.success("TICKET CREADO", {
        description: "EL TICKET FUE CREADO CORRECTAMENTE",
      });
      setData({ ...data, nombre: "", precio: "" });
      // Recargar listas
      const { data: tipos } = await supabase.from("tipos_ticket").select("*");
      if (tipos) {
        setTiposTicket(tipos as TipoTicket[]);
        setPrecios(tipos as Precio[]);
      }
    } catch (error: any) {
      toast.error("TICKET NO CREADO", {
        description: `OCURRIÓ UN ERROR AL CREAR EL TICKET ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleChangePrecios = (id: number, nuevoValor: string) => {
    setPrecios((preciosAnteriores) =>
      preciosAnteriores.map((precio) =>
        precio.id === id ? { ...precio, precio: nuevoValor } : precio,
      ),
    );
  };

  const handleGuardarPrecios = async () => {
    setLoading(true);
    for (let Ticket of precios) {
      if (Number(Ticket.precio) < 0) {
        toast.error("TICKET INCORRECTO", {
          description: `EL TICKET ${Ticket.nombre} TIENE UN VALOR INVÁLIDO`,
        });
        setLoading(false);
        return;
      }
    }
    try {
      const { error } = await supabase.from("tipos_ticket").upsert(precios);

      if (error) throw error;
      toast.success("PRECIOS ACTUALIZADOS", {
        description: "LOS PRECIOS FUERON ACTUALIZADOS CORRECTAMENTE",
      });
    } catch (error: any) {
      toast.error("TICKET NO ACTUALIZADOS", {
        description: `OCURRIÓ UN ERROR AL ACTUALIZAR LOS TICKETS ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBajaTicket = async () => {
    setLoading(true);

    try {
      const estado = data.ticketEstado.includes("Activo") ? true : false;
      const { error } = await supabase
        .from("tipos_ticket")
        .update({ activo: estado })
        .eq("id", data.ticket);

      if (error) throw error;
      if (data.ticketEstado === "Activo") {
        toast.success("TICKET ACTIVADO", {
          description: `EL TICKET FUE ACTIVADO CORRECTAMENTE`,
        });
      } else {
        toast.success("TICKET DESACTIVADO", {
          description: `EL TICKET FUE DESACTIVADO CORRECTAMENTE`,
        });
      }
    } catch (error: any) {
      toast.error("TICKET NO DESACTIVADO", {
        description: `EL TICKET NO FUE DESACTIVADO OCURRIÓ UN ERROR ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
  };

  useEffect(() => {
    const ticketEncontrado = tiposTicket.find(
      (item) => String(item.id) === String(data.ticket),
    );
    setData((prev) => ({
      ...prev,
      ticketEstado: ticketEncontrado?.activo === true ? "Activo" : "Baja",
    }));
  }, [data.ticket, tiposTicket]);

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg w-full dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#C4A77D] pb-3 text-gray-900 dark:text-white">
        Administración de tickets
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full">
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 w-full dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5 transition-colors duration-300">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
            Datos del Ticket a crear
          </h3>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Nombre
            </Label>
            <Input
              name="nombre"
              value={data.nombre || ""}
              onChange={handleChange}
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Precio
            </Label>
            <Input
              name="precio"
              type="number"
              value={data.precio || ""}
              onChange={handleChange}
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleGuardarTicket}
          className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
        >
          {loading ? "Registrando ticket..." : "Crear ticket"}
        </Button>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#C4A77D] pb-3 text-gray-900 dark:text-white mt-8">
        Editar precios de los tickets
      </h2>

      {/* BLOQUE DATOS PRECIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {precios.length > 0 ? (
          precios.map((ticket) => (
            <div key={ticket.id} className="space-y-2">
              <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                {ticket.nombre}
              </Label>
              <Input
                name={ticket.nombre}
                type="number"
                value={ticket.precio || ""}
                onChange={(e) => handleChangePrecios(ticket.id, e.target.value)}
                className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
              />
            </div>
          ))
        ) : (
          <p className="text-gray-500 dark:text-zinc-400">
            Cargando precios...
          </p>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleGuardarPrecios}
          className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
        >
          {loading ? "Registrando precios..." : "Editar precios"}
        </Button>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#C4A77D] pb-3 text-gray-900 dark:text-white mt-8">
        Editar estado de un ticket
      </h2>

      {/* BLOQUE DATOS PRECIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-semibold text-gray-700 dark:text-zinc-300">
            Tipo de Acceso
          </Label>
          <Select
            value={data.ticket}
            onValueChange={(val) => handleSelectChange("ticket", val)}
          >
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-zinc-300 dark:shadow-inner">
              <SelectValue placeholder="Seleccione ticket a cambiar estado" />
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
            Estado
          </Label>
          <Select
            value={data.ticketEstado || ""}
            onValueChange={(val) => handleSelectChange("ticketEstado", val)}
          >
            <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-zinc-300 dark:shadow-inner">
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-white/10 dark:text-white">
              <SelectGroup>
                <SelectItem
                  value={"Activo"}
                  className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Activo
                </SelectItem>
                <SelectItem
                  value={"Baja"}
                  className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  Baja
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleBajaTicket}
          className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
        >
          {loading ? "Cambiando estado..." : "Editar estado"}
        </Button>
      </div>
    </div>
  );
}

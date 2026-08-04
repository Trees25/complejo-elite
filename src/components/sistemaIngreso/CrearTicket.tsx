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
  id: number; // o string si usas UUID
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
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg">
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
    } else if (Number(data.precio) < 0) {
      toast.error("TICKET NO CREADO", {
        description: `EL PRECIO NO PUEDE SER MENOR A 0`,
      });
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

      // Upsert actualiza los registros existentes si el ID ya existe
      if (error) throw error;
      toast.success("TICKET CREADO", {
        description: "EL TICKET FUE CREADO CORRECTAMENTE",
      });
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
    if (precios) {
      for (let Ticket of precios) {
        if (Number(Ticket.precio) < 0) {
          toast.error("TICKET INCORRECTO", {
            description: `EL TICKET ${Ticket.nombre} TIENE UN VALOR INVÁLIDO`,
          });
        }
      }
      setLoading(false);
      return;
    }
    try {
      // Upsert actualiza los registros existentes si el ID ya existe
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
      // Upsert actualiza los registros existentes si el ID ya existe
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
        description: `EL TICKET NO FUE DESATIVADO OCURRIÓ UN ERROR ${error.message}`,
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
  }, [data.ticket, tiposTicket]); // Se recalcula si cambian estos valores

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-card text-white border border-gray-200 rounded-xl shadow-lg w-full">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-gold pb-3">
        Administración de tickets
      </h2>

      <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full">
        <div className="space-y-4 bg-card/60 p-4 sm:p-5 rounded-lg border border-gray-200 w-full">
          <h3 className="font-bold text-gold-gradient uppercase tracking-wide">
            Datos del Ticket a crear
          </h3>
          <div className="space-y-2">
            <Label className="font-semibold">Nombre</Label>
            <Input
              name="nombre"
              value={data.nombre || ""}
              onChange={handleChange}
              className="bg-card focus-visible:ring-[#C4A77D]"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Precio</Label>
            <Input
              name="precio"
              value={data.precio || ""}
              onChange={handleChange}
              className="bg-card focus-visible:ring-[#C4A77D]"
            />
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleGuardarTicket}
          className="bg-black hover:bg-gray-800 text-gold font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
        >
          {loading ? "Registrando ticket..." : "Crear ticket"}
        </Button>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-gold pb-3">
        Editar precios de los tickets
      </h2>

      {/* BLOQUE DATOS PRECIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {precios.length > 0 ? (
          precios.map((ticket) => (
            <div key={ticket.id} className="space-y-2">
              <Label className="font-semibold text-white">
                {ticket.nombre}
              </Label>
              <Input
                name={ticket.nombre}
                type="number"
                value={ticket.precio || ""}
                onChange={(e) => handleChangePrecios(ticket.id, e.target.value)}
                className="bg-card focus-visible:ring-[#C4A77D]"
              />
            </div>
          ))
        ) : (
          <p>Cargando precios...</p>
        )}
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleGuardarPrecios}
          className="bg-black hover:bg-gray-800 text-gold font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
        >
          {loading ? "Registrando precios..." : "Editar precios"}
        </Button>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-black pb-3">
        Editar estado de un ticket
      </h2>

      {/* BLOQUE DATOS PRECIOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="font-semibold">Tipo de Acceso</Label>
          <Select
            value={data.ticket}
            onValueChange={(val) => handleSelectChange("ticket", val)}
          >
            <SelectTrigger className="w-full bg-card focus-visible:ring-[#C4A77D]  ">
              <SelectValue placeholder="Seleccione ticket a cambiar estado" />
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
          <Label className="font-semibold">Estado</Label>
          <Select
            value={data.ticketEstado || ""}
            onValueChange={(val) => handleSelectChange("ticketEstado", val)}
          >
            <SelectTrigger className="w-full bg-card focus-visible:ring-[#C4A77D]">
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value={"Activo"}>Activo</SelectItem>
                <SelectItem value={"Baja"}>Baja</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          disabled={loading}
          size="lg"
          onClick={handleBajaTicket}
          className="bg-black hover:bg-gray-800 text-gold font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all"
        >
          {loading ? "Cambiando estado..." : "Editar estado"}
        </Button>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";

interface Precio {
  id: number; // o string si usas UUID
  nombre: string;
  tipo_usuario: string;
  precio: string | number;
}

interface UsuarioProps {
  id: string;
  rol: string;
}

export default function FormEditarPrecios({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Obtener precios desde Supabase
  useEffect(() => {
    async function fetchPrecios() {
      const { data, error } = await supabase
        .from("tipos_ticket")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error al capturar precios:", error);
      } else if (data) {
        setPrecios(data);
      }
    }
    fetchPrecios();
  }, [supabase]);

  const handleChange = (id: number, nuevoValor: string) => {
    setPrecios((preciosAnteriores) =>
      preciosAnteriores.map((precio) =>
        precio.id === id ? { ...precio, precio: nuevoValor } : precio,
      ),
    );
  };

  const handleGuardarPrecios = async () => {
    setLoading(true);

    try {
      // Upsert actualiza los registros existentes si el ID ya existe
      const { error } = await supabase.from("tipos_ticket").upsert(precios);

      if (error) throw error;

      alert("¡Precios actualizados correctamente!");
    } catch (error: any) {
      console.error("Error de red:", error);
      alert("Error al actualizar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-black border border-gray-200 rounded-xl shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-black pb-3">
        Editar precios del camping
      </h2>

      {/* BLOQUE DATOS PRECIOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {precios.length > 0 ? (
          precios.map((ticket) => (
            <div key={ticket.id} className="space-y-2">
              <Label className="font-semibold">{ticket.nombre}</Label>
              <Input
                name={ticket.nombre}
                type="number"
                value={ticket.precio || ""}
                onChange={(e) => handleChange(ticket.id, e.target.value)}
                className="bg-white focus-visible:ring-[#3FA7AC]"
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
          className="bg-[#3FA7AC] hover:bg-gray-500 text-white font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto"
        >
          {loading ? "Registrando precios..." : "Editar precios"}
        </Button>
      </div>
    </div>
  );
}

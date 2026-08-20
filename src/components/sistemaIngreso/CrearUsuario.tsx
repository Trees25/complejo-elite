"use client";
import { useState } from "react";
import { crearUsuarioAdmin } from "@/app/actions/usuarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

export default function FormCrearUsuario() {
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState("ingreso");
  const [showPassword, setShowPassword] = useState(false); // <-- NUEVO ESTADO

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    const formData = new FormData(e.currentTarget);
    const resultado = await crearUsuarioAdmin(formData);

    setLoading(false);

    if (resultado.success) {
      toast.success("ÉXITO", { description: resultado.message });
      form.reset();
      setRol("ingreso");
    } else {
      toast.error("ERROR", { description: resultado.error });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:gap-8 w-full">
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200 w-full dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 dark:ring-1 dark:ring-white/5 transition-colors duration-300">
          <h3 className="font-bold text-[#C4A77D] uppercase tracking-wide">
            Datos del usuario
          </h3>

          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Nombre Completo
            </Label>
            <Input
              name="nombre"
              placeholder="Ej: JUAN PEREZ"
              required
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Correo Electrónico
            </Label>
            <Input
              name="email"
              type="email"
              placeholder="Ej: usuario@correo.com"
              required
              className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Rol
            </Label>
            <Select value={rol} onValueChange={setRol}>
              <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-zinc-300 dark:shadow-inner">
                <SelectValue placeholder="Seleccione rol" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-white/10 dark:text-white">
                <SelectGroup>
                  <SelectItem
                    value="INGRESO"
                    className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Ingreso
                  </SelectItem>
                  <SelectItem
                    value="ADMIN"
                    className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Admin
                  </SelectItem>
                  <SelectItem
                    value="SUPERVISOR"
                    className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    Supervisor
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <input type="hidden" name="rol" value={rol} />
          </div>

          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Contraseña
            </Label>
            {/* Contenedor relativo para posicionar el botón flotante */}
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="bg-white border-gray-300 text-gray-900 pr-10 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition-colors"
              >
                {showPassword ? (
                  // Ícono de "Ojo cerrado"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                ) : (
                  // Ícono de "Ojo abierto"
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
        <Button
          type="submit"
          disabled={loading}
          size="lg"
          className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto transition-all bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
        >
          {loading ? "Creando usuario..." : "Crear Usuario"}
        </Button>
      </div>
    </form>
  );
}

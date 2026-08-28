"use client";
import { useState, useEffect } from "react";
import {
  crearUsuarioAdmin,
  alternarEstadoUsuario,
} from "@/app/actions/usuarios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Ban, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";

interface UsuarioPerfil {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
}

export default function FormCrearUsuario() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [rol, setRol] = useState("INGRESO");
  const [showPassword, setShowPassword] = useState(false);

  const [usuarios, setUsuarios] = useState<UsuarioPerfil[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);

  // <-- NUEVO: Función auxiliar centralizada para guardar logs -->
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

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setCargandoLista(true);

      const { data, error } = await supabase
        .from("perfiles")
        .select("id, nombre, email, rol, activo")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("Error de Supabase:", error);
        toast.error("ERROR EN BASE DE DATOS", { description: error.message });
        return;
      }

      if (data) {
        setUsuarios(data);
      }
    } catch (err: any) {
      console.error("Error crítico al cargar:", err);
      toast.error("ERROR DE CONEXIÓN", {
        description: "Revisa la consola de tu navegador.",
      });
    } finally {
      setCargandoLista(false);
    }
  };

  const handleAlternarEstado = async (
    userId: string,
    nombre: string,
    estadoActual: boolean,
  ) => {
    const accionTexto = estadoActual ? "suspender" : "reactivar";
    const confirmacion = window.confirm(
      `¿Estás seguro que deseas ${accionTexto} el acceso de ${nombre}?`,
    );

    if (!confirmacion) return;

    const toastId = toast.loading(
      `${estadoActual ? "Suspendiendo" : "Reactivando"} usuario...`,
    );

    const resultado = await alternarEstadoUsuario(userId, estadoActual);

    if (resultado.success) {
      toast.success(resultado.message, { id: toastId });

      // <-- NUEVO: Log de suspender / reactivar empleado -->
      const nuevoEstado = estadoActual ? "Suspendido" : "Activo";
      await registrarLog(
        "MODIFICACION_ACCESO",
        `Cambió el acceso del empleado "${nombre}" a ${nuevoEstado}`,
      );

      fetchUsuarios();
    } else {
      const errorMessage =
        typeof resultado.error === "string"
          ? resultado.error
          : "Error desconocido";
      toast.error(errorMessage, { id: toastId });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;

    const formData = new FormData(e.currentTarget);
    const nombreUsuario = formData.get("nombre") as string;
    const rolUsuario = formData.get("rol") as string;

    const resultado = await crearUsuarioAdmin(formData);

    setLoading(false);

    if (resultado.success) {
      toast.success("ÉXITO", { description: resultado.message });

      // <-- NUEVO: Log al crear un nuevo empleado -->
      await registrarLog(
        "CREACION_USUARIO",
        `Creó un nuevo empleado llamado "${nombreUsuario}" con el rol de ${rolUsuario}`,
      );

      form.reset();
      setRol("INGRESO");
      fetchUsuarios();
    } else {
      toast.error("ERROR", { description: resultado.error });
    }
  };

  return (
    <div className="space-y-12">
      {/* SECCIÓN 1: FORMULARIO DE CREACIÓN */}
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
                      Cajero
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

        <div className="pt-2 flex flex-col sm:flex-row justify-end gap-4">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:hover:text-white dark:text-black font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
          >
            {loading ? "Creando usuario..." : "Crear Usuario"}
          </Button>
        </div>
      </form>

      {/* SECCIÓN 2: LISTADO Y ELIMINACIÓN DE USUARIOS */}
      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-[#C4A77D] pb-3 text-gray-900 dark:text-white mt-8">
          Gestión de Usuarios (Accesos)
        </h2>

        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
          {cargandoLista ? (
            <div className="p-8 text-center text-gray-500">
              Cargando usuarios...
            </div>
          ) : usuarios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay usuarios registrados en el sistema.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="uppercase tracking-wider border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-zinc-950/50 text-[#C4A77D]">
                  <tr>
                    <th className="px-6 py-4 font-bold">Estado</th>
                    <th className="px-6 py-4 font-bold">Nombre</th>
                    <th className="px-6 py-4 font-bold">Correo</th>
                    <th className="px-6 py-4 font-bold">Rol</th>
                    <th className="px-6 py-4 font-bold text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {usuarios.map((user) => (
                    <tr
                      key={user.id}
                      className={`transition-colors ${!user.activo ? "bg-red-50/50 dark:bg-red-950/10 opacity-75" : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"}`}
                    >
                      <td className="px-6 py-4">
                        {user.activo ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>{" "}
                            Activo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-bold text-xs">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>{" "}
                            Suspendido
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-6 py-4 font-medium ${user.activo ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400 line-through decoration-red-500/50"}`}
                      >
                        {user.nombre}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-zinc-400">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            user.rol === "ADMIN"
                              ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                              : user.rol === "SUPERVISOR"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          }`}
                        >
                          {user.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleAlternarEstado(
                              user.id,
                              user.nombre,
                              user.activo,
                            )
                          }
                          className={
                            user.activo
                              ? "text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                              : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                          }
                          title={
                            user.activo
                              ? "Suspender acceso"
                              : "Reactivar acceso"
                          }
                        >
                          {user.activo ? (
                            <>
                              <Ban className="h-4 w-4 mr-2" /> Bloquear
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" /> Permitir
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

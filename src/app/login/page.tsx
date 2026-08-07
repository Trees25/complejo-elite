"use client";
import { login } from "./actions";
import { toast } from "sonner";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // <-- NUEVO ESTADO
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Validar que no haya campos vacíos
    if (!email || !password) {
      toast.error("DATOS INCOMPLETOS", {
        description: "DEBE COMPLETAR TODOS LOS CAMPOS",
      });
      setLoading(false);
      return;
    }

    // 2. Validación estricta del formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("CORREO INVÁLIDO", {
        description:
          "DEBE INGRESAR UN FORMATO DE CORREO VÁLIDO (ejemplo@correo.com)",
      });
      setLoading(false);
      return;
    }

    // 3. Consulta directa a Supabase desde el navegador
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("CREDENCIALES INCORRECTAS", {
        description: "LAS CREDENCIALES DE SESIÓN SON INCORRECTAS",
      });
      setLoading(false);
      return;
    }

    // 4. Redirección tras inicio de sesión exitoso
    router.push("/sistema-ingreso");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-card p-8 text-white shadow-lg"
      >
        <h1 className="text-2xl font-bold">Ingreso al Sistema</h1>

        <div className="flex flex-col gap-2">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="usuario@gmail.com"
            required
            className="rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password">Contraseña</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full rounded border border-zinc-700 bg-zinc-800 p-2 pr-10 text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg font-bold flex items-center justify-center gap-2 text-white dark:text-black bg-[#C4A77D] hover:bg-[#C4A77D]/90 bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] shadow-lg transition-all disabled:opacity-50"
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-gold" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          )}
          {loading ? "Verificando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}

{
  /*
  si quisiese que el servidor tambien valide
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // 1. Validar que no haya campos vacíos
    if (!email || !password) {
      toast.error("DATOS INCOMPLETOS", {
        description: "DEBE COMPLETAR TODOS LOS CAMPOS",
      });
      setLoading(false);
      return;
    }

    // 2. Validación estricta del formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("CORREO INVÁLIDO", {
        description:
          "DEBE INGRESAR UN FORMATO DE CORREO VÁLIDO (ejemplo@correo.com)",
      });
      setLoading(false);
      return;
    }

    // 3. Si todo es correcto, consultamos al servidor
    const resultado = await login(formData);

    if (resultado?.error) {
      toast.error("CREDENCIALES INCORRECTAS", {
        description: resultado.error,
      });
      setLoading(false);
    }
  };

como quedaría eso con los cambios?

*/
}

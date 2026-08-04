"use client";
import { login } from "./actions";
import { toast } from "sonner";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

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
          <input
            id="password"
            name="password"
            type="password"
            placeholder="•••••••"
            required
            className="rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-black hover:bg-gray-800 text-gold font-bold px-4 py-4 text-lg shadow-lg w-full sm:w-auto transition-all rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
}

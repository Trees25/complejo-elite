import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <form className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-zinc-900 p-8 text-white shadow-lg">
        <h1 className="text-2xl font-bold">Ingreso al Sistema</h1>

        {searchParams?.error && (
          <p className="text-red-500 bg-red-950 p-2 rounded">
            {searchParams.error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
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
            required
            className="rounded border border-zinc-700 bg-zinc-800 p-2 text-white"
          />
        </div>

        {/* El atributo formAction conecta el botón con la función del servidor */}
        <button
          formAction={login}
          className="mt-4 rounded bg-gold p-2 font-bold text-black transition-colors hover:bg-gold-hover"
        >
          Iniciar sesión
        </button>
      </form>
    </div>
  );
}

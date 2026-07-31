import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import HeroUI from "@/components/sistemaIngreso/HeroUI"; // Ajusta la ruta según dónde guardes el componente cliente

export default async function IngresoPage() {
  const supabase = await createClient();

  // 1. Obtener usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  // 2. Buscar su rol
  const { data, error } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  // Imprimimos el error para ver qué dice Supabase
  const perfil = data as { rol: string } | null;
  const rol = perfil?.rol === "ADMIN" ? "admin" : "ingreso";

  // 3. Renderizar el componente cliente pasándole el rol
  return <HeroUI rolInicial={rol} />;
}

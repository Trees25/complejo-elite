"use server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

export async function crearUsuarioAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nombre = formData.get("nombre") as string;
  const rol = formData.get("rol") as string;

  try {
    // 1. Crear en Auth
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) throw authError;

    const userId = authData.user.id;

    // 2. Insertar en perfiles (si no usas el trigger automático de postgres)
    const { error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .upsert([{ id: userId, email, nombre, rol }]);

    if (perfilError) throw perfilError;

    return { success: true, message: "Usuario creado correctamente" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

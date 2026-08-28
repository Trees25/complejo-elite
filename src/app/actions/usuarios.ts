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

export async function alternarEstadoUsuario(
  userId: string,
  estadoActual: boolean,
) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return { success: false, error: "Faltan credenciales de administrador." };
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 1. Determinar qué hacer: Si está activo, lo baneamos. Si no, le quitamos el ban ("none").
    const nuevoBan = estadoActual ? "876000h" : "none";
    const nuevoEstado = !estadoActual;

    // 2. Aplicar el bloqueo en el sistema de Autenticación de Supabase
    const { error: banError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      {
        ban_duration: nuevoBan,
      },
    );

    if (banError) throw banError;

    // 3. Actualizar la etiqueta visual en tu tabla perfiles
    const { error: dbError } = await supabaseAdmin
      .from("perfiles")
      .update({ activo: nuevoEstado })
      .eq("id", userId);

    if (dbError) throw dbError;

    return {
      success: true,
      message: nuevoEstado
        ? "Usuario reactivado con éxito"
        : "Usuario suspendido. Ya no podrá ingresar.",
    };
  } catch (error: any) {
    console.error("Error al alternar estado:", error);
    return {
      success: false,
      error: "Ocurrió un error al intentar modificar el acceso del usuario.",
    };
  }
}

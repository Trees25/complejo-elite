// utils/formatearFecha.js (Puedes guardar esto en un archivo separado o en tu componente)

/**
 * Convierte una fecha UTC de Supabase a la hora local.
 *
 * @param {string} fechaSupabase - String de fecha (ej: "2026-08-06T23:17:10+00:00")
 * @returns {string} Fecha y hora formateada (ej: "6/8/2026, 20:17:10")
 */
export default function formatDate(fechaSupabase) {
  if (!fechaSupabase) return "Fecha inválida";

  // Al pasar el string a new Date(), JavaScript entiende que viene en UTC
  const fecha = new Date(fechaSupabase);

  // Intl.DateTimeFormat aplica la zona horaria local del sistema operativo
  return new Intl.DateTimeFormat("es-AR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour12: false, // Formato de 24 horas
  }).format(fecha);
}

{
  /*
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
*/
}

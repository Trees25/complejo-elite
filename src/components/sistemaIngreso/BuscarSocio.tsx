"use client";
import { useState, useEffect, useDeferredValue } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronsUpDown,
  Camera,
  X,
  UserPlus,
  Upload,
  UserCog,
  User,
} from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "sonner";
import imageCompression from "browser-image-compression"; // <-- 1. NUEVO IMPORT

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/utils/supabase/client";

interface Socio {
  id: string;
  dni: string;
  nombre_completo: string;
  estado: boolean;
  foto_url?: string;
}

export default function FormIngreso({ usuario }: { usuario: String }) {
  const supabase = createClient();
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const busquedaDiferida = useDeferredValue(busqueda);
  const [open, setOpen] = useState(false);
  const [scannerActivo, setScannerActivo] = useState(false);

  // Estados para el modal de socio nuevo
  const [modalNuevoSocio, setModalNuevoSocio] = useState(false);
  const [guardandoSocio, setGuardandoSocio] = useState(false);
  const [modalModificarDatos, setModalModificarDatos] = useState(false);
  const [nuevoSocio, setNuevoSocio] = useState({
    dni: "",
    nombre_completo: "",
  });
  const [fotoSocio, setFotoSocio] = useState<File | null>(null); // <-- 2. NUEVO ESTADO PARA LA FOTO

  // <-- NUEVO: Estado para almacenar la nueva foto al modificar -->
  const [nuevaFotoSocio, setNuevaFotoSocio] = useState<File | null>(null);

  // Estados para el modal de importación CSV
  const [modalImportar, setModalImportar] = useState(false);
  const [importando, setImportando] = useState(false);
  const [fileCsv, setFileCsv] = useState<File | null>(null);

  const [data, setData] = useState({
    socioId: "",
    socioNombreApellido: "",
    socioDni: "",
    socioBaja: "",
    cantidadInvitados: "0",
    vehiculosInvitados: "0",
    observaciones: "",
    formaPago: "efectivo",
    socioFotoUrl: "",
  });

  const [ingresantes, setIngresantes] = useState<string[]>([]);

  // Validación de permisos
  if (
    !usuario ||
    (!usuario.includes("admin") &&
      !usuario.includes("ingreso") &&
      !usuario.includes("supervisor"))
  ) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/50">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para esta sección.</p>
      </div>
    );
  }

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

  // Cargar socios desde Supabase
  const fetchSocios = async () => {
    const { data: sociosData, error } = await supabase
      .from("socios")
      .select("id, dni, nombre_completo, estado,foto_url");

    if (error) {
      console.error("Error al cargar socios:", error);
    } else if (sociosData) {
      setSocios(sociosData);
    }
  };

  useEffect(() => {
    fetchSocios();
  }, [supabase]);

  // Inicializar el escáner de cámara
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (scannerActivo) {
      const config = {
        fps: 5,
        formatsToSupport: [Html5QrcodeSupportedFormats.PDF_417],
        showTorchButtonIfSupported: true,
        showZoomSliderIfSupported: true,
      };

      scanner = new Html5QrcodeScanner("reader", config, false);

      scanner.render(
        async (decodedText) => {
          const partes = decodedText.split("@");

          let dniBuscado = decodedText.trim();
          if (partes.length >= 5) {
            dniBuscado = partes[4].trim();
          }
          handleSeleccionarSocio(dniBuscado);

          try {
            if (scanner) {
              await scanner.clear();
            }
          } catch (error: any) {
            console.error("Error al limpiar:", error);
          } finally {
            setScannerActivo(false);
          }
        },
        (error) => {
          // Silenciar errores de lectura continua
        },
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(() => {});
      }
    };
  }, [scannerActivo, socios]);

  const sociosFiltrados = socios
    .filter((socio) => {
      const texto = busquedaDiferida.toLowerCase();
      const nombre = socio.nombre_completo
        ? socio.nombre_completo.toLowerCase()
        : "";
      const dni = socio.dni ? String(socio.dni) : "";
      return nombre.includes(texto) || dni.includes(texto);
    })
    .slice(0, 50);

  const handleSeleccionarSocio = (dni: string) => {
    const socioEncontrado = socios.find((s) => String(s.dni) === dni);
    if (socioEncontrado) {
      setData((prev) => ({
        ...prev,
        socioNombreApellido: socioEncontrado.nombre_completo,
        socioDni: socioEncontrado.dni,
        socioBaja: socioEncontrado.estado ? "Activo" : "Dado de baja",
        socioId: socioEncontrado.id,
        socioFotoUrl: socioEncontrado.foto_url || "",
      }));
      setIngresantes([String(socioEncontrado.dni)]);
    } else {
      alert("No se encontró ningún socio con el DNI/Código escaneado: " + dni);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setData({ ...data, [name]: value });
  };

  // <-- 3. LÓGICA MODIFICADA PARA SUBIR LA FOTO AL CREAR EL SOCIO
  const handleCrearSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoSocio.dni || !nuevoSocio.nombre_completo) {
      return alert("Debe completar nombre y DNI del socio.");
    }

    setGuardandoSocio(true);
    try {
      // Primero creamos el socio para obtener su ID
      const { data: socioCreado, error } = await supabase
        .from("socios")
        .insert([
          {
            dni: nuevoSocio.dni,
            nombre_completo: nuevoSocio.nombre_completo.toUpperCase(),
            estado: true, // Activo por defecto
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Si el usuario seleccionó una foto, la comprimimos y subimos
      if (fotoSocio) {
        const opciones = {
          maxSizeMB: 0.1, // 100kb máx
          maxWidthOrHeight: 400,
          useWebWorker: true,
          fileType: "image/webp",
        };

        const archivoComprimido = await imageCompression(fotoSocio, opciones);
        const rutaArchivo = `${socioCreado.id}/perfil.webp`;

        const { error: uploadError } = await supabase.storage
          .from("socios") // Bucket socios
          .upload(rutaArchivo, archivoComprimido, {
            upsert: true,
            contentType: "image/webp",
          });

        if (uploadError) {
          console.error("Error detallado de subida:", uploadError);
          toast.error("FOTO NO SUBIDA", {
            description: `El socio se creó, pero la foto falló: ${uploadError.message}`,
          });
          // Obtenemos la URL pública y actualizamos el registro del socio
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("socios").getPublicUrl(rutaArchivo);

          await supabase
            .from("socios")
            .update({ foto_url: publicUrl })
            .eq("id", socioCreado.id);
          socioCreado.foto_url = publicUrl;
        }
      }

      setSocios((prev) => [...prev, socioCreado]);
      toast.success("SOCIO CREADO", {
        description: `El socio se creó correctamente `,
      });

      setModalNuevoSocio(false);
      setNuevoSocio({ dni: "", nombre_completo: "" });
      setFotoSocio(null); // Limpiamos el estado de la foto
      handleSeleccionarSocio(String(socioCreado.dni));
    } catch (error: any) {
      toast.error("ERROR AL CREAR EL SOCIO", {
        description: `Hubo un error al crear el socio ${error.message}`,
      });
    } finally {
      setGuardandoSocio(false);
    }
  };

  // Función para importar socios masivamente por CSV (Upsert)
  const handleImportarCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileCsv) {
      return toast.error("ARCHIVO FALTANTE", {
        description: "Debe seleccionar un archivo CSV para importar.",
      });
    }

    setImportando(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("El archivo está vacío");

        const filas = text
          .split("\n")
          .map((f) => f.trim())
          .filter((f) => f.length > 0);
        const tieneCabeceras =
          filas[0].toLowerCase().includes("nombre") ||
          filas[0].toLowerCase().includes("dni");
        const datos = tieneCabeceras ? filas.slice(1) : filas;

        const sociosUpsert = datos.map((fila, index) => {
          const columnas = fila.split(";");

          if (columnas.length < 3) {
            throw new Error(
              `Fila ${index + 1} incompleta. Formato requerido: Nombre;DNI;Estado`,
            );
          }

          const [nombre, dni, estado] = columnas;

          return {
            nombre_completo: nombre.trim().toUpperCase(),
            dni: dni.trim(),
            estado:
              estado.trim().toLowerCase() === "true" ||
              estado.trim().toLowerCase() === "activo",
          };
        });

        // UPSERT: Inserta si no existe, actualiza si existe (basado en onConflict: 'dni')
        const { error } = await supabase
          .from("socios")
          .upsert(sociosUpsert, { onConflict: "dni" });

        if (error) throw error;

        toast.success("IMPORTACIÓN EXITOSA", {
          description: `Se procesaron ${sociosUpsert.length} socios correctamente.`,
        });

        setModalImportar(false);
        setFileCsv(null);
        fetchSocios(); // Refrescar lista
      } catch (error: any) {
        toast.error("ERROR DE IMPORTACIÓN", {
          description: error.message,
        });
      } finally {
        setImportando(false);
      }
    };

    reader.onerror = () => {
      toast.error("ERROR", { description: "No se pudo leer el archivo." });
      setImportando(false);
    };

    reader.readAsText(fileCsv);
  };

  const handleEditarSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardandoSocio(true);
    const estadoSocio = data.socioBaja.includes("Activo") ? true : false;
    try {
      let nuevaUrlFoto = data.socioFotoUrl; // <-- NUEVO: Mantener la actual por defecto

      // <-- NUEVO: LÓGICA PARA REEMPLAZAR LA FOTO -->
      if (nuevaFotoSocio) {
        const opciones = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 400,
          useWebWorker: true,
          fileType: "image/webp",
        };

        const archivoComprimido = await imageCompression(
          nuevaFotoSocio,
          opciones,
        );
        const rutaArchivo = `${data.socioId}/perfil.webp`;

        const { error: uploadError } = await supabase.storage
          .from("socios")
          .upload(rutaArchivo, archivoComprimido, {
            upsert: true, // Esto sobreescribe (borra la anterior y pone la nueva)
            contentType: "image/webp",
          });

        if (uploadError) {
          toast.error("FOTO NO ACTUALIZADA", {
            description: "Hubo un error al subir la nueva foto.",
          });
        } else {
          const {
            data: { publicUrl },
          } = supabase.storage.from("socios").getPublicUrl(rutaArchivo);

          // Agregamos un timestamp para forzar al navegador a limpiar el caché y mostrar la nueva
          nuevaUrlFoto = `${publicUrl}?t=${new Date().getTime()}`;
        }
      }

      const { data: socioEditado, error } = await supabase
        .from("socios")
        .update([
          {
            dni: data.socioDni,
            nombre_completo: data.socioNombreApellido.toUpperCase(),
            estado: estadoSocio,
            ...(nuevaFotoSocio ? { foto_url: nuevaUrlFoto } : {}), // <-- NUEVO: Solo enviar la foto si se cambió
          },
        ])
        .eq("id", data.socioId);

      if (error) throw error;

      // <-- NUEVO: Actualizar la interfaz instantáneamente -->
      setData((prev) => ({ ...prev, socioFotoUrl: nuevaUrlFoto }));

      toast.success("SOCIO MODIFICADO", {
        description: `LOS DATOS DEL SOCIO ${data.socioNombreApellido} FUERON MODIFICADOS CORRECTAMENTE`,
      });

      setModalModificarDatos(false); // <-- NUEVO: Cerramos el modal
      setNuevaFotoSocio(null); // <-- NUEVO: Limpiamos el input de la foto
      fetchSocios(); // Refrescar estado local
    } catch (error: any) {
      toast.error("SOCIO NO MODIFICADO", {
        description: `Ocurrió un error al modificar los datos del socio  ${error.message}`,
      });
    } finally {
      setGuardandoSocio(false);
    }
  };

  const handleRegistrarIngreso = async () => {
    if (!data.socioDni || !data.socioId) {
      return toast.error("ERROR AL REGISTRAR INGRESO", {
        description: "Debes seleccionar un socio antes de registrar un ingreso",
      });
    }

    setLoading(true);
    try {
      // 1. Obtenemos la fecha actual estricta en formato YYYY-MM-DD (hora local)
      const fechaBase = new Date().toLocaleDateString("en-CA");

      // 2. Forzamos el huso horario de Argentina (-03:00) y lo convertimos a UTC
      const inicioDia = new Date(
        `${fechaBase}T00:00:00.000-03:00`,
      ).toISOString();
      const finDia = new Date(`${fechaBase}T23:59:59.999-03:00`).toISOString();

      // 3. Verificamos si existe un ingreso hoy
      const { data: ingresosHoy, error: selectError } = await supabase
        .from("ingresos")
        .select("id")
        .eq("socio_id", data.socioId)
        .gte("created_at", inicioDia)
        .lte("created_at", finDia);

      if (selectError) throw selectError;

      if (ingresosHoy && ingresosHoy.length > 0) {
        toast.error("INGRESO RECHAZADO", {
          description: "Este socio ya ingresó hoy.",
        });
        setLoading(false);
        return; // Detiene la ejecución aquí
      }

      // 4. Si pasa la validación, insertamos el nuevo registro
      const { error: insertError } = await supabase
        .from("ingresos")
        .insert([{ socio_id: data.socioId }]);

      if (insertError) throw insertError;

      // <-- NUEVO: Guardar log de auditoría del ingreso -->
      await registrarLog(
        "REGISTRO_INGRESO",
        `Registró el ingreso del socio: ${data.socioNombreApellido} (DNI: ${data.socioDni})`,
      );

      toast.success("INGRESO REGISTRADO", {
        description: "¡Ingreso registrado correctamente!",
      });

      // 5. Limpiamos el formulario
      setData({
        socioId: "",
        socioNombreApellido: "",
        socioDni: "",
        socioBaja: "",
        cantidadInvitados: "0",
        vehiculosInvitados: "0",
        observaciones: "",
        formaPago: "efectivo",
        socioFotoUrl: "",
      });
      setIngresantes([]);
    } catch (error: any) {
      toast.error("ERROR AL REGISTRAR", {
        description: `NO SE PUDO REGISTRAR EL INGRESO: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-gray-900 border border-gray-200 rounded-xl shadow-lg relative dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
      {/* MODAL NUEVO SOCIO (Individual) */}
      {modalNuevoSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-card/50 p-4 w-full h-full backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:bg-zinc-900 dark:border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
              onClick={() => {
                setModalNuevoSocio(false);
                setFotoSocio(null); // Limpiar foto al cerrar
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4 border-b border-[#C4A77D] pb-2 text-gray-900 dark:text-white">
              Registrar Nuevo Socio
            </h2>
            <form onSubmit={handleCrearSocio} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-zinc-300">DNI</Label>
                <Input
                  type="number"
                  placeholder="Ej: 35123456"
                  value={nuevoSocio.dni}
                  onChange={(e) =>
                    setNuevoSocio({ ...nuevoSocio, dni: e.target.value })
                  }
                  required
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-zinc-300">
                  Nombre Completo
                </Label>
                <Input
                  type="text"
                  placeholder="Ej: JUAN PEREZ"
                  value={nuevoSocio.nombre_completo}
                  onChange={(e) =>
                    setNuevoSocio({
                      ...nuevoSocio,
                      nombre_completo: e.target.value,
                    })
                  }
                  required
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                />
              </div>

              {/* <-- 4. NUEVO CAMPO DE FOTO EN EL FORMULARIO --> */}
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-zinc-300">
                  Foto de Perfil (Opcional)
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) => setFotoSocio(e.target.files?.[0] || null)}
                  className="bg-white border-gray-300 text-gray-900 cursor-pointer dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                />
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  La imagen se comprimirá automáticamente para ahorrar espacio.
                </p>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalNuevoSocio(false);
                    setFotoSocio(null);
                  }}
                  className="border-gray-300 text-white hover:bg-gray-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoSocio}
                  className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350]"
                >
                  {guardandoSocio ? "Guardando..." : "Guardar Socio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL editar socio(Individual) */}
      {modalModificarDatos && usuario?.includes("admin") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-card/50 p-4 w-full h-full backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:bg-zinc-900 dark:border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
              onClick={() => {
                setModalModificarDatos(false);
                setNuevaFotoSocio(null); // <-- NUEVO: Limpiamos al cerrar con la cruz
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4 border-b border-[#C4A77D] pb-2 text-gray-900 dark:text-white">
              Modificar datos socio seleccionado
            </h2>
            <form onSubmit={handleEditarSocio} className="space-y-4">
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                  Nombre Completo
                </Label>
                <Input
                  name="socioNombreApellido"
                  value={data.socioNombreApellido || ""}
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                  Documento N°
                </Label>
                <Input
                  name="socioDni"
                  value={data.socioDni || ""}
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                  onChange={handleChange}
                />
              </div>

              {/* <-- NUEVO: CAMPO DE FOTO EN MODAL MODIFICAR --> */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                  Actualizar Foto (Opcional)
                </Label>
                <Input
                  type="file"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={(e) =>
                    setNuevaFotoSocio(e.target.files?.[0] || null)
                  }
                  className="bg-white border-gray-300 text-gray-900 cursor-pointer dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                />
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Si subes una nueva foto, reemplazará a la anterior
                  automáticamente.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-semibold text-gray-700 dark:text-zinc-300">
                  Estado
                </Label>
                <Select
                  value={data.socioBaja || ""}
                  onValueChange={(val) => handleSelectChange("socioBaja", val)}
                >
                  <SelectTrigger
                    className={
                      data.socioBaja.includes("Activo")
                        ? "bg-green-100 border-green-300 text-green-800 dark:bg-green-950/60 dark:border-green-800/60 dark:text-green-300 font-bold w-full"
                        : data.socioBaja.includes("baja")
                          ? "bg-red-100 border-red-300 text-red-800 dark:bg-red-950/60 dark:border-red-800/60 dark:text-red-300 font-bold w-full"
                          : "bg-white border-gray-300 text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] font-bold dark:text-white w-full dark:shadow-inner"
                    }
                  >
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-white/10 dark:text-white">
                    <SelectGroup>
                      <SelectItem
                        value={"Activo"}
                        className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Activo
                      </SelectItem>
                      <SelectItem
                        value={"Dado de baja"}
                        className="hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        Dado de baja
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalModificarDatos(false);
                    setNuevaFotoSocio(null); // <-- NUEVO: Limpiamos al cancelar
                  }}
                  className="border-gray-300 text-white hover:bg-gray-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoSocio}
                  className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white dark:text-black font-bold bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350]"
                >
                  {guardandoSocio ? "Modificando..." : "Modificar Socio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORTAR CSV */}
      {modalImportar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-card/50 p-4 w-full h-full backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative border border-gray-200 dark:bg-zinc-900 dark:border-white/10">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-zinc-800"
              onClick={() => {
                setModalImportar(false);
                setFileCsv(null);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4 border-b border-[#C4A77D] pb-2 text-gray-900 dark:text-white">
              Importar Socios (CSV)
            </h2>
            <form onSubmit={handleImportarCSV} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4">
                El archivo debe estar separado por punto y coma (;) con el
                formato: <br />
                <code className="bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded text-[#C4A77D] font-medium border border-gray-200 dark:border-white/10">
                  Nombre;DNI;true/false
                </code>
              </p>
              <div className="space-y-2">
                <Label className="text-gray-700 dark:text-zinc-300">
                  Archivo CSV
                </Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFileCsv(e.target.files?.[0] || null)}
                  required
                  className="bg-white border-gray-300 text-gray-900 focus-visible:ring-[#C4A77D] cursor-pointer dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white dark:shadow-inner"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setModalImportar(false);
                    setFileCsv(null);
                  }}
                  className="border-gray-300 text-white hover:bg-gray-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={importando || !fileCsv}
                  className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-700 dark:hover:bg-green-600 font-bold"
                >
                  {importando ? "Procesando..." : "Subir e Importar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between bg-transparent items-start sm:items-center border-b-2 border-gold pb-3 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Registrar ingreso al camping
        </h2>
        <Button
          type="button"
          onClick={() => setScannerActivo(!scannerActivo)}
          className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:text-black font-bold flex items-center gap-2 bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40 shadow-lg"
        >
          <Camera className="w-4 h-4" />
          {scannerActivo ? "Cerrar Escáner" : "Escanear DNI"}
        </Button>
      </div>

      {/* VENTANA DEL ESCÁNER DE CÁMARA */}
      {scannerActivo && (
        <div className="bg-gray-50 border border-gray-300 dark:bg-zinc-900/80 dark:backdrop-blur-xl dark:border-white/10 p-4 rounded-lg relative transition-colors duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-[#C4A77D]">
              Apunte la cámara al código de barras o QR
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScannerActivo(false)}
              className="text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-zinc-800"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
          <div id="reader" className="w-full max-w-md mx-auto"></div>
        </div>
      )}

      {/* BUSCADOR DE SOCIOS Y BOTÓN NUEVO/IMPORTAR */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row justify-between items-start sm:items-end gap-2 pb-1">
          <Label className="text-sm text-gray-700 dark:text-zinc-300">
            Elegir Socio
          </Label>
          {(usuario.includes("admin") || usuario.includes("supervisor")) && (
            <div className="flex flex-col md:flex-row gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalImportar(true)}
                className="flex items-center gap-2 h-8 bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-300 dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-zinc-800 dark:text-white w-full sm:w-auto transition-colors"
              >
                <Upload className="w-3 h-3" />
                Cargar CSV
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalNuevoSocio(true)}
                className="flex items-center gap-2 h-8 bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:text-black font-bold border-none w-full sm:w-auto bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
              >
                <UserPlus className="w-3 h-3" />
                Nuevo Socio
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalModificarDatos(true)}
                className="flex items-center gap-2 h-8 bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-300 dark:bg-zinc-900 dark:border-white/10 dark:hover:bg-zinc-800 dark:text-white w-full sm:w-auto transition-colors "
              >
                <UserCog className="w-3 h-3" />
                Modificar datos
              </Button>
            </div>
          )}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-dark dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white transition-colors dark:shadow-inner"
            >
              {data.socioDni
                ? `${data.socioNombreApellido} (DNI: ${data.socioDni})`
                : "Buscar socio por nombre o DNI..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 bg-white border-gray-200 text-gray-900 dark:bg-zinc-900 dark:border-white/10 dark:text-white shadow-xl">
            <Command shouldFilter={false} className="bg-transparent">
              <CommandInput
                placeholder="Escriba nombre o DNI..."
                value={busqueda}
                onValueChange={setBusqueda}
                className="text-gray-900 dark:text-white "
              />
              <CommandList>
                {socios.length === 0 && (
                  <CommandEmpty className="text-gray-500 dark:text-zinc-400 py-4 text-center">
                    Cargando socios...
                  </CommandEmpty>
                )}
                {socios.length > 0 && sociosFiltrados.length === 0 && (
                  <CommandEmpty className="text-gray-500 dark:text-zinc-400 py-4 text-center">
                    No se encontró el socio.
                  </CommandEmpty>
                )}
                <CommandGroup>
                  {sociosFiltrados.map((s) => (
                    <CommandItem
                      key={s.id}
                      value={s.nombre_completo}
                      onSelect={() => {
                        handleSeleccionarSocio(String(s.dni));
                        setOpen(false);
                      }}
                      className="text-gray-900  cursor-pointer dark:text-white dark:hover:bg-zinc-800"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-[#C4A77D]",
                          data.socioDni === String(s.dni)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {s.nombre_completo} (DNI: {s.dni})
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
        {/* CONTENEDOR DE LA FOTO */}
        <div className="w-50 h-50   shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-950/50 border-2 border-[#C4A77D] flex items-center justify-center shadow-inner">
          {data.socioFotoUrl ? (
            <img
              src={data.socioFotoUrl}
              alt="Foto del socio"
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-gray-400 dark:text-zinc-600" />
          )}
        </div>

        {/* INPUTS DE LOS DATOS */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Nombre Completo
            </Label>
            <Input
              name="socioNombreApellido"
              value={data.socioNombreApellido || ""}
              disabled
              className="disabled:bg-white disabled:opacity-70 bg-gray-100 border-gray-300 text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Documento N°
            </Label>
            <Input
              name="socioDni"
              value={data.socioDni || ""}
              disabled
              className="disabled:bg-white disabled:opacity-70 bg-gray-100 border-gray-300 text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold text-gray-700 dark:text-zinc-300">
              Estado
            </Label>
            <Input
              name="socioBaja"
              value={data.socioBaja || ""}
              disabled
              className={
                data.socioBaja.includes("Activo")
                  ? "disabled:bg-green-100 disabled:opacity-70 bg-green-100 border-green-300 text-green-800 dark:bg-green-950/60 dark:border-green-800/60 dark:text-green-300 font-bold"
                  : data.socioBaja.includes("baja")
                    ? "disabled:bg-red-100 disabled:opacity-70 bg-red-100 border-red-300 text-red-800 dark:bg-red-950/60 dark:border-red-800/60 dark:text-red-300 font-bold"
                    : "disabled:bg-white disabled:opacity-70 bg-gray-100 border-gray-300 text-gray-900 dark:bg-zinc-950/50 dark:border-[#C4A77D] font-bold dark:text-white"
              }
            />
          </div>
          <Button
            disabled={loading || data.socioBaja.includes("Dado de baja")}
            size="lg"
            onClick={handleRegistrarIngreso}
            className="bg-[#C4A77D] hover:bg-[#C4A77D]/90 text-white hover:text-black transition-all duration-300 dark:text-black font-bold border-none w-full sm:w-auto bg-gradient-to-br from-[#E2C792] via-[#C4A77D] to-[#8A7350] dark:border dark:border-[#E2C792]/40"
          >
            {loading ? "Registrando ingreso..." : "Marcar ingreso"}
          </Button>
        </div>
      </div>
    </div>
  );
}

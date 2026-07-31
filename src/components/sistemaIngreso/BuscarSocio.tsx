"use client";
import { useState, useEffect, useDeferredValue } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Camera, X, UserPlus } from "lucide-react";
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from "html5-qrcode";
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
}

interface UsuarioProps {
  id: string;
  rol: string;
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
  const [nuevoSocio, setNuevoSocio] = useState({
    dni: "",
    nombre_completo: "",
  });

  const [data, setData] = useState({
    socioId: "",
    socioNombreApellido: "",
    socioDni: "",
    socioBaja: "",
    cantidadInvitados: "0",
    vehiculosInvitados: "0",
    observaciones: "",
    formaPago: "efectivo",
  });

  const [ingresantes, setIngresantes] = useState<string[]>([]);

  // Validación de permisos
  if (
    !usuario ||
    (!usuario.includes("admin") && !usuario.includes("ingreso"))
  ) {
    return (
      <div className="p-8 bg-red-100 text-red-800 border border-red-300 rounded-lg">
        <h2 className="font-bold text-xl">Acceso Denegado</h2>
        <p>No tienes los permisos necesarios para esta sección.</p>
      </div>
    );
  }

  // Cargar socios desde Supabase
  useEffect(() => {
    async function fetchSocios() {
      const { data: sociosData, error } = await supabase
        .from("socios")
        .select("id, dni, nombre_completo, estado");

      if (error) {
        console.error("Error al cargar socios:", error);
      } else if (sociosData) {
        setSocios(sociosData);
      }
    }
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
          console.log(decodedText.trim());
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
          } catch (error) {
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

  // Función para registrar nuevo socio en DB
  const handleCrearSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoSocio.dni || !nuevoSocio.nombre_completo) {
      return alert("Debe completar nombre y DNI del socio.");
    }

    setGuardandoSocio(true);
    try {
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

      // Actualizar estado local
      setSocios((prev) => [...prev, socioCreado]);

      alert("Socio registrado correctamente.");
      setModalNuevoSocio(false);
      setNuevoSocio({ dni: "", nombre_completo: "" });

      // Auto-seleccionar el socio creado
      handleSeleccionarSocio(String(socioCreado.dni));
    } catch (error) {
      console.error("Error al crear socio:", error);
      alert("Hubo un error al registrar el socio.");
    } finally {
      setGuardandoSocio(false);
    }
  };

  const handleRegistrarIngreso = async () => {
    if (!data.socioDni) {
      return alert("Debe seleccionar un socio antes de registrar el ingreso.");
    }

    setLoading(true);
    try {
      // Aquí puedes agregar la lógica para guardar el ingreso en tu tabla de Supabase
      alert("¡Ingreso registrado correctamente!");
      setData({
        socioNombreApellido: "",
        socioDni: "",
        socioBaja: "",
        cantidadInvitados: "0",
        vehiculosInvitados: "0",
        observaciones: "",
        formaPago: "efectivo",
        socioId: "",
      });
      setIngresantes([]);
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("No se pudo registrar el ingreso.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarSocio = async (e: React.FormEvent) => {
    e.preventDefault();
    const estadoSocio = data.socioBaja.includes("Activo") ? true : false;
    try {
      const { data: socioEditado, error } = await supabase
        .from("socios")
        .update([
          {
            dni: data.socioDni,
            nombre_completo: data.socioNombreApellido.toUpperCase(),
            estado: estadoSocio, // Activo por defecto
          },
        ])
        .eq("id", data.socioId);

      if (error) throw error;

      alert("Socio editado correctamente.");
    } catch (error) {
      console.error("Error al modificar socio:", error);
      alert("Hubo un error al registrar el socio.");
    } finally {
      setGuardandoSocio(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 p-4 sm:p-8 bg-white text-black border border-gray-200 rounded-xl shadow-lg relative">
      {/* MODAL NUEVO SOCIO */}
      {modalNuevoSocio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={() => setModalNuevoSocio(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold mb-4 border-b pb-2">
              Registrar Nuevo Socio
            </h2>
            <form onSubmit={handleCrearSocio} className="space-y-4">
              <div className="space-y-2">
                <Label>DNI</Label>
                <Input
                  type="number"
                  placeholder="Ej: 35123456"
                  value={nuevoSocio.dni}
                  onChange={(e) =>
                    setNuevoSocio({ ...nuevoSocio, dni: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
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
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalNuevoSocio(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={guardandoSocio}
                  className="bg-[#3FA7AC] hover:bg-[#358f94] text-white"
                >
                  {guardandoSocio ? "Guardando..." : "Guardar Socio"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-black pb-3 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold">
          Registrar ingreso al camping
        </h2>
        <Button
          type="button"
          onClick={() => setScannerActivo(!scannerActivo)}
          className="bg-[#3FA7AC] hover:bg-[#358f94] text-white flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          {scannerActivo ? "Cerrar Escáner" : "Escanear Carnet / Código"}
        </Button>
      </div>

      {/* VENTANA DEL ESCÁNER DE CÁMARA */}
      {scannerActivo && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-300 relative">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-[#3FA7AC]">
              Apunte la cámara al código de barras o QR
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScannerActivo(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div id="reader" className="w-full max-w-md mx-auto"></div>
        </div>
      )}

      {/* BUSCADOR DE SOCIOS Y BOTÓN NUEVO SOCIO */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <Label className="text-sm pb-1">Elegir Socio</Label>
          {usuario.includes("admin") && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setModalNuevoSocio(true)}
              className="flex items-center gap-2 h-8 text-[#3FA7AC] border-[#3FA7AC] hover:bg-[#3FA7AC] hover:text-white"
            >
              <UserPlus className="w-3 h-3" />
              Nuevo Socio
            </Button>
          )}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between bg-white border-[#3FA7AC]"
            >
              {data.socioDni
                ? `${data.socioNombreApellido} (DNI: ${data.socioDni})`
                : "Buscar socio por nombre o DNI..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Escriba nombre o DNI..."
                value={busqueda}
                onValueChange={setBusqueda}
              />
              <CommandList>
                {socios.length === 0 && (
                  <CommandEmpty>Cargando socios...</CommandEmpty>
                )}
                {socios.length > 0 && sociosFiltrados.length === 0 && (
                  <CommandEmpty>No se encontró el socio.</CommandEmpty>
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
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
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

      {/* DATOS DEL SOCIO SELECCIONADO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
          <h3 className="font-bold text-[#3FA7AC] uppercase tracking-wide">
            Datos del Socio
          </h3>
          <div className="space-y-2">
            <Label className="font-semibold">Nombre Completo</Label>
            <Input
              name="socioNombreApellido"
              value={data.socioNombreApellido || ""}
              disabled
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Documento N°</Label>
            <Input
              name="socioDni"
              value={data.socioDni || ""}
              disabled
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-semibold">Estado</Label>
            <Input
              name="socioBaja"
              value={data.socioBaja || ""}
              disabled
              className={
                data.socioBaja.includes("Activo")
                  ? "!bg-green-100 text-green-800 font-bold"
                  : data.socioBaja.includes("baja")
                    ? "!bg-red-100 text-red-800 font-bold"
                    : "font-bold"
              }
            />
          </div>
        </div>
      </div>
      {usuario.includes("admin") && (
        <>
          <h2 className="text-xl sm:text-2xl font-bold border-b-2 border-black pb-3">
            Modificar datos socio seleccionado
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-lg border border-gray-200">
              <h3 className="font-bold text-[#3FA7AC] uppercase tracking-wide">
                Datos del Socio
              </h3>
              <div className="space-y-2">
                <Label className="font-semibold">Nombre Completo</Label>
                <Input
                  name="socioNombreApellido"
                  value={data.socioNombreApellido || ""}
                  className="bg-white"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Documento N°</Label>
                <Input
                  name="socioDni"
                  value={data.socioDni || ""}
                  className="bg-white"
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">Estado</Label>

                <Select
                  value={data.socioBaja || ""}
                  onValueChange={(val) => handleSelectChange("socioBaja", val)}
                >
                  <SelectTrigger
                    className={
                      data.socioBaja.includes("Activo")
                        ? "!bg-green-100 text-green-800 font-bold w-full"
                        : data.socioBaja.includes("baja")
                          ? "!bg-red-100 text-red-800 font-bold w-full"
                          : "font-bold"
                    }
                  >
                    <SelectValue placeholder="Seleccione estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={"Activo"}>Activo</SelectItem>
                      <SelectItem value={"Dado de baja"}>
                        Dado de baja
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              disabled={loading}
              size="lg"
              onClick={handleEditarSocio}
              className="bg-[#3FA7AC] hover:bg-gray-500 text-white font-bold px-8 py-6 text-lg shadow-lg w-full sm:w-auto"
            >
              {loading ? "Registrando precios..." : "Editar precios"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

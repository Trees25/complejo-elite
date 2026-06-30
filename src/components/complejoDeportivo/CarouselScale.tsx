"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const images = [
  { image: "/cancha1.jpeg", alt: "cancha1" },
  { image: "/cancha2.jpeg", alt: "cancha2" },
  { image: "/cancha3.jpeg", alt: "cancha3" },
  { image: "/cancha4.jpeg", alt: "cancha4" },
  { image: "/cancha5.jpeg", alt: "cancha5" },
  { image: "/cancha6.jpeg", alt: "cancha6" },
];

const CarouselScale = () => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [fullScreenImg, setFullScreenImg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <>
      {/* Contenedor ampliado para pantallas grandes */}
      <div className="mx-auto w-full max-w-sm md:max-w-3xl lg:max-w-5xl">
        <Carousel
          opts={{ loop: true, align: "center" }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="items-center">
            {images.map((image, index) => (
              <CarouselItem
                // basis responsivo: ocupa menos porcentaje del ancho total en pantallas grandes
                className="basis-[70%] md:basis-[50%] lg:basis-[40%] pl-4"
                key={index}
              >
                <div
                  className="relative aspect-[9/16] sm:aspect-[3/4] w-full overflow-hidden rounded-2xl cursor-pointer"
                  onClick={() => {
                    // Solo permite abrir la imagen si es la imagen central (opcional)
                    if (index === current) setFullScreenImg(image.image);
                  }}
                >
                  <img
                    alt={image.alt}
                    src={image.image}
                    className={cn(
                      "h-full w-full object-cover transition-all duration-700 ease-[0.22,1,0.36,1]",
                      index !== current
                        ? "scale-[0.85] opacity-50 blur-[2px]"
                        : "scale-100 opacity-100 blur-0 hover:scale-105",
                    )}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious className="left-2 md:-left-12" />
          <CarouselNext className="right-2 md:-right-12" />
        </Carousel>
      </div>

      {/* Modal Lightbox de Pantalla Completa */}
      {fullScreenImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-md p-4 transition-opacity"
          onClick={() => setFullScreenImg(null)}
        >
          <button
            className="absolute top-6 right-6 z-50 p-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setFullScreenImg(null)}
          >
            <X size={32} />
          </button>

          <img
            src={fullScreenImg}
            alt="Pantalla completa"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Previene que el click en la imagen cierre el modal
          />
        </div>
      )}
    </>
  );
};

export default CarouselScale;

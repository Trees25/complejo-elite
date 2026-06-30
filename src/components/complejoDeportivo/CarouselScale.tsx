"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Tus imágenes verticales

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

  React.useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  return (
    <div className="mx-auto w-full max-w-sm">
      <Carousel
        opts={{ loop: true, align: "center" }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="items-center">
          {images.map((image, index) => (
            // basis-[70%] hace que se vea parte de la anterior y la siguiente
            <CarouselItem className="basis-[70%] pl-4" key={index}>
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl">
                <img
                  alt={image.alt}
                  src={image.image}
                  className={cn(
                    "h-full w-full object-cover transition-all duration-700 ease-[0.22,1,0.36,1]",
                    // Efecto insano: La que no está seleccionada se achica y se oscurece
                    index !== current
                      ? "scale-[0.85] opacity-50 blur-[2px]"
                      : "scale-100 opacity-100 blur-0",
                  )}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Controles posicionados */}
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );
};

export default CarouselScale;

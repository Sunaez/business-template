"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Expand } from "lucide-react";
import type { ProductImage } from "@/types";
import { Drawer } from "@/components/ui/Drawer";

export function ProductGallery({
  images,
  selectedImage,
  productName,
}: {
  images: ProductImage[];
  selectedImage?: ProductImage;
  productName: string;
}) {
  const gallery = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const allImages =
    selectedImage && !images.some((image) => image.src === selectedImage.src)
      ? [selectedImage, ...images]
      : images;
  const goTo = (index: number) => {
    setActive(index);
    const element = gallery.current;
    if (element)
      element.scrollTo({
        left: element.clientWidth * index,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  };

  useEffect(() => {
    if (!selectedImage) return;
    const index = images.findIndex((image) => image.src === selectedImage.src);
    const next = Math.max(index, 0);
    gallery.current?.scrollTo({
      left: gallery.current.clientWidth * next,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [selectedImage, images]);

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <div
          ref={gallery}
          className="product-gallery__track"
          role="region"
          tabIndex={0}
          aria-roledescription="carousel"
          aria-label={`${productName} image gallery`}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(
                (active +
                  (event.key === "ArrowRight" ? 1 : -1) +
                  allImages.length) %
                  allImages.length,
              );
            }
          }}
          onScroll={(event) => {
            const node = event.currentTarget;
            if (node.clientWidth)
              setActive(Math.round(node.scrollLeft / node.clientWidth));
          }}
        >
          {allImages.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              className="product-gallery__slide"
              role="group"
              aria-label={`Image ${index + 1} of ${allImages.length}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
                sizes="(max-width: 760px) 100vw, 55vw"
              />
            </div>
          ))}
        </div>
        <span className="product-gallery__counter">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(allImages.length).padStart(2, "0")}
        </span>
        <button
          className="product-gallery__zoom commerce-icon-button"
          type="button"
          onClick={() => setZoomed(true)}
          aria-label="Enlarge product image"
        >
          <Expand size={19} />
        </button>
        {allImages.length > 1 && (
          <div className="product-gallery__arrows">
            <button
              type="button"
              className="commerce-icon-button"
              onClick={() =>
                goTo((active - 1 + allImages.length) % allImages.length)
              }
              aria-label="Previous product image"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              className="commerce-icon-button"
              onClick={() => goTo((active + 1) % allImages.length)}
              aria-label="Next product image"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
      <div
        className="product-gallery__thumbnails"
        aria-label="Choose product image"
      >
        {allImages.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            className={active === index ? "is-active" : ""}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`View image ${index + 1}`}
            aria-pressed={active === index}
          >
            <Image src={item.src} alt="" fill sizes="80px" />
          </button>
        ))}
      </div>
      {zoomed && (
        <Drawer
          open
          onClose={() => setZoomed(false)}
          title={productName}
          className="image-zoom-drawer"
        >
          <div className="product-gallery__enlarged">
            {allImages[active] && (
              <Image
                src={allImages[active].src}
                alt={allImages[active].alt}
                fill
                sizes="90vw"
              />
            )}
          </div>
        </Drawer>
      )}
    </div>
  );
}

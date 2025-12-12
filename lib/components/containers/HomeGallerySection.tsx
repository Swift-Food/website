"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import PolaroidGallery from "./PolaroidGallery";

const galleryImages = [
  "/home_gallery/asian_delights_AgentVerse Hackathon.JPG",
  "/home_gallery/banh_mi_bay.png",
  "/home_gallery/hiba_Great Agent Hack.jpg",
  "/home_gallery/hiba_maybe.jpg",
  "/home_gallery/hiba_rl agian.JPG",
  "/home_gallery/hiba_RL Hackathon again.JPG",
  "/home_gallery/hiba_RL Hackathon.JPG",
  "/home_gallery/hiba_rl once more.JPG",
  "/home_gallery/icco_agentverse.JPG",
  "/home_gallery/icco_alsoagentverse.JPG",
  "/home_gallery/oakberry.jpg",
  "/home_gallery/oakberry2.jpg",
  "/home_gallery/oakberry3.jpg",
  "/home_gallery/oakberry4.jpg",
  "/home_gallery/sandwich_Rl as well.PNG",
];

// Polaroid items with placeholder captions
const placeholderCaptions = [
  "Fresh & Delicious",
  "Made with Love",
  "Farm to Table",
  "Local Ingredients",
  "Chef's Special",
  "Daily Fresh",
  "Artisan Quality",
  "Seasonal Picks",
  "Handcrafted",
  "Premium Selection",
  "Organic Goodness",
  "Signature Dish",
  "House Favorite",
  "Today's Special",
  "Market Fresh",
];

const polaroidItems = galleryImages.map((src, index) => ({
  src,
  caption: placeholderCaptions[index % placeholderCaptions.length],
}));

export default function HomeGallerySection() {
  // Polaroid Gallery
  return (
    <PolaroidGallery
      items={polaroidItems}
      title="FRESH FROM THE MARKET"
    />
  );

  /* MARQUEE GALLERY - Commented out
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Duplicate images for infinite scroll effect
  const allImages = [...galleryImages, ...galleryImages, ...galleryImages];

  // Auto-scroll carousel - pause when dragging
  useEffect(() => {
    if (isDragging) return;

    const interval = setInterval(() => {
      setOffset((prev) => {
        const newOffset = prev - 1;
        const imageWidth = 320; // approximate width + gap
        const resetPoint = -(galleryImages.length * imageWidth);
        if (newOffset <= resetPoint) {
          return 0;
        }
        return newOffset;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
    setScrollLeft(offset);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 2;
    setOffset(scrollLeft + walk);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(offset);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2;
    setOffset(scrollLeft + walk);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section className="w-full bg-base-100 py-8 overflow-hidden">
      <h2
        className="text-center text-primary text-3xl sm:text-4xl font-bold tracking-wide mb-8 px-4"
        style={{ fontFamily: "IBM Plex Mono, monospace" }}
      >
        EVENTS WE&apos;VE SERVED
      </h2>
      <div className="relative h-64 sm:h-80 md:h-96">
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-r from-base-100 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-24 bg-gradient-to-l from-base-100 to-transparent z-10 pointer-events-none" />

        <div
          ref={carouselRef}
          className="flex gap-4 h-full cursor-grab active:cursor-grabbing select-none"
          style={{
            transform: `translateX(${offset}px)`,
            willChange: "transform",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {allImages.map((src, index) => (
            <div
              key={index}
              className="relative flex-shrink-0 h-full rounded-2xl overflow-hidden"
            >
              <Image
                src={src}
                alt={`Gallery image ${(index % galleryImages.length) + 1}`}
                width={300}
                height={384}
                className="h-full w-auto object-cover pointer-events-none"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
  END MARQUEE GALLERY */
}

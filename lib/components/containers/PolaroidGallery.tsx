"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

interface PolaroidItem {
  src: string;
  caption: string;
}

interface PolaroidGalleryProps {
  items: PolaroidItem[];
  title?: string;
  displayCount?: number;
  rotateInterval?: number; // in milliseconds
}

export default function PolaroidGallery({
  items,
  title,
  displayCount = 8,
  rotateInterval = 5000
}: PolaroidGalleryProps) {
  const [startIndex, setStartIndex] = useState(0);

  // Rotate images at interval
  useEffect(() => {
    if (items.length <= displayCount) return;

    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + displayCount) % items.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [items.length, displayCount, rotateInterval]);

  // Get current set of images to display
  const visibleItems = [];
  for (let i = 0; i < displayCount; i++) {
    const index = (startIndex + i) % items.length;
    visibleItems.push(items[index]);
  }

  // Predefined rotations for variety
  const rotations = [-3, 2, -2, 3, -1, 1, -2, 2];

  return (
    <section className="w-full bg-pink-100 py-12 px-4">
      {title && (
        <h2
          className="text-center text-pink-500 text-3xl sm:text-4xl font-bold tracking-[0.3em] mb-12"
          style={{ fontFamily: "IBM Plex Mono, monospace" }}
        >
          {title}
        </h2>
      )}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {visibleItems.map((item, index) => (
            <div
              key={index}
              className="bg-white p-3 pb-12 shadow-lg transform transition-transform hover:scale-105 hover:z-10"
              style={{
                transform: `rotate(${rotations[index % rotations.length]}deg)`,
              }}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <Image
                  src={item.src}
                  alt={item.caption}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="mt-3 text-center text-gray-700 text-sm font-medium">
                {item.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

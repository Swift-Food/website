"use client";

import Image from "next/image";
import { useState } from "react";

interface EventPhotosDisplayProps {
  images: string[];
}

export default function EventPhotosDisplay({ images }: EventPhotosDisplayProps) {
  const [isPaused, setIsPaused] = useState(false);

  if (!images || images.length === 0) return null;

  const rotations = [-3, 2, -2, 3, -1, 1];

  // Triple the images for seamless infinite scroll
  const displayImages = [...images, ...images, ...images];

  return (
    <div
      className="w-full py-6 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div
        className="flex gap-4 w-max"
        style={{
          animation: `scroll ${images.length * 4}s linear infinite`,
          animationPlayState: isPaused ? "paused" : "running",
        }}
      >
        {displayImages.map((image, index) => {
          const rotation = rotations[index % rotations.length];
          return (
            <div
              key={index}
              className="flex-shrink-0 bg-white p-2 shadow-lg rounded-lg hover:scale-105 transition-transform duration-200"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <div className="relative w-32 h-32 md:w-40 md:h-40 overflow-hidden bg-gray-100 rounded">
                <Image
                  src={image}
                  alt={`Event photo ${(index % images.length) + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
      `}</style>
    </div>
  );
}

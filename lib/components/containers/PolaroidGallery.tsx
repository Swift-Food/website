"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

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
  rotateInterval = 5000,
}: PolaroidGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(displayCount);
  const [isFlipping, setIsFlipping] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const isAnimating = useRef(false);

  // Rotate images at interval with flip animation
  useEffect(() => {
    if (items.length <= displayCount) return;

    const interval = setInterval(() => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      // Set up the next set of images before flipping
      const next = (currentIndex + displayCount) % items.length;
      setNextIndex(next);

      // Start flip animation
      setIsFlipping(true);

      // After full flip completes, swap content and reset instantly
      setTimeout(() => {
        // Disable transition for instant reset
        setTransitionEnabled(false);
        setCurrentIndex(next);
        setIsFlipping(false);

        // Re-enable transition after a frame
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTransitionEnabled(true);
            isAnimating.current = false;
          });
        });
      }, 600);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [items.length, displayCount, rotateInterval, currentIndex]);

  // Get current and next sets of images
  const getCurrentItems = (startIdx: number) => {
    const result = [];
    for (let i = 0; i < displayCount; i++) {
      const index = (startIdx + i) % items.length;
      result.push(items[index]);
    }
    return result;
  };

  const currentItems = getCurrentItems(currentIndex);
  const nextItems = getCurrentItems(nextIndex);

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
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          style={{ perspective: "1200px" }}
        >
          {currentItems.map((item, index) => {
            const rotation = rotations[index % rotations.length];
            return (
              <div
                key={index}
                className="relative"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Card container for flip */}
                <div
                  className="relative w-full"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipping ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: transitionEnabled
                      ? "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)"
                      : "none",
                  }}
                >
                  {/* Front face - current image */}
                  <div
                    className="bg-white p-3 shadow-lg hover:scale-105 hover:z-10 transition-transform duration-200"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
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
                    <p className="mt-3 text-center text-gray-700 text-sm font-medium line-clamp-3 h-[3.75rem]">
                      {item.caption}
                    </p>
                  </div>

                  {/* Back face - next image */}
                  <div
                    className="absolute inset-0 bg-white p-3 shadow-lg"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-100">
                      <Image
                        src={nextItems[index].src}
                        alt={nextItems[index].caption}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="mt-3 text-center text-gray-700 text-sm font-medium line-clamp-3 h-[3.75rem]">
                      {nextItems[index].caption}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

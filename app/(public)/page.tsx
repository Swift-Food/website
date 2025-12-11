"use client";
import { useEffect, useState, useRef } from "react";
import HomeHeroSection from "@/lib/components/containers/HomeHeroSection";
import OurStorySection from "@/lib/components/containers/OurStorySection";

// WHO WE WORK WITH SECTION
// function WhoWeWorkWithSection() {
//   const [isVisible, setIsVisible] = useState(false);
//   const sectionRef = useRef<HTMLElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.2 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   return (
//     <section ref={sectionRef} className="w-full bg-base-100 py-8 sm:py-16 px-4">
//       <div className="max-w-6xl mx-auto">
//         <h2
//           className={`text-center text-hot-pink text-4xl sm:text-5xl font-bold tracking-widest mb-12 transition-all duration-1000 ease-out ${
//             isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
//           }`}
//           style={{
//             fontFamily: "IBM Plex Mono, monospace",
//             letterSpacing: "0.1em",
//           }}
//         >
//           WHO WE WORK WITH
//         </h2>
//         <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 justify-center items-center">
//           <div
//             className={`text-center transition-all duration-1000 ease-out delay-200 ${
//               isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
//             }`}
//           >
//             <p
//               className="text-primary text-xl sm:text-4xl font-bold mb-2"
//               style={{ fontFamily: "IBM Plex Mono, monospace" }}
//             >
//               <AnimatedCounter
//                 target={5}
//                 suffix="+ Restaurants"
//                 isVisible={isVisible}
//               />
//             </p>
//           </div>
//           <div
//             className={`text-center transition-all duration-1000 ease-out delay-400 ${
//               isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
//             }`}
//           >
//             <p
//               className="text-primary text-xl sm:text-4xl font-bold mb-2"
//               style={{ fontFamily: "IBM Plex Mono, monospace" }}
//             >
//               <AnimatedCounter
//                 target={15}
//                 suffix="+ Stalls"
//                 isVisible={isVisible}
//               />
//             </p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// WHAT WE'VE CREATED TOGETHER SECTION
// function WhatWeCreatedSection() {
//   const [isVisible, setIsVisible] = useState(false);
//   const [offset, setOffset] = useState(0);
//   const [isDragging, setIsDragging] = useState(false);
//   const [startX, setStartX] = useState(0);
//   const [scrollLeft, setScrollLeft] = useState(0);
//   const sectionRef = useRef<HTMLElement>(null);
//   const carouselRef = useRef<HTMLDivElement>(null);

//   const images = [
//     {
//       src: "/problem-solve.jpg",
//       alt: "Student event",
//       eventName: "Women in Finance",
//       eventType: "Panel Talk",
//     },
//     {
//       src: "/restaurant-delivery.jpg",
//       alt: "Student event",
//       eventName: "Data Science",
//       eventType: "Gala",
//     },
//     {
//       src: "/problem-solve.jpg",
//       alt: "Student event",
//       eventName: "Women in Finance",
//       eventType: "Gala",
//     },
//     {
//       src: "/restaurant-delivery.jpg",
//       alt: "Student event",
//       eventName: "Women in Finance",
//       eventType: "Gala",
//     },
//   ];

//   // Duplicate images for infinite scroll effect
//   const allImages = [...images, ...images, ...images];

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.2 }
//     );

//     if (sectionRef.current) {
//       observer.observe(sectionRef.current);
//     }

//     return () => {
//       if (sectionRef.current) {
//         observer.unobserve(sectionRef.current);
//       }
//     };
//   }, []);

//   // Auto-scroll carousel smoothly - pause when dragging
//   useEffect(() => {
//     if (isDragging) return;

//     const interval = setInterval(() => {
//       setOffset((prev) => {
//         const newOffset = prev - 1;
//         // Reset when we've scrolled through one full set of images
//         const imageWidth = 400; // approximate width + gap
//         const resetPoint = -(images.length * imageWidth);
//         if (newOffset <= resetPoint) {
//           return 0;
//         }
//         return newOffset;
//       });
//     }, 30); // Smooth animation, 30ms per frame

//     return () => clearInterval(interval);
//   }, [images.length, isDragging]);

//   // Mouse drag handlers
//   const handleMouseDown = (e: React.MouseEvent) => {
//     setIsDragging(true);
//     setStartX(e.pageX);
//     setScrollLeft(offset);
//   };

//   const handleMouseMove = (e: React.MouseEvent) => {
//     if (!isDragging) return;
//     e.preventDefault();
//     const x = e.pageX;
//     const walk = (x - startX) * 2; // Multiply for faster scroll
//     setOffset(scrollLeft + walk);
//   };

//   const handleMouseUp = () => {
//     setIsDragging(false);
//   };

//   const handleMouseLeave = () => {
//     setIsDragging(false);
//   };

//   // Touch handlers for mobile
//   const handleTouchStart = (e: React.TouchEvent) => {
//     setIsDragging(true);
//     setStartX(e.touches[0].pageX);
//     setScrollLeft(offset);
//   };

//   const handleTouchMove = (e: React.TouchEvent) => {
//     if (!isDragging) return;
//     const x = e.touches[0].pageX;
//     const walk = (x - startX) * 2;
//     setOffset(scrollLeft + walk);
//   };

//   const handleTouchEnd = () => {
//     setIsDragging(false);
//   };

//   return (
//     <section ref={sectionRef} className="w-full bg-base-100 py-8 sm:py-16 px-4">
//       <div className=" mx-auto">
//         <h2
//           className={`text-center text-hot-pink text-4xl sm:text-5xl font-bold tracking-widest mb-12 transition-all duration-1000 ease-out ${
//             isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
//           }`}
//           style={{
//             fontFamily: "IBM Plex Mono, monospace",
//             letterSpacing: "0.1em",
//           }}
//         >
//           WHAT WE&apos;VE CREATED TOGETHER
//         </h2>
//         <div className="flex flex-col sm:flex-row gap-8 sm:gap-12 justify-center items-center mb-12">
//           <div
//             className={`text-center transition-all duration-1000 ease-out delay-200 ${
//               isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
//             }`}
//           >
//             <h3
//               className="text-primary text-xl sm:text-4xl font-bold"
//               style={{ fontFamily: "IBM Plex Mono, monospace" }}
//             >
//               <AnimatedCounter
//                 target={150}
//                 suffix="+ Societies"
//                 isVisible={isVisible}
//                 duration={2500}
//               />
//             </h3>
//           </div>
//           <div
//             className={`text-center transition-all duration-1000 ease-out delay-300 ${
//               isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
//             }`}
//           >
//             <h3
//               className="text-primary text-xl sm:text-4xl font-bold"
//               style={{ fontFamily: "IBM Plex Mono, monospace" }}
//             >
//               <AnimatedCounter
//                 target={5}
//                 suffix="+ Universities"
//                 isVisible={isVisible}
//                 duration={2500}
//               />
//             </h3>
//           </div>
//           <div
//             className={`text-center transition-all duration-1000 ease-out delay-400 ${
//               isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
//             }`}
//           >
//             <h3
//               className="text-primary text-xl sm:text-4xl font-bold"
//               style={{ fontFamily: "IBM Plex Mono, monospace" }}
//             >
//               <AnimatedCounter
//                 target={80}
//                 suffix="+ Events"
//                 isVisible={isVisible}
//                 duration={2500}
//               />
//             </h3>
//           </div>
//         </div>

//         {/* Image Carousel - Horizontal Scrolling */}
//         <div
//           className={`relative w-full transition-all duration-1000 ease-out delay-600 ${
//             isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
//           }`}
//         >
//           {/* Carousel Container with blur edges */}
//           <div className="relative h-64 sm:h-80 md:h-96 overflow-hidden">
//             {/* Blur edges */}
//             <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-base-100 to-transparent z-10 pointer-events-none" />
//             <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-base-100 to-transparent z-10 pointer-events-none" />

//             {/* Scrolling Images */}
//             <div
//               ref={carouselRef}
//               className="flex gap-4 h-full cursor-grab active:cursor-grabbing select-none"
//               style={{
//                 transform: `translateX(${offset}px)`,
//                 willChange: "transform",
//               }}
//               onMouseDown={handleMouseDown}
//               onMouseMove={handleMouseMove}
//               onMouseUp={handleMouseUp}
//               onMouseLeave={handleMouseLeave}
//               onTouchStart={handleTouchStart}
//               onTouchMove={handleTouchMove}
//               onTouchEnd={handleTouchEnd}
//             >
//               {allImages.map((image, index) => (
//                 <div
//                   key={index}
//                   className="relative flex-shrink-0 h-full rounded-2xl overflow-hidden group"
//                 >
//                   <Image
//                     src={image.src}
//                     alt={image.alt}
//                     width={384}
//                     height={384}
//                     className="h-full w-auto object-cover pointer-events-none transition-transform duration-500 ease-out md:group-hover:scale-110"
//                     draggable={false}
//                   />

//                   {/* Event Type - Top Right */}
//                   <div className="absolute top-3 right-3 bg-hot-pink px-3 py-1.5 rounded-full md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
//                     <span className="text-black text-2xl font-bold">
//                       {image.eventType}
//                     </span>
//                   </div>

//                   {/* Event Name - Bottom Left */}
//                   <div className="absolute bottom-3 left-3 backdrop-blur-sm px-4 py-2 rounded-lg md:opacity-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out delay-75">
//                     <span className="text-white text-2xl font-bold">
//                       {image.eventName}
//                     </span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

export default function Home() {
  const [isDifferentVisible, setIsDifferentVisible] = useState(false);
  const differentSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDifferentVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (differentSectionRef.current) {
      observer.observe(differentSectionRef.current);
    }

    return () => {
      if (differentSectionRef.current) {
        observer.unobserve(differentSectionRef.current);
      }
    };
  }, []);

  return (
    <div>
      <HomeHeroSection />
      <div className="bg-primary h-10 w-full" />
      {/* <WhoWeWorkWithSection />
      <WhatWeCreatedSection />
      <div className="bg-secondary h-10 w-full" /> */}
      <OurStorySection />
      <section
        ref={differentSectionRef}
        className="w-full bg-base-100 py-10 px-4"
      >
        <div>
          <h2
            className={`text-center text-primary text-4xl font-bold tracking-wide mb-10 transition-all duration-1000 ease-out ${
              isDifferentVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-8"
            }`}
            style={{ fontFamily: "IBM Plex Mono, monospace" }}
          >
            WHAT MAKES US DIFFERENT?
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center md:items-stretch">
            <div
              className={`w-full md:w-80 bg-secondary rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-200 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                MUTIPLE STORES,
                <br />
                ONE DELIVERY
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                EVERYTHING YOU
                <br />
                CRAVE, DELIVERED TOGETHER
                <br />
                IN ONE GO.
              </p>
            </div>
            <div
              className={`w-full md:w-80 bg-accent rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-400 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                £5 FLAT DELIVERY RATE
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                ALL EVENT ORDERS HAVE A
                <br />
                £5 DELIVERY FEE.
                <br />
                NO HIDDEN COSTS.
              </p>
            </div>
            <div
              className={`w-full md:w-80 bg-beige rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-1000 ease-out delay-600 ${
                isDifferentVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <h3
                className="text-primary font-extrabold text-2xl text-center mb-4"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                SUPPORT LOCAL
                <br />
                FOOD MARKETS
              </h3>
              <p
                className="text-primary text-center font-mono font-bold"
                style={{ fontFamily: "IBM Plex Mono, monospace" }}
              >
                HELP STREET FOOD VENDORS
                <br />
                AND LOCAL RESTAURANTS
                <br />
                THRIVE IN EVERY ORDER.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

import Image from "next/image";

interface MarketCard {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  openingTime: string;
  stallCount?: string;
  cuisineTypes?: string[]; // Array of cuisine types like ["Chinese", "Thai", "Italian"]
  width?: string; // Custom width class like "w-96" or "w-80"
  height?: string; // Custom height class like "h-[600px]" or "h-96"
  bubbleSize?: string; // Custom bubble size like "w-20 h-20" or "w-16 h-16"
  bubbleLayout?: "grid" | "scattered" | "diagonal"; // Choose bubble positioning
}

export default function MarketCard(props: MarketCard) {
  const {
    width = "w-full",
    height = "h-[600px]",
    bubbleSize = "w-28 h-28", // Made default bigger
    bubbleLayout = "grid"
  } = props;

  // Three different bubble positioning options
  const bubbleLayouts = {
    // Symmetric grid layout
    grid: [
      { top: "top-[220px]", left: "left-8" },      // Top left
      { top: "top-[220px]", right: "right-8" },    // Top right
      { top: "top-[360px]", left: "left-12" },     // Bottom left
      { top: "top-[360px]", right: "right-12" },   // Bottom right
    ],
    
    // Scattered/organic positioning
    scattered: [
      { top: "top-[210px]", left: "left-6" },      // Top left
      { top: "top-[240px]", right: "right-6" },    // Top right (lower)
      { top: "top-[320px]", left: "left-20" },     // Middle left (more inward)
      { top: "top-[400px]", right: "right-16" },   // Bottom right
    ],
    
    // Diagonal pattern
    diagonal: [
      { top: "top-[210px]", left: "left-4" },      // Top left corner
      { top: "top-[280px]", left: "left-16" },     // Middle left
      { top: "top-[360px]", right: "right-16" },   // Middle right
      { top: "top-[440px]", right: "right-4" },    // Bottom right corner
    ]
  };

  const bubblePositions = bubbleLayouts[bubbleLayout];

  return (
    <div className={`relative ${width} max-sm:w-full ${height} rounded-2xl overflow-hidden`}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={props.image}
          alt={props.imageAlt}
          fill
          className="object-cover"
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Main Info Card Overlay - Top */}
      <div className="absolute top-6 left-6 right-6 rounded-2xl p-6 border-4 border-primary z-20 bg-base-200" >
        <h2 className="text-2xl font-bold text-primary text-center mb-2 max-sm:text-xl">
          {props.title}
        </h2>
        <p className="text-center text-primary font-medium mb-1 max-sm:text-sm">
          {props.description}
        </p>
        {props.stallCount && (
          <p className="text-center text-primary font-semibold max-sm:text-sm">
            {props.stallCount} Stalls
          </p>
        )}
      </div>

      {/* Cuisine Type Bubbles - Structured Grid */}
      {props.cuisineTypes && props.cuisineTypes.length > 0 && (
        <div className="absolute inset-0 z-10">
          {props.cuisineTypes.slice(0, 4).map((cuisine, index) => {
            const position = bubblePositions[index];
            if (!position) return null;
            
            return (
              <div
                key={cuisine}
                className={`absolute ${bubbleSize} rounded-full flex items-center justify-center border-4 border-primary ${position.top || ''} ${position.left || ''} ${position.right || ''}`}
                style={{ backgroundColor: '#F6F5F3B3' }}
              >
                <span className="text-primary font-bold text-base text-center px-2 max-sm:text-sm">
                  {cuisine}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Opening Hours - Bottom Overlay */}
      {/* <div className="absolute bottom-6 left-6 right-6 rounded-xl p-4 border-2 border-primary z-20" style={{ backgroundColor: '#F6F5F3B3'}}>
        <p className="text-primary font-bold text-center mb-1 max-sm:text-sm">Opening Hours</p>
        <p className="text-gray-700 text-center font-medium max-sm:text-xs">{props.openingTime}</p>
      </div> */}
    </div>
  );
}
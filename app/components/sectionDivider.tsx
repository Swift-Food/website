import Image from "next/image";

interface SectionDividerProps {
  text: string;
  className?: string;
  logoSize?: number;
  textSize?: "sm" | "md" | "lg" | "xl";
}

export default function SectionDivider({
  text,
  className = "",
  logoSize = 64,
  textSize = "md",
}: SectionDividerProps) {
  const textSizeClasses = {
    sm: "text-lg max-sm:text-base",
    md: "text-xl max-sm:text-lg", 
    lg: "text-2xl max-sm:text-xl",
    xl: "text-3xl max-sm:text-2xl",
  };

  return (
    <section className={`w-full flex justify-center my-8 ${className}`}>
      <div className="bg-primary pl-4 rounded-full flex items-center gap-4 shadow-lg">
        <h2 className={`text-white font-bold whitespace-nowrap ${textSizeClasses[textSize]}`}>
          {text}
        </h2>
        <div className="bg-primary py-4 px-2 rounded-full flex items-center gap-1"> {/* Reduced gap */}
        <section className={'flex flex-col gap-0 leading-none'}>
            <h2 className={`text-white font-bold whitespace-nowrap leading-tight ${textSizeClasses['sm']}`}>
            Swift
            </h2>
            <h2 className={`text-white font-bold whitespace-nowrap leading-tight -mt-1 ${textSizeClasses['sm']}`}>
            Food
            </h2>
        </section>
        <div className="relative flex-shrink-0">
            <Image
            src="/white-logo.png" 
            alt="Swift Food Logo"
            width={logoSize}
            height={logoSize}
            className="object-contain"
            />
        </div>
        </div>
      </div>
    </section>
  );
}
import Image from 'next/image';
import { FC } from 'react';

interface ImageTextContainerProps {
  imageSrc: string;
  imageAlt?: string;
  text: string;
  imageWidth?: number;
  imageHeight?: number;
  className?: string;
  textClassName?: string;
  imageClassName?: string;
  onClick?: () => void;
}

export const ImageTextContainer: FC<ImageTextContainerProps> = ({ 
  imageSrc, 
  imageAlt = "Image", 
  text, 
  imageWidth = 200, 
  imageHeight = 150, // Standard height for all images
  className = "",
  textClassName = "",
  imageClassName = "",
  onClick
}) => {
  return (
    <div 
      className={`
        rounded-lg 
        border 
        border-pink-300 
        bg-transparent 
        p-4 
        flex 
        flex-col 
        items-center 
      
        h-80
        w-full
        max-w-xs
        ${onClick ? 'cursor-pointer hover:border-pink-400 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image Container - Fixed height, full width */}
      <div className={`relative w-full h-40 overflow-hidden rounded-lg ${imageClassName}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      
      {/* Text Container - Fixed height with overflow handling */}
      <div className="flex-1 flex items-center justify-center w-full">
        <p className={`text-center text-gray-700 text-sm line-clamp-4 ${textClassName}`}>
          {text}
        </p>
      </div>
    </div>
  );
};
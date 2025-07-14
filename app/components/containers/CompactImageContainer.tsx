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
  imageHeight = 200,
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
        p-6 
        flex 
        flex-col 
        items-center 
        gap-4 
        ${onClick ? 'cursor-pointer hover:border-pink-400 transition-colors' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {/* Image */}
      <div className={`relative overflow-hidden rounded-lg ${imageClassName}`}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          className="object-cover rounded-lg"
        />
      </div>
      
      {/* Text */}
      <p className={`text-center text-gray-700 ${textClassName}`}>
        {text}
      </p>
    </div>
  );
};
import Image from "next/image";

interface ImageTextSectionProps {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  buttonTitle?: string;
  buttonLink?: string;
  onButtonClick?: () => void;
  className?: string;
  imageClassName?: string;
  textClassName?: string;
  reverse?: boolean; // Option to put text on left, image on right
}

export default function ImageTextSection({
  image,
  imageAlt,
  title,
  description,
  buttonTitle,
  buttonLink,
  onButtonClick,
  className = "",
  imageClassName = "",
  textClassName = "",
  reverse = false,
}: ImageTextSectionProps) {
  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else if (buttonLink) {
      window.location.href = buttonLink;
    }
  };

  const imageSection = (
    <div className={`flex-1 relative h-full rounded-xl overflow-hidden max-lg:flex-none max-lg:w-full max-lg:max-w-md max-lg:mx-auto ${imageClassName}`}>
      <div className="relative w-full aspect-[4/3] max-sm:aspect-[16/9] max-lg:max-h-64 max-sm:max-h-48">
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );

  const textSection = (
    <div className={`flex-1 flex flex-col justify-center gap-4 p-6 max-lg:p-4 max-sm:p-3 max-lg:text-center ${textClassName}`}>
      {title && (
        <h2 className="text-3xl font-bold text-primary max-lg:text-2xl max-sm:text-xl">
          {title}
        </h2>
      )}
      <p className="text-gray-700 leading-relaxed text-lg max-lg:text-base max-sm:text-sm">
        {description}
      </p>
      {buttonTitle && (
        <div className="max-lg:flex max-lg:justify-center">
          <button
            onClick={handleButtonClick}
            className="btn btn-primary rounded-full btn-sm text-white w-fit max-sm:px-4 max-sm:py-2"
          >
            {buttonTitle}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <section className={`flex w-full gap-6 max-lg:flex-col max-lg:gap-4 max-sm:gap-3 justify-between items-center ${className}`}>
      {reverse ? (
        <>
          {textSection}
          {imageSection}
        </>
      ) : (
        <>
          {imageSection}
          {textSection}
        </>
      )}
    </section>
  );
}
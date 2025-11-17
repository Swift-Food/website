"use client";

import { Upload, Loader, X } from "lucide-react";
import Image from "next/image";

interface ImageUploadSectionProps {
  images: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  uploadingImage: boolean;
}

export const ImageUploadSection = ({
  images,
  onImageUpload,
  onImageRemove,
  uploadingImage,
}: ImageUploadSectionProps) => {
  return (
    <div>
      <label className="block text-lg font-bold text-gray-900 mb-4">
        Restaurant Photos
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 relative">
                <Image
                  src={image}
                  alt={`Restaurant ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button
                type="button"
                onClick={() => onImageRemove(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                title="Remove"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          onChange={onImageUpload}
          className="hidden"
          disabled={uploadingImage}
        />
        <label
          htmlFor="image-upload"
          className={`inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl ${
            uploadingImage
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "bg-white border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
          } transition-colors w-full`}
        >
          {uploadingImage ? (
            <>
              <Loader size={24} className="animate-spin text-gray-600" />
              <span className="text-base font-medium text-gray-700">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <Upload size={24} className="text-gray-600" />
              <span className="text-base font-medium text-gray-700">
                Click to upload a photo
              </span>
            </>
          )}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          Square images work best • Max 5MB • JPG, PNG, or WebP
        </p>
      </div>
    </div>
  );
};

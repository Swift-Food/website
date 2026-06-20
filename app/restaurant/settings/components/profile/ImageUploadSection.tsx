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
      <p className="text-sm font-medium text-gray-700 mb-1">Restaurant photos</p>
      <p className="text-sm text-gray-500 mb-4">
        The first photo is used as your card banner.
      </p>

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
          className={`inline-flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed rounded-xl text-sm font-medium ${
            uploadingImage
              ? "bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-300 text-gray-700 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
          } transition-colors w-full`}
        >
          {uploadingImage ? (
            <>
              <Loader size={18} className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={18} />
              Click to upload a photo
            </>
          )}
        </label>
        <p className="text-xs text-gray-400 mt-2">
          Square images work best • Max 5MB • JPG, PNG, or WebP
        </p>
      </div>
    </div>
  );
};

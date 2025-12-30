"use client";

import { Upload, Loader, X, Calendar } from "lucide-react";
import Image from "next/image";

interface EventPhotosManagerProps {
  images: string[];
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (imageUrl: string) => void;
  uploadingImage: boolean;
  deletingImage: string | null;
}

export const EventPhotosManager = ({
  images,
  onImageUpload,
  onImageRemove,
  uploadingImage,
  deletingImage,
}: EventPhotosManagerProps) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={20} className="text-purple-600" />
        <label className="block text-lg font-bold text-gray-900">
          Event Photos
        </label>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Showcase photos from events, catering setups, or special occasions
      </p>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {images.map((image, index) => {
            const isDeleting = deletingImage === image;
            return (
              <div key={index} className="relative group">
                <div className={`w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 relative ${isDeleting ? 'opacity-50' : ''}`}>
                  <Image
                    src={image}
                    alt={`Event ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {isDeleting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>
                {!isDeleting && (
                  <button
                    type="button"
                    onClick={() => onImageRemove(image)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Remove"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          id="event-image-upload"
          accept="image/*"
          multiple
          onChange={onImageUpload}
          className="hidden"
          disabled={uploadingImage}
        />
        <label
          htmlFor="event-image-upload"
          className={`inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl ${
            uploadingImage
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "bg-white border-purple-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
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
              <Upload size={24} className="text-purple-600" />
              <span className="text-base font-medium text-gray-700">
                Click to upload event photos
              </span>
            </>
          )}
        </label>
        <p className="text-sm text-gray-500 mt-2">
          You can select multiple images at once • Max 5MB each • JPG, PNG, or WebP
        </p>
      </div>
    </div>
  );
};

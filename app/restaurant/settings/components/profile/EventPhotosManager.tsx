"use client";

import { useState, useRef } from "react";
import { Upload, Loader, X, Calendar, Pencil } from "lucide-react";
import Image from "next/image";
import { ImageCropModal } from "./ImageCropModal";

interface EventPhotosManagerProps {
  images: string[];
  onImagesUpload: (files: File[]) => Promise<void>;
  onImageReplace: (oldUrl: string, file: File) => Promise<void>;
  onImageRemove: (imageUrl: string) => void;
  uploadingImage: boolean;
  deletingImage: string | null;
}

export const EventPhotosManager = ({
  images,
  onImagesUpload,
  onImageReplace,
  onImageRemove,
  uploadingImage,
  deletingImage,
}: EventPhotosManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [croppedFiles, setCroppedFiles] = useState<File[]>([]);

  // For editing existing images
  const [editingImageUrl, setEditingImageUrl] = useState<string | null>(null);
  const [replacingImage, setReplacingImage] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setPendingFiles(fileArray);
    setCroppedFiles([]);
    setEditingImageUrl(null);
    startCropping(fileArray, 0);

    e.target.value = "";
  };

  const startCropping = (files: File[], index: number) => {
    if (index >= files.length) return;

    const file = files[index];
    const reader = new FileReader();
    reader.onload = () => {
      setCurrentImageSrc(reader.result as string);
      setCurrentCropIndex(index);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    // If editing an existing image
    if (editingImageUrl) {
      const croppedFile = new File([croppedBlob], "cropped-image.jpg", { type: "image/jpeg" });
      setCurrentImageSrc(null);
      setReplacingImage(editingImageUrl);
      const urlToReplace = editingImageUrl;
      setEditingImageUrl(null);
      await onImageReplace(urlToReplace, croppedFile);
      setReplacingImage(null);
      return;
    }

    // New image upload flow
    const originalFile = pendingFiles[currentCropIndex];
    const croppedFile = new File([croppedBlob], originalFile.name, { type: "image/jpeg" });

    const newCroppedFiles = [...croppedFiles, croppedFile];
    setCroppedFiles(newCroppedFiles);

    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingFiles.length) {
      startCropping(pendingFiles, nextIndex);
    } else {
      setCurrentImageSrc(null);
      setCurrentCropIndex(-1);
      setPendingFiles([]);
      await onImagesUpload(newCroppedFiles);
      setCroppedFiles([]);
    }
  };

  const handleCropCancel = () => {
    // If editing existing image, just close
    if (editingImageUrl) {
      setCurrentImageSrc(null);
      setEditingImageUrl(null);
      return;
    }

    // New image upload flow - skip to next
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < pendingFiles.length) {
      startCropping(pendingFiles, nextIndex);
    } else {
      setCurrentImageSrc(null);
      setCurrentCropIndex(-1);
      setPendingFiles([]);
      if (croppedFiles.length > 0) {
        onImagesUpload(croppedFiles);
      }
      setCroppedFiles([]);
    }
  };

  const handleEditImage = async (imageUrl: string) => {
    setEditingImageUrl(imageUrl);

    // Fetch image via proxy to bypass CORS, then convert to data URL
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setCurrentImageSrc(dataUrl);
    } catch (error) {
      console.error("Failed to load image for editing:", error);
      setEditingImageUrl(null);
    }
  };

  const isCropping = currentImageSrc !== null;

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
            const isReplacing = replacingImage === image;
            const isProcessing = isDeleting || isReplacing;

            return (
              <div key={index} className="relative group">
                <div
                  className={`w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 relative cursor-pointer transition-all ${
                    isProcessing ? 'opacity-50' : 'hover:border-purple-400 hover:shadow-lg'
                  }`}
                  onClick={() => !isProcessing && handleEditImage(image)}
                >
                  <Image
                    src={image}
                    alt={`Event ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {/* Edit overlay - always visible on hover */}
                  {!isProcessing && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Pencil size={20} className="text-purple-600" />
                        </div>
                        <span className="text-white text-sm font-medium">Edit</span>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                {/* Delete button */}
                {!isProcessing && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageRemove(image);
                    }}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
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
          ref={fileInputRef}
          type="file"
          id="event-image-upload"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploadingImage || isCropping}
        />
        <label
          htmlFor="event-image-upload"
          className={`inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl ${
            uploadingImage || isCropping
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
          Images will be cropped to square • Click any image to edit • Max 5MB each
        </p>
      </div>

      {/* Crop Modal */}
      {currentImageSrc && (
        <ImageCropModal
          imageSrc={currentImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

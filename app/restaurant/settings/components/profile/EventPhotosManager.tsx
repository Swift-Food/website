"use client";

import { useState, useRef } from "react";
import { Upload, Loader, X, Calendar, Pencil } from "lucide-react";
import Image from "next/image";
import { ImageCropModal } from "./ImageCropModal";

// Pending image with both original and cropped versions
export interface PendingEventImage {
  originalDataUrl: string; // Original for re-cropping
  croppedBlob: Blob; // Cropped version to upload
  croppedDataUrl: string; // Cropped preview
}

interface EventPhotosManagerProps {
  images: string[]; // Already uploaded S3 URLs
  pendingImages: PendingEventImage[];
  onPendingImagesChange: (images: PendingEventImage[]) => void;
  onImageRemove: (imageUrl: string) => void;
  uploadingImage: boolean;
  deletingImage: string | null;
}

export const EventPhotosManager = ({
  images,
  pendingImages,
  onPendingImagesChange,
  onImageRemove,
  uploadingImage,
  deletingImage,
}: EventPhotosManagerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For new file selection flow
  const [filesToCrop, setFilesToCrop] = useState<{ file: File; dataUrl: string }[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(-1);
  const [currentImageSrc, setCurrentImageSrc] = useState<string | null>(null);
  const [croppedFromBatch, setCroppedFromBatch] = useState<PendingEventImage[]>([]);

  // For editing existing/pending images
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingType, setEditingType] = useState<"uploaded" | "pending" | null>(null);
  const [editingOriginalDataUrl, setEditingOriginalDataUrl] = useState<string | null>(null);

  const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert all files to data URLs first
    const fileData = await Promise.all(
      Array.from(files).map(async (file) => ({
        file,
        dataUrl: await blobToDataUrl(file),
      }))
    );

    setFilesToCrop(fileData);
    setCroppedFromBatch([]);
    setEditingIndex(null);
    setEditingType(null);
    startCroppingBatch(fileData, 0);

    e.target.value = "";
  };

  const startCroppingBatch = (fileData: { file: File; dataUrl: string }[], index: number) => {
    if (index >= fileData.length) return;
    setCurrentImageSrc(fileData[index].dataUrl);
    setCurrentCropIndex(index);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const croppedDataUrl = await blobToDataUrl(croppedBlob);

    // Editing an uploaded image - convert to pending
    if (editingType === "uploaded" && editingIndex !== null && editingOriginalDataUrl) {
      const imageUrl = images[editingIndex];
      onImageRemove(imageUrl);

      const newPendingImage: PendingEventImage = {
        originalDataUrl: editingOriginalDataUrl,
        croppedBlob,
        croppedDataUrl,
      };

      onPendingImagesChange([...pendingImages, newPendingImage]);

      setCurrentImageSrc(null);
      setEditingIndex(null);
      setEditingType(null);
      setEditingOriginalDataUrl(null);
      return;
    }

    // Editing a pending image - update it
    if (editingType === "pending" && editingIndex !== null) {
      const newPending = [...pendingImages];
      newPending[editingIndex] = {
        ...newPending[editingIndex],
        croppedBlob,
        croppedDataUrl,
      };
      onPendingImagesChange(newPending);

      setCurrentImageSrc(null);
      setEditingIndex(null);
      setEditingType(null);
      setEditingOriginalDataUrl(null);
      return;
    }

    // New batch upload flow
    const originalDataUrl = filesToCrop[currentCropIndex].dataUrl;
    const newPendingImage: PendingEventImage = {
      originalDataUrl,
      croppedBlob,
      croppedDataUrl,
    };

    const newCropped = [...croppedFromBatch, newPendingImage];
    setCroppedFromBatch(newCropped);

    const nextIndex = currentCropIndex + 1;
    if (nextIndex < filesToCrop.length) {
      startCroppingBatch(filesToCrop, nextIndex);
    } else {
      // All done - add to pending
      setCurrentImageSrc(null);
      setCurrentCropIndex(-1);
      setFilesToCrop([]);
      setCroppedFromBatch([]);
      onPendingImagesChange([...pendingImages, ...newCropped]);
    }
  };

  const handleCropCancel = () => {
    // Editing existing - just close
    if (editingType !== null) {
      setCurrentImageSrc(null);
      setEditingIndex(null);
      setEditingType(null);
      setEditingOriginalDataUrl(null);
      return;
    }

    // Batch flow - skip to next
    const nextIndex = currentCropIndex + 1;
    if (nextIndex < filesToCrop.length) {
      startCroppingBatch(filesToCrop, nextIndex);
    } else {
      setCurrentImageSrc(null);
      setCurrentCropIndex(-1);
      setFilesToCrop([]);

      if (croppedFromBatch.length > 0) {
        onPendingImagesChange([...pendingImages, ...croppedFromBatch]);
      }
      setCroppedFromBatch([]);
    }
  };

  const handleEditUploaded = async (index: number) => {
    const imageUrl = images[index];
    setEditingIndex(index);
    setEditingType("uploaded");

    try {
      // Fetch original via proxy and store it
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const dataUrl = await blobToDataUrl(blob);

      setEditingOriginalDataUrl(dataUrl);
      setCurrentImageSrc(dataUrl);
    } catch (error) {
      console.error("Failed to load image for editing:", error);
      setEditingIndex(null);
      setEditingType(null);
    }
  };

  const handleEditPending = (index: number) => {
    setEditingIndex(index);
    setEditingType("pending");
    // Use the ORIGINAL image for cropping, not the cropped one
    setEditingOriginalDataUrl(pendingImages[index].originalDataUrl);
    setCurrentImageSrc(pendingImages[index].originalDataUrl);
  };

  const handleRemovePending = (index: number) => {
    const newPending = pendingImages.filter((_, i) => i !== index);
    onPendingImagesChange(newPending);
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

      {/* Image Grid */}
      {(images.length > 0 || pendingImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Uploaded images */}
          {images.map((image, index) => {
            const isDeleting = deletingImage === image;

            return (
              <div key={`uploaded-${index}`} className="relative group">
                <div
                  className={`w-full aspect-square rounded-xl overflow-hidden border-2 border-gray-200 relative cursor-pointer transition-all ${
                    isDeleting ? 'opacity-50' : 'hover:border-purple-400 hover:shadow-lg'
                  }`}
                  onClick={() => !isDeleting && handleEditUploaded(index)}
                >
                  <Image
                    src={image}
                    alt={`Event ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />

                  {!isDeleting && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <Pencil size={20} className="text-purple-600" />
                        </div>
                        <span className="text-white text-sm font-medium">Edit</span>
                      </div>
                    </div>
                  )}

                  {isDeleting && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Loader size={24} className="animate-spin text-white" />
                    </div>
                  )}
                </div>

                {!isDeleting && (
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

          {/* Pending images (not yet uploaded) - show cropped preview */}
          {pendingImages.map((pending, index) => (
            <div key={`pending-${index}`} className="relative group">
              <div
                className="w-full aspect-square rounded-xl overflow-hidden border-2 border-dashed border-purple-400 relative cursor-pointer transition-all hover:border-purple-500 hover:shadow-lg bg-purple-50"
                onClick={() => handleEditPending(index)}
              >
                <Image
                  src={pending.croppedDataUrl}
                  alt={`Pending ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

                {/* Pending badge */}
                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                  Not saved
                </div>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-1">
                    <div className="bg-white rounded-full p-3 shadow-lg">
                      <Pencil size={20} className="text-purple-600" />
                    </div>
                    <span className="text-white text-sm font-medium">Edit crop</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePending(index);
                }}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
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
          Images will be cropped to square • Click any image to adjust crop • Max 5MB each
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

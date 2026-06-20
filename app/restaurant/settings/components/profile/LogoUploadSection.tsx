"use client";

import { useState } from "react";
import { Loader, Upload } from "lucide-react";
import Image from "next/image";
import { ImageCropModal, CropResult } from "./ImageCropModal";

interface LogoUploadSectionProps {
  logoImageUrl?: string;
  uploadingLogoImage: boolean;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
}

/**
 * Restaurant logo upload with a square-crop step. Reads the chosen file into a
 * data URL, opens the crop modal, and uploads the cropped result on confirm.
 */
export const LogoUploadSection = ({
  logoImageUrl,
  uploadingLogoImage,
  onLogoUpload,
  onLogoRemove,
}: LogoUploadSectionProps) => {
  const [logoCropSrc, setLogoCropSrc] = useState<string | null>(null);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => setLogoCropSrc(reader.result as string);
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleLogoCropComplete = (result: CropResult) => {
    const file = new File([result.blob], "logo.jpg", { type: "image/jpeg" });
    setLogoCropSrc(null);
    onLogoUpload(file);
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1">Logo</p>
      <p className="text-sm text-gray-500 mb-4">
        Shown as a circle on your card and menu items.
      </p>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0 bg-gray-50 flex items-center justify-center">
          {logoImageUrl ? (
            <Image
              src={logoImageUrl}
              alt="Restaurant logo"
              width={80}
              height={80}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <Upload size={22} className="text-gray-300" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleLogoFileChange}
            className="hidden"
            disabled={uploadingLogoImage}
          />
          <label
            htmlFor="logo-upload"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-colors ${
              uploadingLogoImage
                ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white border-gray-300 text-gray-700 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
            }`}
          >
            {uploadingLogoImage ? (
              <>
                <Loader size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                {logoImageUrl ? "Replace logo" : "Upload logo"}
              </>
            )}
          </label>
          {logoImageUrl && (
            <button
              type="button"
              onClick={onLogoRemove}
              className="text-sm text-red-600 hover:text-red-700 font-medium text-left"
            >
              Remove logo
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">
        You can crop after selecting • Max 5MB • JPG, PNG, or WebP
      </p>

      {logoCropSrc && (
        <ImageCropModal
          imageSrc={logoCropSrc}
          onCropComplete={handleLogoCropComplete}
          onCancel={() => setLogoCropSrc(null)}
        />
      )}
    </div>
  );
};

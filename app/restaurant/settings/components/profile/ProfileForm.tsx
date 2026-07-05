"use client";

import { Save, Loader, AlertCircle, ArrowLeft } from "lucide-react";
import { ImageUploadSection } from "./ImageUploadSection";
import { EventPhotosManager, PendingEventImage } from "./EventPhotosManager";
import { RestaurantCardPreview } from "./RestaurantCardPreview";
import { LogoUploadSection } from "./LogoUploadSection";
import { RestaurantDetailsFields } from "./RestaurantDetailsFields";
import { EmailListInput } from "./EmailListInput";
import {
  CateringCapabilitiesFields,
  CUISINE_OPTIONS,
} from "./CateringCapabilitiesFields";
import { SettingsCard } from "./SettingsCard";

interface ProfileFormProps {
  restaurantName: string;
  description: string;
  orderNotificationEmails: string[];
  contactNumber: string;
  images: string[];
  eventImages: string[];
  logoImageUrl?: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onOrderNotificationEmailsChange: (value: string[]) => void;
  onContactNumberChange: (value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onLogoUpload: (file: File) => void;
  onLogoRemove: () => void;
  uploadingLogoImage: boolean;
  pendingEventImages: PendingEventImage[];
  onPendingEventImagesChange: (images: PendingEventImage[]) => void;
  pendingEventDeletions: string[];
  onEventImageRemove: (imageUrl: string) => void;
  onEventImageRestore: (imageUrl: string) => void;
  onSave: () => void;
  onCancel: () => void;
  uploadingImage: boolean;
  uploadingEventImage: boolean;
  saving: boolean;
  error: string;
  success: string;
  // Catering capabilities
  cuisine: string;
  cateringFormats: string[];
  dietarySupport: string[];
  minCapacity: string;
  maxCapacity: string;
  cateringServiceWindows: string[];
  onCuisineChange: (value: string) => void;
  onCateringFormatsChange: (value: string[]) => void;
  onDietarySupportChange: (value: string[]) => void;
  onMinCapacityChange: (value: string) => void;
  onMaxCapacityChange: (value: string) => void;
  onCateringServiceWindowsChange: (value: string[]) => void;
  tags?: string[];
  onTagsChange: (value: string[]) => void;
}

export const ProfileForm = ({
  restaurantName,
  description,
  orderNotificationEmails,
  contactNumber,
  images,
  eventImages,
  logoImageUrl,
  onNameChange,
  onDescriptionChange,
  onOrderNotificationEmailsChange,
  onContactNumberChange,
  onImageUpload,
  onImageRemove,
  onLogoUpload,
  onLogoRemove,
  uploadingLogoImage,
  pendingEventImages,
  onPendingEventImagesChange,
  pendingEventDeletions,
  onEventImageRemove,
  onEventImageRestore,
  onSave,
  onCancel,
  uploadingImage,
  uploadingEventImage,
  saving,
  error,
  success,
  cuisine,
  cateringFormats,
  dietarySupport,
  onCuisineChange,
  onCateringFormatsChange,
  onDietarySupportChange,
  tags = [],
  onTagsChange,
}: ProfileFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  const cuisineLabel = CUISINE_OPTIONS.find((opt) => opt.value === cuisine)?.label;

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit}>
        <div className="max-w-6xl mx-auto px-4 py-8 pb-28">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={onCancel}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft size={22} className="text-gray-700" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant Profile
              </h1>
              <p className="text-gray-500 mt-0.5">
                Manage how your restaurant appears to customers
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start text-red-700">
              <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {/* Two-column: form + sticky preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8 items-start">
            {/* Preview (top on mobile, right on desktop) */}
            <aside className="order-1 lg:order-2 lg:sticky lg:top-8">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                <RestaurantCardPreview
                  restaurantName={restaurantName}
                  images={images}
                  logoImageUrl={logoImageUrl}
                  tags={tags}
                  cuisineLabel={cuisineLabel}
                />
              </div>
            </aside>

            {/* Form sections */}
            <div className="order-2 lg:order-1 space-y-6">
              <SettingsCard
                title="Brand & Photos"
                description="Your logo and photos shown on your card and listings."
              >
                <div className="space-y-6">
                  <LogoUploadSection
                    logoImageUrl={logoImageUrl}
                    uploadingLogoImage={uploadingLogoImage}
                    onLogoUpload={onLogoUpload}
                    onLogoRemove={onLogoRemove}
                  />
                  <div className="border-t border-gray-100" />
                  <ImageUploadSection
                    images={images}
                    onImageUpload={onImageUpload}
                    onImageRemove={onImageRemove}
                    uploadingImage={uploadingImage}
                  />
                  <div className="border-t border-gray-100" />
                  <EventPhotosManager
                    images={eventImages}
                    pendingImages={pendingEventImages}
                    onPendingImagesChange={onPendingEventImagesChange}
                    pendingDeletions={pendingEventDeletions}
                    onImageRemove={onEventImageRemove}
                    onImageRestore={onEventImageRestore}
                    uploadingImage={uploadingEventImage}
                  />
                </div>
              </SettingsCard>

              <SettingsCard
                title="Details"
                description="Basic information customers see about your restaurant."
              >
                <RestaurantDetailsFields
                  restaurantName={restaurantName}
                  description={description}
                  contactNumber={contactNumber}
                  onNameChange={onNameChange}
                  onDescriptionChange={onDescriptionChange}
                  onContactNumberChange={onContactNumberChange}
                />
              </SettingsCard>

              <SettingsCard
                title="Order notification email"
                description="Every address here receives new-order alerts, refund notices and payout receipts. Add every teammate who should know."
              >
                <EmailListInput
                  values={orderNotificationEmails}
                  onChange={onOrderNotificationEmailsChange}
                  placeholder="orders@restaurant.com"
                />
              </SettingsCard>

              <SettingsCard
                title="Catering Capabilities"
                description="Cuisine, service formats, dietary options and discovery tags."
              >
                <CateringCapabilitiesFields
                  cuisine={cuisine}
                  cateringFormats={cateringFormats}
                  dietarySupport={dietarySupport}
                  tags={tags}
                  onCuisineChange={onCuisineChange}
                  onCateringFormatsChange={onCateringFormatsChange}
                  onDietarySupportChange={onDietarySupportChange}
                  onTagsChange={onTagsChange}
                />
              </SettingsCard>
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t border-gray-200 z-30">
          <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingEventImage || uploadingLogoImage}
              className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

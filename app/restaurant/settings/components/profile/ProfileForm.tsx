"use client";

import { Save, Loader, AlertCircle, ArrowLeft } from "lucide-react";
import { ImageUploadSection } from "./ImageUploadSection";
import { EventPhotosManager, PendingEventImage } from "./EventPhotosManager";

interface ProfileFormProps {
  restaurantName: string;
  description: string;
  contactEmail: string;
  contactNumber: string;
  images: string[];
  eventImages: string[];
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
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
}

export const ProfileForm = ({
  restaurantName,
  description,
  contactEmail,
  contactNumber,
  images,
  eventImages,
  onNameChange,
  onDescriptionChange,
  onContactEmailChange,
  onContactNumberChange,
  onImageUpload,
  onImageRemove,
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
}: ProfileFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              Restaurant Profile
            </h1>
            <p className="text-gray-600 mt-1">
              Update your name, description, and photos
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            {/* Restaurant Images */}
            <ImageUploadSection
              images={images}
              onImageUpload={onImageUpload}
              onImageRemove={onImageRemove}
              uploadingImage={uploadingImage}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Event Images */}
            <EventPhotosManager
              images={eventImages}
              pendingImages={pendingEventImages}
              onPendingImagesChange={onPendingEventImagesChange}
              pendingDeletions={pendingEventDeletions}
              onImageRemove={onEventImageRemove}
              onImageRestore={onEventImageRestore}
              uploadingImage={uploadingEventImage}
            />

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Restaurant Name */}
            <div>
              <label
                htmlFor="restaurant_name"
                className="block text-lg font-bold text-gray-900 mb-3"
              >
                Restaurant Name *
              </label>
              <input
                type="text"
                id="restaurant_name"
                name="restaurant_name"
                value={restaurantName}
                onChange={(e) => onNameChange(e.target.value)}
                required
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter restaurant name"
              />
            </div>

            {/* Restaurant Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-lg font-bold text-gray-900 mb-3"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                rows={5}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white resize-none"
                placeholder="Tell customers about your restaurant..."
              />
              <p className="text-sm text-gray-500 mt-2">
                This will be shown to customers when they browse your restaurant
              </p>
            </div>

            {/* Contact Email */}
            <div>
              <label
                htmlFor="contact_email"
                className="block text-lg font-bold text-gray-900 mb-3"
              >
                Contact Email
              </label>
              <input
                type="email"
                id="contact_email"
                name="contact_email"
                value={contactEmail}
                onChange={(e) => onContactEmailChange(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., info@restaurant.com"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label
                htmlFor="contact_number"
                className="block text-lg font-bold text-gray-900 mb-3"
              >
                Contact Number
              </label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={contactNumber}
                onChange={(e) => onContactNumberChange(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="e.g., +44 7123 456789"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-8 mt-8 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl transition-colors text-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || uploadingEventImage}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg shadow-purple-500/30"
            >
              {saving ? (
                <>
                  <Loader size={24} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={24} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

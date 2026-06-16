"use client";

import { useState } from "react";
import { Save, Loader, AlertCircle, ArrowLeft, X, Upload } from "lucide-react";
import Image from "next/image";
import { ImageUploadSection } from "./ImageUploadSection";
import { EventPhotosManager, PendingEventImage } from "./EventPhotosManager";

const CUISINE_OPTIONS = [
  { value: "british", label: "British" },
  { value: "italian", label: "Italian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "indian", label: "Indian" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "american", label: "American" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "thai", label: "Thai" },
  { value: "mexican", label: "Mexican" },
  { value: "caribbean", label: "Caribbean" },
  { value: "african", label: "African" },
  { value: "eastern_european", label: "Eastern European" },
  { value: "fusion", label: "Fusion" },
  { value: "other", label: "Other" },
];

const CATERING_FORMAT_OPTIONS = [
  { value: "buffet", label: "Buffet" },
  { value: "set_menu", label: "Set Menu" },
  { value: "individual_box", label: "Individual Box" },
  { value: "canapes", label: "Canapés" },
  { value: "grazing_table", label: "Grazing Table" },
  { value: "family_style", label: "Family Style" },
];

const DIETARY_SUPPORT_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "dairy_free", label: "Dairy Free" },
  { value: "nut_free", label: "Nut Free" },
  { value: "peanut_free", label: "Peanut Free" },
  { value: "high_protein", label: "High Protein" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "low_calorie", label: "Low Calorie" },
];

const SERVICE_WINDOW_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "all", label: "All Day" },
];

interface ProfileFormProps {
  restaurantName: string;
  description: string;
  contactEmail: string;
  contactNumber: string;
  images: string[];
  eventImages: string[];
  logoImageUrl?: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onContactEmailChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageRemove: (index: number) => void;
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  contactEmail,
  contactNumber,
  images,
  eventImages,
  logoImageUrl,
  onNameChange,
  onDescriptionChange,
  onContactEmailChange,
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
  minCapacity,
  maxCapacity,
  cateringServiceWindows,
  onCuisineChange,
  onCateringFormatsChange,
  onDietarySupportChange,
  onMinCapacityChange,
  onMaxCapacityChange,
  onCateringServiceWindowsChange,
  tags = [],
  onTagsChange,
}: ProfileFormProps) => {
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      onTagsChange([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const toggleArrayValue = (arr: string[], value: string): string[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
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
            {/* Restaurant Logo */}
            <div>
              <label className="block text-lg font-bold text-gray-900 mb-2">
                Restaurant Logo
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Shown as a circle on menu item cards
              </p>
              {logoImageUrl && (
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                    <Image
                      src={logoImageUrl}
                      alt="Restaurant logo"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onLogoRemove}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remove logo
                  </button>
                </div>
              )}
              <input
                type="file"
                id="logo-upload"
                accept="image/*"
                onChange={onLogoUpload}
                className="hidden"
                disabled={uploadingLogoImage}
              />
              <label
                htmlFor="logo-upload"
                className={`inline-flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-xl ${
                  uploadingLogoImage
                    ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                    : "bg-white border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer"
                } transition-colors w-full`}
              >
                {uploadingLogoImage ? (
                  <>
                    <Loader size={24} className="animate-spin text-gray-600" />
                    <span className="text-base font-medium text-gray-700">Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={24} className="text-gray-600" />
                    <span className="text-base font-medium text-gray-700">
                      {logoImageUrl ? "Replace logo" : "Upload logo"}
                    </span>
                  </>
                )}
              </label>
              <p className="text-sm text-gray-500 mt-2">Square images work best • Max 5MB • JPG, PNG, or WebP</p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

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

            {/* Catering Capabilities */}
            <div className="border-t border-gray-200"></div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">Catering Capabilities</h2>

              {/* Primary Cuisine */}
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Primary Cuisine
                </label>
                <select
                  value={cuisine}
                  onChange={(e) => onCuisineChange(e.target.value)}
                  className="w-full px-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {CUISINE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Service Formats */}
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Service Formats
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {CATERING_FORMAT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cateringFormats.includes(opt.value)}
                        onChange={() => onCateringFormatsChange(toggleArrayValue(cateringFormats, opt.value))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dietary Capabilities */}
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Dietary Capabilities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_SUPPORT_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dietarySupport.includes(opt.value)}
                        onChange={() => onDietarySupportChange(toggleArrayValue(dietarySupport, opt.value))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-lg font-bold text-gray-900 mb-3">
                  Tags (max 5)
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Add custom tags to help customers discover your restaurant (e.g. "Street Food", "Family Friendly", "Award Winning")
                </p>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={tags.length >= 5 ? "Maximum 5 tags reached" : "Type a tag and press Enter or Add"}
                    disabled={tags.length >= 5}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-purple-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
              disabled={saving || uploadingImage || uploadingEventImage || uploadingLogoImage}
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

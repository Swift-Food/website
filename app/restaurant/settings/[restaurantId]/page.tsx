"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  Save,
  AlertCircle,
  Settings,
  Upload,
  Clock,
  X,
  User,
  Package,
} from "lucide-react";
import Image from "next/image";
import { cateringService } from "@/services/cateringServices";
import { InventoryManagement } from "../components/InventoryManagement";

const RestaurantSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState({
    restaurant_name: "",
    description: "",
    images: [] as string[],
    isCatering: false,
    isCorporate: false,
  });

  const [activeTab, setActiveTab] = useState<"profile" | "inventory">("profile");

  useEffect(() => {
    loadRestaurantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadRestaurantDetails = () => {
    // First try to load from sessionStorage (passed from dashboard)
    const cachedData = sessionStorage.getItem("restaurantData");

    if (cachedData) {
      try {
        const restaurantDetails = JSON.parse(cachedData);
        console.log("Loaded restaurant from cache:", restaurantDetails);

        // Handle images array
        const images = restaurantDetails.images || (restaurantDetails.image ? [restaurantDetails.image] : []);

        setFormData({
          restaurant_name: restaurantDetails.restaurant_name || "",
          description: restaurantDetails.restaurant_description || "",
          images: images,
          isCatering: restaurantDetails.isCatering || false,
          isCorporate: restaurantDetails.isCorporate || false,
        });
        setLoading(false);
        // Clear the cached data after using it
        sessionStorage.removeItem("restaurantData");
        return;
      } catch (err) {
        console.error("Failed to parse cached restaurant data:", err);
      }
    }

    // If no cached data, fetch from API
    fetchRestaurantDetails();
  };

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const restaurantDetails = await cateringService.getRestaurant(
        restaurantId
      );
      console.log("Fetched restaurant from API:", restaurantDetails);

      // Handle images array
      const images = restaurantDetails.images || (restaurantDetails.image ? [restaurantDetails.image] : []);

      setFormData({
        restaurant_name: restaurantDetails.restaurant_name || "",
        description: restaurantDetails.restaurant_description || "",
        images: images,
        isCatering: restaurantDetails.isCatering || false,
        isCorporate: restaurantDetails.isCorporate || false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to load restaurant details");
    } finally {
      setLoading(false);
    }
  };

  const updateRestaurant = async (id: string, updates: Record<string, any>) => {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${API_BASE_URL}/restaurant/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error("Failed to update restaurant");
    }

    return response.json();
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", {
      name: file.name,
      type: file.type,
      size: file.size,
      sizeInMB: (file.size / 1024 / 1024).toFixed(2) + "MB",
    });

    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file";
      console.error("Invalid file type:", file.type);
      setError(errorMsg);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const errorMsg = "Image size should be less than 5MB";
      console.error("File too large:", file.size, "bytes");
      setError(errorMsg);
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      // Create FormData for file upload
      const formDataUpload = new FormData();

      // IMPORTANT: Field name must be "upload" (singular) as per backend service configuration
      formDataUpload.append("upload", file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const uploadUrl = `${API_BASE_URL}/image-upload`;

      console.log("=== IMAGE UPLOAD DEBUG ===");
      console.log("API_BASE_URL:", API_BASE_URL);
      console.log("Upload URL:", uploadUrl);
      console.log("File details:", {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      });
      console.log("FormData field name: 'upload'");

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formDataUpload,
      });

      console.log("=== RESPONSE DEBUG ===");
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      // Get response text
      const responseText = await response.text();
      console.log("Response text (raw):", responseText);

      if (!response.ok) {
        console.error("=== UPLOAD FAILED ===");
        console.error("Status:", response.status, response.statusText);
        console.error("Response body:", responseText);
        throw new Error(`Failed to upload image: ${response.status} - ${responseText}`);
      }

      // The backend returns the image URL as a plain JSON string (e.g., "https://...")
      // We need to parse it to remove the quotes
      let imageUrl: string;
      try {
        imageUrl = JSON.parse(responseText);
        console.log("=== SUCCESS ===");
        console.log("Image URL:", imageUrl);
      } catch (parseError) {
        console.error("=== PARSE ERROR ===");
        console.error("Failed to parse response:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Invalid response format from server");
      }

      if (!imageUrl || typeof imageUrl !== 'string') {
        console.error("=== INVALID URL ===");
        console.error("Parsed value:", imageUrl);
        throw new Error("No valid image URL returned from server");
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));

      console.log("Image added to form data, total images:", formData.images.length + 1);

      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Clear the file input
      e.target.value = "";
    } catch (err: any) {
      console.error("Upload error:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      console.error("Error stack:", err.stack);
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate required fields
    if (!formData.restaurant_name.trim()) {
      setError("Restaurant name is required");
      return;
    }

    // Show confirmation modal
    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    setShowConfirmModal(false);

    try {
      // Prepare update data with correct field names
      const updateData: Record<string, any> = {
        restaurant_name: formData.restaurant_name,
        restaurant_description: formData.description,
        images: formData.images,
      };

      await updateRestaurant(restaurantId, updateData);

      setSuccess("Restaurant settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);

      // Refresh restaurant details
      await fetchRestaurantDetails();
    } catch (err: any) {
      setError(err.message || "Failed to update restaurant settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader
            size={48}
            className="animate-spin text-blue-600 mx-auto mb-4"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/restaurant/dashboard")}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="text-blue-600" size={32} />
              Restaurant Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your restaurant profile and settings
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

        {/* Quick Navigation */}
        <div className="mb-6">
          <button
            onClick={() =>
              router.push(`/restaurant/opening-hours/${restaurantId}`)
            }
            className="w-full bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:shadow-md flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 rounded-full p-3 group-hover:bg-blue-100 transition-colors">
                <Clock className="text-blue-600" size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold text-gray-900">
                  Opening Hours
                </h3>
                <p className="text-sm text-gray-600">
                  Set your restaurant&apos;s operating hours and availability
                </p>
              </div>
            </div>
            <ArrowLeft className="rotate-180 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <User size={18} />
                Restaurant Profile
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeTab === "inventory"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Package size={18} />
                Inventory Management
                {(formData.isCatering || formData.isCorporate) && (
                  <span className="ml-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                    Active
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "profile" ? (
          /* Form */
          <form onSubmit={handleSave} className="bg-white rounded-lg p-6">
          <div className="space-y-6">
            {/* Restaurant Images */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Restaurant Images
              </label>

              {/* Display existing images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-200 relative">
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
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="image-upload"
                  className={`inline-flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg ${
                    uploadingImage
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed"
                      : "bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer"
                  } transition-colors`}
                >
                  {uploadingImage ? (
                    <>
                      <Loader size={20} className="animate-spin text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Uploading...
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">
                        Upload Image
                      </span>
                    </>
                  )}
                </label>
                <p className="text-xs text-gray-500">
                  Recommended: Square images, max 5MB each (JPG, PNG, WebP)
                </p>
              </div>
            </div>

            {/* Restaurant Name */}
            <div>
              <label
                htmlFor="restaurant_name"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Restaurant Name *
              </label>
              <input
                type="text"
                id="restaurant_name"
                name="restaurant_name"
                value={formData.restaurant_name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Enter restaurant name"
              />
            </div>

            {/* Restaurant Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-900 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white resize-none"
                placeholder="Enter a brief description of your restaurant"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed to customers browsing your restaurant
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 mt-6 border-t">
            <button
              type="button"
              onClick={() => router.push("/restaurant/dashboard")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </form>
        ) : (
          /* Inventory Management Tab */
          <InventoryManagement
            restaurantId={restaurantId}
            token={typeof window !== "undefined" ? sessionStorage.getItem("restaurant_token") || "" : ""}
            isCatering={formData.isCatering}
            isCorporate={formData.isCorporate}
            onUpdate={loadRestaurantDetails}
          />
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <AlertCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Changes
                </h3>
              </div>

              <p className="text-gray-600 mb-6">
                Are you sure you want to save these changes to your restaurant
                settings? This will update your restaurant&apos;s name,
                description, and images.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={saving}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSave}
                  disabled={saving}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;

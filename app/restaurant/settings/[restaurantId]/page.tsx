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
  Image as ImageIcon,
} from "lucide-react";
import { cateringService } from "@/services/cateringServices";

interface Restaurant {
  restaurantId: string;
  restaurant_name: string;
  description?: string;
  images?: string[];
  image?: string;
  isOpen?: boolean;
  openingHours?: any[];
}

const RestaurantSettingsPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [formData, setFormData] = useState({
    restaurant_name: "",
    description: "",
    image: "",
  });

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
        setRestaurant(restaurantDetails);

        // Handle images array - get first image or fallback to image field
        const imageUrl =
          restaurantDetails.images?.[0] || restaurantDetails.image || "";

        setFormData({
          restaurant_name: restaurantDetails.restaurant_name || "",
          description: restaurantDetails.restaurant_description || "",
          image: imageUrl,
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
      setRestaurant(restaurantDetails);

      // Handle images array - get first image or fallback to image field
      const imageUrl =
        restaurantDetails.images?.[0] || restaurantDetails.image || "";

      setFormData({
        restaurant_name: restaurantDetails.restaurant_name || "",
        description: restaurantDetails.restaurant_description || "",
        image: imageUrl,
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
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      // Create FormData for file upload
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/upload/restaurant-image`, {
        method: "POST",
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const data = await response.json();
      const imageUrl = data.url || data.imageUrl;

      setFormData((prev) => ({
        ...prev,
        image: imageUrl,
      }));

      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      if (!formData.restaurant_name.trim()) {
        setError("Restaurant name is required");
        setSaving(false);
        return;
      }

      // Prepare update data with images array
      const updateData: Record<string, any> = {
        restaurant_name: formData.restaurant_name,
        description: formData.description,
      };

      // Only include images if there's an image to save
      if (formData.image) {
        updateData.images = [formData.image];
      }

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

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-lg p-6">
          <div className="space-y-6">
            {/* Restaurant Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Restaurant Image
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                {formData.image ? (
                  <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img
                      src={formData.image}
                      alt="Restaurant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <ImageIcon className="text-gray-400" size={48} />
                  </div>
                )}

                <div className="flex-1">
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
                    className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg ${
                      uploadingImage
                        ? "bg-gray-100 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50 cursor-pointer"
                    } transition-colors`}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader size={20} className="animate-spin" />
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
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: Square image, max 5MB (JPG, PNG, WebP)
                  </p>
                </div>
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
      </div>
    </div>
  );
};

export default RestaurantSettingsPage;

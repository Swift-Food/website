"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader } from "lucide-react";
import { cateringService } from "@/services/cateringServices";
import { SettingsMenu } from "../components/SettingsMenu";
import { ProfileForm } from "../components/profile/ProfileForm";
import { InventorySection } from "../components/inventory/InventorySection";
import { ConfirmationModal } from "../components/shared/ConfirmationModal";

type ActiveSection = "menu" | "profile" | "inventory" | null;

interface FormData {
  restaurant_name: string;
  description: string;
  images: string[];
  isCatering: boolean;
  isCorporate: boolean;
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
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    restaurant_name: "",
    description: "",
    images: [],
    isCatering: false,
    isCorporate: false,
  });

  const [activeSection, setActiveSection] = useState<ActiveSection>(null);

  useEffect(() => {
    loadRestaurantDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  const loadRestaurantDetails = () => {
    const cachedData = sessionStorage.getItem("restaurantData");

    if (cachedData) {
      try {
        const restaurantDetails = JSON.parse(cachedData);
        const images = restaurantDetails.images || (restaurantDetails.image ? [restaurantDetails.image] : []);

        setFormData({
          restaurant_name: restaurantDetails.restaurant_name || "",
          description: restaurantDetails.restaurant_description || "",
          images: images,
          isCatering: restaurantDetails.isCatering || false,
          isCorporate: restaurantDetails.isCorporate || false,
        });
        setLoading(false);
        sessionStorage.removeItem("restaurantData");
        return;
      } catch (err) {
        console.error("Failed to parse cached restaurant data:", err);
      }
    }

    fetchRestaurantDetails();
  };

  const fetchRestaurantDetails = async () => {
    setLoading(true);
    try {
      const restaurantDetails = await cateringService.getRestaurant(restaurantId);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("upload", file);

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_BASE_URL}/image-upload`, {
        method: "POST",
        body: formDataUpload,
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.status}`);
      }

      const imageUrl = JSON.parse(responseText);

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));

      setSuccess("Image uploaded successfully!");
      setTimeout(() => setSuccess(""), 3000);

      e.target.value = "";
    } catch (err: any) {
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

  const handleSaveProfile = () => {
    setError("");

    if (!formData.restaurant_name.trim()) {
      setError("Restaurant name is required");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    setShowConfirmModal(false);

    try {
      const updateData: Record<string, any> = {
        restaurant_name: formData.restaurant_name,
        restaurant_description: formData.description,
        images: formData.images,
      };

      await updateRestaurant(restaurantId, updateData);

      setSuccess("Restaurant settings updated successfully!");
      setTimeout(() => setSuccess(""), 3000);

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

  // Show menu if no section selected
  if (!activeSection) {
    return (
      <SettingsMenu
        onOpeningHours={() => router.push(`/restaurant/opening-hours/${restaurantId}`)}
        onProfile={() => setActiveSection("profile")}
        onInventory={() => setActiveSection("inventory")}
        onBack={() => router.push("/restaurant/dashboard")}
        showInventory={formData.isCatering || formData.isCorporate}
        error={error}
        success={success}
      />
    );
  }

  // Profile Editor
  if (activeSection === "profile") {
    return (
      <>
        <ProfileForm
          restaurantName={formData.restaurant_name}
          description={formData.description}
          images={formData.images}
          onNameChange={(value) => setFormData((prev) => ({ ...prev, restaurant_name: value }))}
          onDescriptionChange={(value) => setFormData((prev) => ({ ...prev, description: value }))}
          onImageUpload={handleImageUpload}
          onImageRemove={handleRemoveImage}
          onSave={handleSaveProfile}
          onCancel={() => setActiveSection(null)}
          uploadingImage={uploadingImage}
          saving={saving}
          error={error}
          success={success}
        />

        {showConfirmModal && (
          <ConfirmationModal
            title="Save Changes?"
            message="Your restaurant's name, description, and photos will be updated."
            onConfirm={confirmSave}
            onCancel={() => setShowConfirmModal(false)}
            saving={saving}
          />
        )}
      </>
    );
  }

  // Inventory Editor
  if (activeSection === "inventory") {
    return (
      <InventorySection
        restaurantId={restaurantId}
        token={typeof window !== "undefined" ? sessionStorage.getItem("restaurant_token") || "" : ""}
        isCatering={formData.isCatering}
        isCorporate={formData.isCorporate}
        onBack={() => setActiveSection(null)}
      />
    );
  }

  return null;
};

export default RestaurantSettingsPage;

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  Edit2,
} from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import {
  UpdateMenuItemDto,
  CategoryWithSubcategories,
  MenuItemStatus,
  MenuItemStyle,
  MenuItemAddon,
} from "@/types/catering.types";
import { ALLERGENS, PREP_TIMES, DIETARY_FILTERS } from "@/lib/constants/allergens";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

const EditMenuItemPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const itemId = params.itemId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isDiscount, setIsDiscount] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  const [image, setImage] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [status, setStatus] = useState<MenuItemStatus>(MenuItemStatus.ACTIVE);
  const [style, setStyle] = useState<MenuItemStyle>(MenuItemStyle.CARD);
  const [popular, setPopular] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedDietaryFilters, setSelectedDietaryFilters] = useState<string[]>([]);
  const [addons, setAddons] = useState<MenuItemAddon[]>([]);
  const [feedsPerUnit, setFeedsPerUnit] = useState<string>("");
  const [cateringQuantityUnit, setCateringQuantityUnit] = useState<string>("");

  // Group management state
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // Addon modal state
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [editingAddonIndex, setEditingAddonIndex] = useState<number | null>(
    null
  );
  const [currentAddon, setCurrentAddon] = useState<MenuItemAddon>({
    name: "",
    price: 0,
    allergens: [],
    dietaryRestrictions: [],
    groupTitle: "",
    selectionType: "multiple",
    isRequired: false,
  });

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [restaurant, menuResponse, cats] = await Promise.all([
        cateringService.getRestaurant(restaurantId),
        cateringService.getRestaurantMenuItems(restaurantId),
        cateringService.getCategories(),
      ]);

      // Get menuGroupSettings from restaurant
      let menuGroupSettings: Record<string, { displayOrder: number }> = {};
      if (
        restaurant.menuGroupSettings &&
        typeof restaurant.menuGroupSettings === "object"
      ) {
        menuGroupSettings = restaurant.menuGroupSettings;
      }

      // Handle both array and object responses for menu items
      let items: any[] = [];

      if (Array.isArray(menuResponse)) {
        items = menuResponse;
      } else if (menuResponse && typeof menuResponse === "object") {
        // Type guard to check if response has menuItems property
        const hasMenuItems = "menuItems" in menuResponse;
        if (hasMenuItems) {
          const responseWithMenuItems = menuResponse as {
            menuItems: any[];
          };
          if (Array.isArray(responseWithMenuItems.menuItems)) {
            items = responseWithMenuItems.menuItems;
          }
        }
      }

      const item = items.find((i) => i.id === itemId);

      if (!item) {
        throw new Error("Menu item not found");
      }

      setCategories(cats);

      // Extract unique groups from items
      const itemGroups = Array.from(
        new Set(items.map((item: any) => item.groupTitle).filter(Boolean))
      ) as string[];

      // Get groups from menuGroupSettings (preserve order)
      const settingsGroups = Object.keys(menuGroupSettings);

      // Append any itemGroups not in menuGroupSettings
      const allGroups = [
        ...settingsGroups,
        ...itemGroups.filter((g) => !settingsGroups.includes(g)),
      ];

      setExistingGroups(allGroups);
   
      // Populate form with item data
      setName(item.name || "");
      setDescription(item.description || "");
      setPrice(item.price.toString());
      setDiscountPrice(item.discountPrice?.toString() || "");
      setIsDiscount(item.isDiscount || false);
      setPrepTime(item.prepTime);
      setImage(item.image || "");
      setImagePreview(item.image || "");
      setIsAvailable(item.isAvailable);
      setStatus(item.status);
      setStyle(item.style || MenuItemStyle.CARD);
      setPopular(item.popular || false);
      setGroupTitle(item.groupTitle || "");


      // Extract subcategory IDs and their parent category IDs
      const subcategoryIds =
        item.subcategoryIds ||
        (item.subcategories && Array.isArray(item.subcategories)
          ? item.subcategories.map((sub: any) => sub.id)
          : item.subCategories && Array.isArray(item.subCategories)
          ? item.subCategories.map((sub: any) => sub.id)
          : []);

      // Extract parent category IDs from subcategories if available
      const categoryIdsFromSubcategories =
        item.subcategories && Array.isArray(item.subcategories)
          ? Array.from(new Set(item.subcategories.map((sub: any) => sub.categoryId).filter(Boolean)))
          : [];

      // Determine final category IDs (prioritize explicit categoryIds, then derive from subcategories, then from categories array)
      const categoryIds =
        item.categoryIds ||
        (categoryIdsFromSubcategories.length > 0
          ? categoryIdsFromSubcategories
          : item.categories && Array.isArray(item.categories)
          ? item.categories.map((cat: any) => cat.id)
          : []);

      setSelectedCategories(categoryIds);
      setSelectedSubcategories(subcategoryIds);

      setSelectedAllergens(item.allergens || []);
      setSelectedDietaryFilters(item.dietaryFilters || []);
      setAddons(item.addons || []);
      setFeedsPerUnit(item.feedsPerUnit ? String(item.feedsPerUnit) : "");
      setCateringQuantityUnit(item.cateringQuantityUnit ? String(item.cateringQuantityUnit) : "");
    } catch (err: any) {
      setError(err.message || "Failed to load menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      // Calculate next display order from the latest backend data
      const maxOrder = existingGroups.length;

      const currentSettings = existingGroups.reduce((acc, group, idx) => {
        acc[group] = { displayOrder: idx + 1 };
        return acc;
      }, {} as Record<string, { displayOrder: number }>);
      // Add the new group to existing settings
      const newGroupSettings = {
        ...currentSettings,
        [newGroupName.trim()]: { displayOrder: maxOrder + 1 },
      };

      // Update restaurant's group settings
      await cateringService.reorderGroups(restaurantId, newGroupSettings);

      // Update local state
      setExistingGroups((prev) => [...prev, newGroupName.trim()]);

      // Set as selected group
      setGroupTitle(newGroupName.trim());

      // Close modal and reset
      setShowNewGroupModal(false);
      setNewGroupName("");

      setSuccess("Group created successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to create group");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }


    // Validate file type
    if (!file.type.startsWith("image/")) {
      const errorMsg = "Please upload an image file";
      console.error("Invalid file type:", file.type);
      setError(errorMsg);
      return;
    }

    setUploadingImage(true);
    setError("");

    try {
      // Create preview for UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData for file upload
      const formDataUpload = new FormData();

      // IMPORTANT: Field name must be "upload" (singular) as per backend service configuration
      formDataUpload.append("upload", file);

      const uploadUrl = `${API_BASE_URL}${API_ENDPOINTS.IMAGE_UPLOAD}`;


      const response = await fetchWithAuth(uploadUrl, {
        method: "POST",
        body: formDataUpload,
      });

      // Get response text
      const responseText = await response.text();

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

      // Store the uploaded image URL
      setImage(imageUrl);

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
      // Clear preview on error
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    setImagePreview("");
  };

  const handleAddAllergen = (allergenValue: string) => {
    const current = selectedAllergens || [];
    if (!current.includes(allergenValue)) {
      setSelectedAllergens([...current, allergenValue]);
    }
  };

  const handleRemoveAllergen = (allergenValue: string) => {
    setSelectedAllergens(
      (selectedAllergens || []).filter((a) => a !== allergenValue)
    );
  };

  const handleAddDietaryFilter = (filterValue: string) => {
    const current = selectedDietaryFilters || [];
    if (!current.includes(filterValue)) {
      setSelectedDietaryFilters([...current, filterValue]);
    }
  };

  const handleRemoveDietaryFilter = (filterValue: string) => {
    setSelectedDietaryFilters(
      (selectedDietaryFilters || []).filter((f) => f !== filterValue)
    );
  };

  const handleAddAddon = () => {
    setCurrentAddon({
      name: "",
      price: 0,
      allergens: [],
      dietaryRestrictions: [],
      groupTitle: "",
      selectionType: "multiple",
      isRequired: false,
    });
    setEditingAddonIndex(null);
    setShowAddonModal(true);
  };

  const handleEditAddon = (index: number) => {
    setCurrentAddon({ ...addons[index] });
    setEditingAddonIndex(index);
    setShowAddonModal(true);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons((addons || []).filter((_, i) => i !== index));
  };

  const handleSaveAddon = () => {
    if (!currentAddon.name || currentAddon.price < 0) {
      return;
    }

    if (editingAddonIndex !== null) {
      // Update existing addon
      const updated = [...(addons || [])];
      updated[editingAddonIndex] = currentAddon;
      setAddons(updated);
    } else {
      // Add new addon
      setAddons([...(addons || []), currentAddon]);
    }

    setShowAddonModal(false);
    setEditingAddonIndex(null);
  };

  const handleCloseAddonModal = () => {
    setShowAddonModal(false);
    setEditingAddonIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Use the uploaded image URL (already uploaded via handleImageChange)
      const imageUrl = image || "";

      const updateData: UpdateMenuItemDto = {
        name,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        isDiscount,
        prepTime,
        image: imageUrl,
        isAvailable,
        status,
        style,
        popular,
        groupTitle,
        categoryIds: selectedCategories || [],
        subcategoryIds: selectedSubcategories || [],
        allergens: selectedAllergens || [],
        dietaryFilters: selectedDietaryFilters || [],
        addons: addons && addons.length > 0 ? addons : null,
        ...(feedsPerUnit ? { feedsPerUnit: parseInt(feedsPerUnit) } : {}),
        ...(cateringQuantityUnit ? { cateringQuantityUnit: parseInt(cateringQuantityUnit) } : {}),
      };

      await cateringService.updateMenuItem(itemId, updateData);
      setSuccess("Menu item updated successfully!");
      setTimeout(() => {
        router.push(`/restaurant/menu/${restaurantId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update menu item");
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
            onClick={() => router.push(`/restaurant/menu/${restaurantId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Menu Item</h1>
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
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg p-6 space-y-6"
        >
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Basic Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                // maxLength={200}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                {(description || "").length}/200 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Group/Category Title
              </label>
              <div className="flex gap-2">
                <select
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">Select a group...</option>
                  {existingGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus size={20} />
                  New Group
                </button>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (£) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Price (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feeds Per Unit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={feedsPerUnit}
                  onChange={(e) => setFeedsPerUnit(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of people this item feeds (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catering Quantity Unit
                </label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={cateringQuantityUnit}
                  onChange={(e) => setCateringQuantityUnit(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Catering quantity unit size (optional)
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDiscount"
                checked={isDiscount}
                onChange={(e) => setIsDiscount(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isDiscount"
                className="ml-2 text-sm text-gray-700"
              >
                Apply discount pricing
              </label>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Image
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Image
              </label>
              {imagePreview && (
                <div className="mb-4 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              <label className={`inline-flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors ${
                uploadingImage
                  ? "bg-gray-100 text-gray-700 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
              }`}>
                {uploadingImage ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Upload New Image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Max 5MB (JPG, PNG, WebP)
              </p>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Categories
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories?.includes(cat.id) || false}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([
                          ...(selectedCategories || []),
                          cat.id,
                        ]);
                      } else {
                        setSelectedCategories(
                          (selectedCategories || []).filter(
                            (id) => id !== cat.id
                          )
                        );
                        // Remove subcategories of this category
                        const subcatIds = cat.subcategories?.map(sub => sub.id) || [];
                        setSelectedSubcategories(
                          (selectedSubcategories || []).filter(
                            (id) => !subcatIds.includes(id)
                          )
                        );
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Subcategories */}
          {selectedCategories.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
                Subcategories
              </h2>

              {categories
                .filter((cat) => selectedCategories.includes(cat.id))
                .map((cat) => (
                  <div key={cat.id} className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">
                      {cat.name}
                    </h3>
                    {cat.subcategories && cat.subcategories.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {cat.subcategories.map((sub) => (
                          <label
                            key={sub.id}
                            className="flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={
                                selectedSubcategories?.includes(sub.id) || false
                              }
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubcategories([
                                    ...(selectedSubcategories || []),
                                    sub.id,
                                  ]);
                                } else {
                                  setSelectedSubcategories(
                                    (selectedSubcategories || []).filter(
                                      (id) => id !== sub.id
                                    )
                                  );
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {sub.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No subcategories available
                      </p>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Allergens */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Allergens
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Allergens
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddAllergen(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select an allergen...</option>
                {ALLERGENS.filter(
                  (a) => !selectedAllergens.includes(a.value)
                ).map((allergen) => (
                  <option key={allergen.value} value={allergen.value}>
                    {allergen.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedAllergens && selectedAllergens.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAllergens.map((allergenValue) => {
                  const allergen = ALLERGENS.find(
                    (a) => a.value === allergenValue
                  );
                  return (
                    <span
                      key={allergenValue}
                      className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                    >
                      {allergen?.label || allergenValue}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergen(allergenValue)}
                        className="hover:bg-red-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dietary Filters */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Dietary Restrictions
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Dietary Options
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddDietaryFilter(e.target.value);
                    e.target.value = "";
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Select a dietary option...</option>
                {DIETARY_FILTERS.filter(
                  (f) => !(selectedDietaryFilters || []).includes(f.value)
                ).map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDietaryFilters && selectedDietaryFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedDietaryFilters.map((filterValue) => {
                  const filter = DIETARY_FILTERS.find(
                    (f) => f.value === filterValue
                  );
                  return (
                    <span
                      key={filterValue}
                      className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                    >
                      {filter?.label || filterValue}
                      <button
                        type="button"
                        onClick={() => handleRemoveDietaryFilter(filterValue)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Addons */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-bold text-gray-900">Add-ons</h2>
              <button
                type="button"
                onClick={handleAddAddon}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus size={16} />
                Add Option
              </button>
            </div>

            {(() => {
              // Group addons by groupTitle
              const grouped: Record<string, MenuItemAddon[]> = {};
              (addons || []).forEach((addon, index) => {
                const group = addon.groupTitle || "Ungrouped";
                if (!grouped[group]) {
                  grouped[group] = [];
                }
                grouped[group].push({ ...addon, index } as any);
              });

              return Object.keys(grouped).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(grouped).map(([groupTitle, groupAddons]) => (
                    <div
                      key={groupTitle}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-3">
                        {groupTitle}
                      </h3>
                      <div className="space-y-2">
                        {groupAddons.map((addon: any) => (
                          <div
                            key={addon.index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {addon.name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    addon.isRequired
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-200 text-gray-700"
                                  }`}
                                >
                                  {addon.isRequired ? "Required" : "Optional"}
                                </span>
                                {addon.selectionType && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                                    {addon.selectionType === "single"
                                      ? "Single"
                                      : "Multiple"}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-600">
                                £{addon.price.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAddon(addon.index)}
                                className="text-blue-600 hover:text-blue-700 p-1"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveAddon(addon.index)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No add-ons yet. Click "Add Option" to create one.
                </p>
              );
            })()}
          </div>

          {/* Settings */}
          {/* <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time *
                </label>
                <select
                  value={prepTime}
                  onChange={(e) => setPrepTime(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {PREP_TIMES.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as MenuItemStatus)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {Object.values(MenuItemStatus).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Style *
                </label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value as MenuItemStyle)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                >
                  {Object.values(MenuItemStyle).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Item is available
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={(e) => setPopular(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Mark as popular item
                </span>
              </label>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push(`/restaurant/menu/${restaurantId}`)}
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>

        {/* Addon Detail Modal */}
        {showAddonModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingAddonIndex !== null ? "Edit Add-on" : "New Add-on"}
                  </h3>
                  <button
                    onClick={handleCloseAddonModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={currentAddon.name}
                      onChange={(e) =>
                        setCurrentAddon({
                          ...currentAddon,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Extra Cheese"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={currentAddon.price}
                      onChange={(e) =>
                        setCurrentAddon({
                          ...currentAddon,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  {/* Group Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Group Title
                    </label>
                    <input
                      type="text"
                      value={currentAddon.groupTitle || ""}
                      onChange={(e) =>
                        setCurrentAddon({
                          ...currentAddon,
                          groupTitle: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Toppings, Size Options"
                    />
                  </div>

                  {/* Selection Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Selection Type
                    </label>
                    <select
                      value={currentAddon.selectionType || "multiple"}
                      onChange={(e) =>
                        setCurrentAddon({
                          ...currentAddon,
                          selectionType: e.target.value as
                            | "single"
                            | "multiple",
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="multiple">Multiple Selection</option>
                      <option value="single">Single Selection</option>
                    </select>
                  </div>

                  {/* Required */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentAddon.isRequired || false}
                        onChange={(e) =>
                          setCurrentAddon({
                            ...currentAddon,
                            isRequired: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Required
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-6">
                      Customer must select this add-on
                    </p>
                  </div>

                  {/* Allergens */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Allergens
                    </label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value &&
                          !(currentAddon.allergens || []).includes(value)
                        ) {
                          setCurrentAddon({
                            ...currentAddon,
                            allergens: [
                              ...(currentAddon.allergens || []),
                              value,
                            ],
                          });
                        }
                        e.target.value = "";
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Select allergen...</option>
                      {ALLERGENS.map((allergen) => (
                        <option key={allergen.value} value={allergen.value}>
                          {allergen.label}
                        </option>
                      ))}
                    </select>

                    {currentAddon.allergens &&
                      currentAddon.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentAddon.allergens.map((allergenValue) => {
                            const allergen = ALLERGENS.find(
                              (a) => a.value === allergenValue
                            );
                            return (
                              <span
                                key={allergenValue}
                                className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
                              >
                                {allergen?.label || allergenValue}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCurrentAddon({
                                      ...currentAddon,
                                      allergens: currentAddon.allergens?.filter(
                                        (a) => a !== allergenValue
                                      ),
                                    })
                                  }
                                  className="hover:bg-red-200 rounded-full p-0.5"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dietary Restrictions
                    </label>
                    <select
                      onChange={(e) => {
                        const value = e.target.value;
                        if (
                          value &&
                          !(currentAddon.dietaryRestrictions || []).includes(value)
                        ) {
                          setCurrentAddon({
                            ...currentAddon,
                            dietaryRestrictions: [
                              ...(currentAddon.dietaryRestrictions || []),
                              value,
                            ],
                          });
                        }
                        e.target.value = "";
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    >
                      <option value="">Select dietary option...</option>
                      {DIETARY_FILTERS.filter(
                        (f) => !(currentAddon.dietaryRestrictions || []).includes(f.value)
                      ).map((filter) => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                      ))}
                    </select>

                    {currentAddon.dietaryRestrictions &&
                      currentAddon.dietaryRestrictions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentAddon.dietaryRestrictions.map((filterValue) => {
                            const filter = DIETARY_FILTERS.find(
                              (f) => f.value === filterValue
                            );
                            return (
                              <span
                                key={filterValue}
                                className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                              >
                                {filter?.label || filterValue}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCurrentAddon({
                                      ...currentAddon,
                                      dietaryRestrictions: currentAddon.dietaryRestrictions?.filter(
                                        (f) => f !== filterValue
                                      ),
                                    })
                                  }
                                  className="hover:bg-green-200 rounded-full p-0.5"
                                >
                                  <X size={14} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseAddonModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddon}
                    disabled={!currentAddon.name || currentAddon.price < 0}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {editingAddonIndex !== null ? "Save Changes" : "Add Add-on"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New Group Modal */}
        {showNewGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Create New Group
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Appetizers, Mains, Desserts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleCreateNewGroup();
                    }
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewGroupModal(false);
                    setNewGroupName("");
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNewGroup}
                  disabled={!newGroupName.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Group
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditMenuItemPage;

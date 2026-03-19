"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  ArrowLeft,
  Save,
  X,
  Plus,
  Upload,
  AlertCircle,
  Edit2,
  ChevronDown,
} from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import {
  CreateMenuItemDto,
  CategoryWithSubcategories,
  MenuItemStatus,
  MenuItemStyle,
  MenuItemAddon,
  MenuItemAddonGroup,
  MenuItemAddonItem,
} from "@/types/catering.types";
import { ALLERGENS, PREP_TIMES, DIETARY_FILTERS } from "@/lib/constants/allergens";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

/** Group flat MenuItemAddon[] back into AddonGroup[] for API */
function groupAddonsForApi(addons: MenuItemAddon[]): MenuItemAddonGroup[] {
  if (!addons || addons.length === 0) return [];
  const groups: Record<string, MenuItemAddonGroup> = {};
  for (const addon of addons) {
    const title = addon.groupTitle || "Other";
    if (!groups[title]) {
      const selType = addon.selectionType === "multiple" ? "multiple_no_repeat" : (addon.selectionType || "multiple_no_repeat");
      groups[title] = {
        groupTitle: title,
        selectionType: selType as MenuItemAddonGroup["selectionType"],
        isRequired: addon.isRequired || false,
        minSelections: addon.minSelections,
        maxSelections: addon.maxSelections,
        items: [],
      };
    }
    groups[title].items.push({
      name: addon.name,
      price: addon.price,
      allergens: addon.allergens || [],
      dietaryRestrictions: addon.dietaryRestrictions,
      isDefault: addon.isDefault,
      displayOrder: addon.displayOrder,
    });
  }
  return Object.values(groups);
}

const NewMenuItemPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

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
  // const [feedsPerUnit, setFeedsPerUnit] = useState<string>("");
  const [deliveryPortionSize, setDeliveryPortionSize] = useState<string>("");
  const [minOrderQuantity, setMinOrderQuantity] = useState<string>("1");
  const [vatApplicable, setVatApplicable] = useState(false);

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
    selectionType: "multiple_no_repeat",
    isRequired: false,
    isDefault: false,
    displayOrder: 0,
  });

  // Addon modal section collapse state
  const [addonSectionOpen, setAddonSectionOpen] = useState({
    basicInfo: true,
    selectionRules: true,
    allergensDietary: false,
  });

  // Addon table redesign state
  const [expandedAddonIndex, setExpandedAddonIndex] = useState<number | null>(null);
  const [applyToAllOpen, setApplyToAllOpen] = useState<string | null>(null);
  const [editingGroupTitle, setEditingGroupTitle] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    fetchExistingGroups();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const cats = await cateringService.getCategories();
      setCategories(cats);
    } catch (err: any) {
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingGroups = async () => {
    try {
      // Fetch restaurant data to get menuGroupSettings
      const restaurant = await cateringService.getRestaurant(restaurantId);

      let menuGroupSettings: Record<string, { displayOrder: number }> = {};
      if (
        restaurant.menuGroupSettings &&
        typeof restaurant.menuGroupSettings === "object"
      ) {
        menuGroupSettings = restaurant.menuGroupSettings;
      }

      // Fetch menu items to get any additional groups
      const menuItemsResponse = await cateringService.getRestaurantMenuItems(
        restaurantId
      );

      let items: any[] = [];
      if (Array.isArray(menuItemsResponse)) {
        items = menuItemsResponse;
      } else if (
        menuItemsResponse &&
        typeof menuItemsResponse === "object" &&
        "menuItems" in menuItemsResponse
      ) {
        const responseWithMenuItems = menuItemsResponse as { menuItems: any[] };
        if (Array.isArray(responseWithMenuItems.menuItems)) {
          items = responseWithMenuItems.menuItems;
        }
      }

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
    } catch (err: any) {
      console.error("Failed to load groups:", err);
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
    if (!selectedAllergens.includes(allergenValue)) {
      setSelectedAllergens([...selectedAllergens, allergenValue]);
    }
  };

  const handleRemoveAllergen = (allergenValue: string) => {
    setSelectedAllergens(selectedAllergens.filter((a) => a !== allergenValue));
  };

  const handleAddDietaryFilter = (filterValue: string) => {
    if (!selectedDietaryFilters.includes(filterValue)) {
      setSelectedDietaryFilters([...selectedDietaryFilters, filterValue]);
    }
  };

  const handleRemoveDietaryFilter = (filterValue: string) => {
    setSelectedDietaryFilters(selectedDietaryFilters.filter((f) => f !== filterValue));
  };

  const handleAddAddon = () => {
    setCurrentAddon({
      name: "",
      price: 0,
      allergens: [],
      dietaryRestrictions: [],
      groupTitle: "",
      selectionType: "multiple_no_repeat",
      isRequired: false,
      isDefault: false,
      displayOrder: undefined,
    });
    setEditingAddonIndex(null);
    setAddonSectionOpen({ basicInfo: true, selectionRules: true, allergensDietary: false });
    setShowAddonModal(true);
  };

  const handleEditAddon = (index: number) => {
    const addon = { ...addons[index] };
    // Normalize legacy 'multiple' → 'multiple_no_repeat'
    if (addon.selectionType === "multiple") {
      addon.selectionType = "multiple_no_repeat";
    }
    setCurrentAddon(addon);
    setEditingAddonIndex(index);
    // If allergens/dietary data exists, open that section
    const hasAllergenData = (addon.allergens && addon.allergens.length > 0) || (addon.dietaryRestrictions && addon.dietaryRestrictions.length > 0);
    setAddonSectionOpen({ basicInfo: true, selectionRules: true, allergensDietary: !!hasAllergenData });
    setShowAddonModal(true);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons(addons.filter((_, i) => i !== index));
  };

  const handleSaveAddon = () => {
    if (!currentAddon.name || currentAddon.price < 0) {
      return;
    }

    if (editingAddonIndex !== null) {
      // Update existing addon
      const updated = [...addons];
      updated[editingAddonIndex] = currentAddon;
      setAddons(updated);
    } else {
      // Add new addon
      setAddons([...addons, currentAddon]);
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
      // Validate required fields
      if (!name || !price) {
        throw new Error("Please fill in all required fields");
      }

      // Use the uploaded image URL (already uploaded via handleImageChange)
      const imageUrl = image || "";

      const createData: CreateMenuItemDto = {
        restaurantId,
        name,
        description,
        price: parseFloat(price),
        discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
        isDiscount,
        prepTime,
        image: imageUrl || "",
        isAvailable,
        status,
        style,
        popular,
        groupTitle,
        categoryIds: selectedCategories || [],
        subcategoryIds: selectedSubcategories || [],
        allergens: selectedAllergens || [],
        dietaryFilters: selectedDietaryFilters || [],
        addons: addons && addons.length > 0 ? groupAddonsForApi(addons) : null,
        // ...(feedsPerUnit ? { feedsPerUnit: parseInt(feedsPerUnit) } : {}),
        ...(deliveryPortionSize ? { deliveryPortionSize } : {}),
        minOrderQuantity: parseInt(minOrderQuantity) || 1,
        vatApplicable,
      };

      await cateringService.createMenuItem(createData);
      setSuccess("Menu item created successfully!");
      setTimeout(() => {
        router.push(`/restaurant/menu/${restaurantId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create menu item");
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
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Menu Item
          </h1>
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
                {description.length}/200 characters
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
                  Delivery Portion Size
                </label>
                <input
                  type="text"
                  value={deliveryPortionSize}
                  onChange={(e) => setDeliveryPortionSize(e.target.value)}
                  placeholder="e.g., Serves 2-3, 500g, Large"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Portion size for delivery orders (optional)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 group relative">
                  Min Order Quantity
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 text-gray-500 text-[10px] font-bold cursor-help">?</span>
                  <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                    The minimum number of portions a customer must order for this item. When a customer adds this item to their order, the quantity will automatically start at this number and cannot go below it. For example, setting this to 10 means customers must order at least 10 portions of this item. Leave as 1 for no minimum.
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={minOrderQuantity}
                  onChange={(e) => setMinOrderQuantity(e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum portions per order for this item
                </p>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feeds Per Unit
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={feedsPerUnit}
                  onChange={(e) => setFeedsPerUnit(e.target.value)}
                  placeholder="Optional"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Number of people this item feeds (optional)
                </p>
              </div> */}
            </div>

            <div className="flex items-center gap-6">
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vatApplicable"
                  checked={vatApplicable}
                  onChange={(e) => setVatApplicable(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="vatApplicable"
                  className="ml-2 text-sm text-gray-700"
                >
                  VAT applicable
                </label>
              </div>
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
                    Upload Image
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
                    checked={selectedCategories.includes(cat.id)}
                    onChange={(e) => {
                      const subcatIds = cat.subcategories?.map(sub => sub.id) || [];
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, cat.id]);
                        // Auto-select all subcategories of this category
                        setSelectedSubcategories([
                          ...selectedSubcategories.filter(
                            (id) => !subcatIds.includes(id)
                          ),
                          ...subcatIds,
                        ]);
                      } else {
                        setSelectedCategories(
                          selectedCategories.filter((id) => id !== cat.id)
                        );
                        // Remove subcategories of this category
                        setSelectedSubcategories(
                          selectedSubcategories.filter(
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
                              checked={selectedSubcategories.includes(sub.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSubcategories([
                                    ...selectedSubcategories,
                                    sub.id,
                                  ]);
                                } else {
                                  setSelectedSubcategories(
                                    selectedSubcategories.filter(
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

            {selectedAllergens.length > 0 && (
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
                  (f) => !selectedDietaryFilters.includes(f.value)
                ).map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDietaryFilters.length > 0 && (
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
                New Add-on
              </button>
            </div>

            {/* Key/Filter Bar */}
            <div className="flex flex-wrap gap-2">
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Selection
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-52 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                  How customers choose this addon: Pick One, No repeat, or Repeat.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Required
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                  Whether the customer must select this addon.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Default
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                  Pre-selected when the customer opens the item.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limits
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-52 p-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed">
                  Min/max selection limits for the group (e.g. 1-3).
                </span>
              </div>
            </div>

            {(() => {
              // Normalize selectionType: map legacy 'multiple' to 'multiple_no_repeat'
              const normalizeSelectionType = (type: string | undefined): "single" | "multiple_no_repeat" | "multiple_repeat" => {
                if (type === "multiple") return "multiple_no_repeat";
                if (type === "single" || type === "multiple_no_repeat" || type === "multiple_repeat") return type;
                return "multiple_no_repeat";
              };

              const getSelectionLabel = (type: string | undefined) => {
                const normalized = normalizeSelectionType(type);
                if (normalized === "single") return "Pick One";
                if (normalized === "multiple_no_repeat") return "No repeat";
                return "Repeat";
              };

              const getSelectionBadgeClass = (type: string | undefined) => {
                const normalized = normalizeSelectionType(type);
                if (normalized === "single") return "bg-green-100 text-green-800";
                if (normalized === "multiple_no_repeat") return "bg-blue-100 text-blue-800";
                return "bg-purple-100 text-purple-800";
              };

              const getSelectionTooltip = (type: string | undefined) => {
                const normalized = normalizeSelectionType(type);
                if (normalized === "single") return "The customer chooses one option from this group.";
                if (normalized === "multiple_no_repeat") return "The customer can select this once, alongside others in the group.";
                return "The customer can add this more than once. E.g. Extra Cheese \u00d73.";
              };

              // Group addons by groupTitle
              const grouped: Record<string, (MenuItemAddon & { _idx: number })[]> = {};
              (addons || []).forEach((addon, index) => {
                const group = addon.groupTitle || "Other";
                if (!grouped[group]) {
                  grouped[group] = [];
                }
                grouped[group].push({ ...addon, _idx: index });
              });

              // Sort groups by displayOrder of first addon
              const sortedGroups = Object.entries(grouped).sort(([, a], [, b]) => {
                const aOrder = a[0]?.displayOrder ?? 999;
                const bOrder = b[0]?.displayOrder ?? 999;
                return aOrder - bOrder;
              });

              return sortedGroups.length > 0 ? (
                <div className="space-y-6">
                  {sortedGroups.map(([grpTitle, groupAddons]) => {
                    const firstAddon = groupAddons[0];
                    const groupMin = firstAddon?.minSelections;
                    const groupMax = firstAddon?.maxSelections;
                    const handleRenameGroup = (newTitle: string) => {
                      setAddons((prev) =>
                        (prev || []).map((addon) =>
                          (addon.groupTitle || "Other") === grpTitle
                            ? { ...addon, groupTitle: newTitle }
                            : addon
                        )
                      );
                    };

                    const handleDeleteGroup = () => {
                      setAddons((prev) =>
                        (prev || []).filter(
                          (addon) => (addon.groupTitle || "Other") !== grpTitle
                        )
                      );
                    };

                    const handleApplySelectionType = (selType: "single" | "multiple_no_repeat" | "multiple_repeat") => {
                      setAddons((prev) =>
                        (prev || []).map((addon) =>
                          (addon.groupTitle || "Other") === grpTitle
                            ? { ...addon, selectionType: selType }
                            : addon
                        )
                      );
                    };

                    const handleApplyRequired = (required: boolean) => {
                      setAddons((prev) =>
                        (prev || []).map((addon) =>
                          (addon.groupTitle || "Other") === grpTitle
                            ? { ...addon, isRequired: required }
                            : addon
                        )
                      );
                    };

                    return (
                      <div
                        key={grpTitle}
                        className="border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {/* Group Header */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
                          <span className="text-gray-400 cursor-default select-none" title="Drag to reorder (visual only)">&#x2807;</span>
                          <input
                            type="text"
                            value={editingGroupTitle[grpTitle] !== undefined ? editingGroupTitle[grpTitle] : grpTitle}
                            onChange={(e) =>
                              setEditingGroupTitle((prev) => ({ ...prev, [grpTitle]: e.target.value }))
                            }
                            onBlur={() => {
                              const newTitle = (editingGroupTitle[grpTitle] ?? "").trim();
                              if (newTitle && newTitle !== grpTitle) {
                                handleRenameGroup(newTitle);
                              }
                              setEditingGroupTitle((prev) => {
                                const next = { ...prev };
                                delete next[grpTitle];
                                return next;
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                            }}
                            className="font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none px-1 py-0.5 text-sm"
                          />
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {groupAddons.length}
                          </span>
                          {/* Group-level selection type badge */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const types: Array<'single' | 'multiple_no_repeat' | 'multiple_repeat'> = ['single', 'multiple_no_repeat', 'multiple_repeat'];
                              const current = normalizeSelectionType(firstAddon?.selectionType);
                              const nextIdx = (types.indexOf(current) + 1) % types.length;
                              handleApplySelectionType(types[nextIdx]);
                            }}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${getSelectionBadgeClass(firstAddon?.selectionType)}`}
                            title={getSelectionTooltip(firstAddon?.selectionType) + " Click to change."}
                          >
                            {getSelectionLabel(firstAddon?.selectionType)}
                          </button>
                          {/* Group-level required toggle */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyRequired(!firstAddon?.isRequired);
                            }}
                            className={`w-4 h-4 rounded-full border-2 transition-colors ${
                              firstAddon?.isRequired
                                ? "bg-amber-500 border-amber-500"
                                : "bg-gray-200 border-gray-300"
                            }`}
                            title={firstAddon?.isRequired ? "Required — click to make optional" : "Optional — click to make required"}
                          />
                          <div className="ml-auto flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleDeleteGroup}
                              className="text-xs text-red-600 hover:text-red-700 border border-red-200 rounded-lg px-2.5 py-1 hover:bg-red-50 transition-colors"
                            >
                              Delete Group
                            </button>
                          </div>
                        </div>

                        {/* Column Headers */}
                        <div
                          className="grid items-center px-4 py-2 border-b border-gray-100 bg-gray-50/50"
                          style={{ gridTemplateColumns: "28px 1fr 72px 46px 56px 46px" }}
                        >
                          <span />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Name</span>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Price</span>
                          <span className="group/hdr2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center cursor-help">
                            <span className="group-hover/hdr2:hidden transition-opacity">Def.</span>
                            <span className="hidden group-hover/hdr2:inline text-gray-500 transition-opacity">Default</span>
                          </span>
                          <span className="group/hdr3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center cursor-help">
                            <span className="group-hover/hdr3:hidden transition-opacity">Limits</span>
                            <span className="hidden group-hover/hdr3:inline text-gray-500 transition-opacity">Min/Max</span>
                          </span>
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-center">Edit</span>
                        </div>

                        {/* Addon Rows */}
                        <div>
                          {groupAddons.map((addon) => {
                            const addonIdx = addon._idx;
                            const isExpanded = expandedAddonIndex === addonIdx;
                            const limitsStr = (groupMin != null || groupMax != null)
                              ? `${groupMin ?? 0}\u2013${groupMax ?? "\u221e"}`
                              : null;

                            return (
                              <div key={addonIdx}>
                                {/* Row */}
                                <div
                                  className="grid items-center px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
                                  style={{ gridTemplateColumns: "28px 1fr 72px 46px 56px 46px" }}
                                >
                                  <span className="text-gray-300 select-none">&#x2807;</span>
                                  <span className="font-medium text-gray-900 text-sm truncate pr-2">{addon.name}</span>
                                  <span className="text-sm text-gray-700">
                                    {addon.price > 0 ? `+\u00a3${addon.price.toFixed(2)}` : "\u00a30.00"}
                                  </span>
                                  {/* Default toggle */}
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setAddons((prev) =>
                                          (prev || []).map((a, i) =>
                                            i === addonIdx ? { ...a, isDefault: !a.isDefault } : a
                                          )
                                        );
                                      }}
                                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                                        addon.isDefault
                                          ? "bg-purple-500 border-purple-500"
                                          : "bg-gray-200 border-gray-300"
                                      }`}
                                      title={addon.isDefault ? "Default (click to remove)" : "Not default (click to set)"}
                                    />
                                  </div>
                                  {/* Limits */}
                                  <div className="flex justify-center">
                                    {limitsStr ? (
                                      <span className="text-xs font-medium text-red-600">{limitsStr}</span>
                                    ) : (
                                      <span className="text-xs text-gray-400">&mdash;</span>
                                    )}
                                  </div>
                                  {/* Edit button */}
                                  <div className="flex justify-center">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditAddon(addonIdx);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 p-1"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                          {/* Add addon to this group */}
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentAddon({
                                name: "",
                                price: 0,
                                allergens: [],
                                dietaryRestrictions: [],
                                groupTitle: grpTitle === "Other" ? "" : grpTitle,
                                selectionType: normalizeSelectionType(firstAddon?.selectionType),
                                isRequired: firstAddon?.isRequired || false,
                                isDefault: false,
                                displayOrder: 0,
                              } as any);
                              setEditingAddonIndex(null);
                              setShowAddonModal(true);
                            }}
                            className="w-full py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors border-t border-gray-100"
                          >
                            + Add add-on to this group
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No add-ons yet. Click &quot;New Add-on&quot; to create one.
                </p>
              );
            })()}
          </div>

       

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
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Create Menu Item
                </>
              )}
            </button>
          </div>
        </form>

        {/* Addon Detail Modal */}
        {showAddonModal && (() => {
          const groupAddonsCount = currentAddon.groupTitle
            ? (addons || []).filter(
                (a, i) => a.groupTitle === currentAddon.groupTitle && i !== editingAddonIndex
              ).length + 1
            : 1;
          const selectionLabel =
            currentAddon.selectionType === "single"
              ? "Pick One"
              : currentAddon.selectionType === "multiple_repeat"
              ? "Pick Many (can repeat)"
              : "Pick Many (no repeats)";

          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 animate-[fadeIn_0.2s_ease-out]"
              onClick={handleCloseAddonModal}
            />
            {/* Modal */}
            <div
              className="relative bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col animate-[modalIn_0.25s_ease-out]"
              style={{ animationFillMode: "both" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingAddonIndex !== null ? "Edit Add-on" : "New Add-on"}
                </h3>
                <button
                  onClick={handleCloseAddonModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">

                {/* ── Section 1: Basic Info ── */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAddonSectionOpen(s => ({ ...s, basicInfo: !s.basicInfo }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 text-sm inline-block transition-transform duration-300"
                        style={{ transform: addonSectionOpen.basicInfo ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        &#9662;
                      </span>
                      <span className="text-sm font-semibold text-gray-900">Basic Info</span>
                    </div>
                    {/* Summary pills */}
                    <div
                      className="flex items-center gap-2 transition-opacity duration-200"
                      style={{ opacity: addonSectionOpen.basicInfo ? 0.4 : 1 }}
                    >
                      {currentAddon.name && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                          {currentAddon.name}
                        </span>
                      )}
                      {currentAddon.price > 0 && (
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                          +&pound;{currentAddon.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-[350ms]"
                    style={{
                      gridTemplateRows: addonSectionOpen.basicInfo ? "1fr" : "0fr",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 py-4 space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                          <input
                            type="text"
                            value={currentAddon.name}
                            onChange={(e) => setCurrentAddon({ ...currentAddon, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="e.g., Extra Cheese"
                          />
                        </div>
                        {/* Price */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price (&pound;)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={currentAddon.price}
                            onChange={(e) => setCurrentAddon({ ...currentAddon, price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                          />
                        </div>
                        {/* Group */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                          <input
                            type="text"
                            value={currentAddon.groupTitle || ""}
                            onChange={(e) => setCurrentAddon({ ...currentAddon, groupTitle: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="e.g., Toppings, Size Options"
                          />
                        </div>
                        {/* Display Order */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                          <input
                            type="number"
                            min="0"
                            value={currentAddon.displayOrder ?? ""}
                            onChange={(e) => setCurrentAddon({ ...currentAddon, displayOrder: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder="Optional"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Selection Rules ── */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAddonSectionOpen(s => ({ ...s, selectionRules: !s.selectionRules }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 text-sm inline-block transition-transform duration-300"
                        style={{ transform: addonSectionOpen.selectionRules ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        &#9662;
                      </span>
                      <span className="text-sm font-semibold text-gray-900">Selection Rules</span>
                    </div>
                    {/* Summary pills */}
                    <div
                      className="flex items-center gap-2 transition-opacity duration-200"
                      style={{ opacity: addonSectionOpen.selectionRules ? 0.4 : 1 }}
                    >
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {selectionLabel}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${currentAddon.isRequired ? "bg-pink-100 text-pink-700" : "bg-gray-200 text-gray-600"}`}>
                        {currentAddon.isRequired ? "Required" : "Optional"}
                      </span>
                    </div>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-[350ms]"
                    style={{
                      gridTemplateRows: addonSectionOpen.selectionRules ? "1fr" : "0fr",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 py-4 space-y-4">
                        {/* Selection type radio cards */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selection Type</label>
                          <div className="space-y-2">
                            {([
                              { value: "single" as const, label: "Pick One", desc: "The customer chooses one option from this group." },
                              { value: "multiple_no_repeat" as const, label: "Pick Many (no repeats)", desc: "The customer can select this once, alongside others in the group." },
                              { value: "multiple_repeat" as const, label: "Pick Many (can repeat)", desc: "The customer can add this more than once. E.g. Extra Cheese \u00d73." },
                            ]).map((opt) => {
                              const isSelected = (currentAddon.selectionType || "multiple_no_repeat") === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() => setCurrentAddon({ ...currentAddon, selectionType: opt.value })}
                                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                                      : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30"
                                  }`}
                                >
                                  <div className="text-sm font-medium text-gray-900">{opt.label}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Required toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Required</div>
                            <div className="text-xs text-gray-500">Customer must select from this group</div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={currentAddon.isRequired || false}
                            onClick={() => setCurrentAddon({ ...currentAddon, isRequired: !currentAddon.isRequired })}
                            className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{ backgroundColor: currentAddon.isRequired ? "#fa43ad" : "#d1d5db", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                          >
                            <span
                              className="pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ring-0 transition-[left] duration-[250ms]"
                              style={{
                                left: currentAddon.isRequired ? "calc(100% - 1.375rem)" : "0.125rem",
                                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            />
                          </button>
                        </div>

                        {/* Default toggle */}
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-700">Default</div>
                            <div className="text-xs text-gray-500">Pre-selected when customer opens the menu</div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={currentAddon.isDefault || false}
                            onClick={() => setCurrentAddon({ ...currentAddon, isDefault: !currentAddon.isDefault })}
                            className="relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-250 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            style={{ backgroundColor: currentAddon.isDefault ? "#fa43ad" : "#d1d5db", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
                          >
                            <span
                              className="pointer-events-none absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ring-0 transition-[left] duration-[250ms]"
                              style={{
                                left: currentAddon.isDefault ? "calc(100% - 1.375rem)" : "0.125rem",
                                transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                              }}
                            />
                          </button>
                        </div>

                        {/* Min / Max selections */}
                        <div className="mb-2">
                          <p className="text-sm font-medium text-gray-700 mb-0.5">How many can the customer choose?</p>
                          <p className="text-xs text-gray-400 mb-2">Set a minimum and maximum number of choices. Leave empty for no limit.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">At least</label>
                            <input
                              type="number"
                              min="0"
                              value={currentAddon.minSelections ?? ""}
                              onChange={(e) => setCurrentAddon({ ...currentAddon, minSelections: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">At most</label>
                            <input
                              type="number"
                              min="0"
                              value={currentAddon.maxSelections ?? ""}
                              onChange={(e) => setCurrentAddon({ ...currentAddon, maxSelections: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                              placeholder="No limit"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 -mt-2">
                          This group has {groupAddonsCount} options. Example: &quot;At least 1, at most 3&quot; means the customer picks between 1 and 3.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Allergens & Dietary ── */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAddonSectionOpen(s => ({ ...s, allergensDietary: !s.allergensDietary }))}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="text-gray-500 text-sm inline-block transition-transform duration-300"
                        style={{ transform: addonSectionOpen.allergensDietary ? "rotate(0deg)" : "rotate(-90deg)" }}
                      >
                        &#9662;
                      </span>
                      <span className="text-sm font-semibold text-gray-900">Allergens &amp; Dietary</span>
                    </div>
                    {/* Summary pills */}
                    <div
                      className="flex items-center gap-1.5 flex-wrap justify-end max-w-[60%] transition-opacity duration-200"
                      style={{ opacity: addonSectionOpen.allergensDietary ? 0.4 : 1 }}
                    >
                      {(currentAddon.allergens || []).map((v) => {
                        const a = ALLERGENS.find((x) => x.value === v);
                        return (
                          <span key={v} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                            {a?.label || v}
                          </span>
                        );
                      })}
                      {(currentAddon.dietaryRestrictions || []).map((v) => {
                        const f = DIETARY_FILTERS.find((x) => x.value === v);
                        return (
                          <span key={v} className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                            {f?.label || v}
                          </span>
                        );
                      })}
                      {!(currentAddon.allergens || []).length && !(currentAddon.dietaryRestrictions || []).length && (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </div>
                  </button>
                  <div
                    className="grid transition-[grid-template-rows] duration-[350ms]"
                    style={{
                      gridTemplateRows: addonSectionOpen.allergensDietary ? "1fr" : "0fr",
                      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 py-4 space-y-4">
                        {/* Allergens */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                          <select
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value && !(currentAddon.allergens || []).includes(value)) {
                                setCurrentAddon({
                                  ...currentAddon,
                                  allergens: [...(currentAddon.allergens || []), value],
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
                          {currentAddon.allergens && currentAddon.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentAddon.allergens.map((allergenValue) => {
                                const allergen = ALLERGENS.find((a) => a.value === allergenValue);
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
                                          allergens: currentAddon.allergens?.filter((a) => a !== allergenValue),
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
                          <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                          <select
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value && !(currentAddon.dietaryRestrictions || []).includes(value)) {
                                setCurrentAddon({
                                  ...currentAddon,
                                  dietaryRestrictions: [...(currentAddon.dietaryRestrictions || []), value],
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
                          {currentAddon.dietaryRestrictions && currentAddon.dietaryRestrictions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {currentAddon.dietaryRestrictions.map((filterValue) => {
                                const filter = DIETARY_FILTERS.find((f) => f.value === filterValue);
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
                                          dietaryRestrictions: currentAddon.dietaryRestrictions?.filter((f) => f !== filterValue),
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
                    </div>
                  </div>
                </div>
              </div>

              {/* Sticky footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
                {/* Delete (only when editing) */}
                {editingAddonIndex !== null ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveAddon(editingAddonIndex);
                      handleCloseAddonModal();
                    }}
                    className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                  >
                    Delete add-on
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloseAddonModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAddon}
                    disabled={!currentAddon.name || currentAddon.price < 0}
                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-px hover:shadow-md rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {editingAddonIndex !== null ? "Save Changes" : "Add Add-on"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

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

export default NewMenuItemPage;

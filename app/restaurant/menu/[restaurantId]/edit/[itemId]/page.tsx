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
  ChevronDown,
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
import { flattenAddonGroups, groupAddonsForApi, ensureFlatAddons } from "@/lib/utils/addon-helpers";

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
  const [deliveryPortionSize, setDeliveryPortionSize] = useState<string>("");
  const [minOrderQuantity, setMinOrderQuantity] = useState<string>("1");
  const [vatApplicable, setVatApplicable] = useState(false);
  const [mealCategory, setMealCategory] = useState<string>("main");
  const [mealTime, setMealTime] = useState<string>("all");
  // const [cateringQuantityUnit, setCateringQuantityUnit] = useState<string>("");

  // Group management state
  const [existingGroups, setExistingGroups] = useState<string[]>([]);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  // New group wizard state
  const [showGroupWizard, setShowGroupWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardGroup, setWizardGroup] = useState({
    groupTitle: "",
    selectionType: "multiple_no_repeat" as "single" | "multiple_no_repeat" | "multiple_repeat",
    isRequired: false,
    minSelections: undefined as number | undefined,
    maxSelections: undefined as number | undefined,
  });
  const [wizardItems, setWizardItems] = useState<Array<{ name: string; price: number; isDefault: boolean }>>([]);
  const [wizardNewItemName, setWizardNewItemName] = useState("");
  const [wizardNewItemPrice, setWizardNewItemPrice] = useState("");

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
  const [editingGroupTitle, setEditingGroupTitle] = useState<Record<string, string>>({});
  const [limitsWarning, setLimitsWarning] = useState<{ group: string; field: "min" | "max"; message: string } | null>(null);

  // Unsaved changes warning
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Fallback: browser beforeunload for tab close / refresh (can't show custom UI for that)
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleNavigation = (url: string) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(url);
      setShowLeaveModal(true);
    } else {
      router.push(url);
    }
  };

  // Track form changes after initial data load
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  useEffect(() => {
    if (!initialDataLoaded) return;
    setHasUnsavedChanges(true);
  }, [name, description, price, addons, image, groupTitle, discountPrice, isDiscount, prepTime, status, style, feedsPerUnit, deliveryPortionSize, minOrderQuantity, vatApplicable, mealCategory, mealTime]);

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
      console.log("ite", JSON.stringify(item))
      setSelectedAllergens(item.allergens || []);
      setSelectedDietaryFilters(item.dietaryFilters || []);
      setAddons(ensureFlatAddons(item.addons || []));
      setFeedsPerUnit(item.feedsPerUnit ? String(item.feedsPerUnit) : "");
      setDeliveryPortionSize(item.deliveryPortionSize || "");
      setMinOrderQuantity(item.minOrderQuantity ? String(item.minOrderQuantity) : "1");
      setVatApplicable(item.vatApplicable || false);
      setMealCategory(item.mealCategory || "main");
      setMealTime(item.mealTime || "all");
      // setCateringQuantityUnit(item.cateringQuantityUnit ? String(item.cateringQuantityUnit) : "");
    } catch (err: any) {
      setError(err.message || "Failed to load menu item");
    } finally {
      setLoading(false);
      setTimeout(() => setInitialDataLoaded(true), 100);
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

      // Close the group modal
      setShowNewGroupModal(false);
      const createdGroupName = newGroupName.trim();
      setNewGroupName("");

      // Open the addon modal pre-filled for this new group so the user can add the first addon
      setCurrentAddon({
        name: "",
        price: 0,
        allergens: [],
        dietaryRestrictions: [],
        groupTitle: createdGroupName,
        selectionType: "multiple_no_repeat",
        isRequired: false,
        isDefault: false,
        displayOrder: 0,
      } as any);
      setEditingAddonIndex(null);
      setAddonSectionOpen({ basicInfo: true, selectionRules: false, allergensDietary: false });
      setShowAddonModal(true);
    } catch (err) {
      console.error(err);
      setError("Failed to create group");
    }
  };

  const openGroupWizard = () => {
    setWizardStep(1);
    setWizardGroup({
      groupTitle: "",
      selectionType: "multiple_no_repeat",
      isRequired: false,
      minSelections: undefined,
      maxSelections: undefined,
    });
    setWizardItems([]);
    setWizardNewItemName("");
    setWizardNewItemPrice("");
    setShowGroupWizard(true);
  };

  const wizardAddItem = () => {
    if (!wizardNewItemName.trim()) return;
    setWizardItems(prev => [...prev, {
      name: wizardNewItemName.trim(),
      price: parseFloat(wizardNewItemPrice) || 0,
      isDefault: false,
    }]);
    setWizardNewItemName("");
    setWizardNewItemPrice("");
  };

  const wizardRemoveItem = (idx: number) => {
    setWizardItems(prev => prev.filter((_, i) => i !== idx));
  };

  const wizardToggleDefault = (idx: number) => {
    setWizardItems(prev => prev.map((item, i) => {
      if (wizardGroup.selectionType === "single") {
        // Single: only one default allowed
        return { ...item, isDefault: i === idx ? !item.isDefault : false };
      }
      return i === idx ? { ...item, isDefault: !item.isDefault } : item;
    }));
  };

  const wizardSave = async () => {
    if (wizardItems.length === 0) return;

    try {
      // Add all wizard items as addons with group settings
      const newAddons: MenuItemAddon[] = wizardItems.map((item, idx) => ({
        name: item.name,
        price: item.price,
        allergens: [],
        dietaryRestrictions: [],
        groupTitle: wizardGroup.groupTitle,
        selectionType: wizardGroup.selectionType,
        isRequired: wizardGroup.isRequired,
        minSelections: wizardGroup.minSelections,
        maxSelections: wizardGroup.maxSelections,
        isDefault: item.isDefault,
        displayOrder: idx,
      }));

      setAddons(prev => [...(prev || []), ...newAddons]);
      setHasUnsavedChanges(true);
      setShowGroupWizard(false);
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
        addons: addons && addons.length > 0 ? groupAddonsForApi(addons) : null,
        ...(feedsPerUnit ? { feedsPerUnit: parseInt(feedsPerUnit) } : {}),
        ...(deliveryPortionSize ? { deliveryPortionSize } : {}),
        minOrderQuantity: parseInt(minOrderQuantity) || 1,
        vatApplicable,
        mealCategory,
        mealTime,
        // ...(cateringQuantityUnit ? { cateringQuantityUnit: parseInt(cateringQuantityUnit) } : {}),
      };

      await cateringService.updateMenuItem(itemId, updateData);
      setSuccess("Menu item updated successfully!");
      setHasUnsavedChanges(false);
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
      <style>{`
        @keyframes limitsSlideIn {
          from { opacity: 0; max-height: 0; padding-top: 0; padding-bottom: 0; }
          to { opacity: 1; max-height: 60px; padding-top: 0.625rem; padding-bottom: 0.625rem; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => handleNavigation(`/restaurant/menu/${restaurantId}`)}
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
                  Delivery Portion Size
                </label>
                <input
                  type="text"
                  value={deliveryPortionSize} 
                  onChange={(e) => setDeliveryPortionSize(e.target.value)}
                  placeholder="e.g. used for delivery cost calcs"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Category *
                </label>
                <select
                  value={mealCategory}
                  onChange={(e) => setMealCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="snack">Snack</option>
                  <option value="main">Main</option>
                  <option value="drink">Drink</option>
                  <option value="dessert">Dessert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Time *
                </label>
                <select
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="all">All</option>
                </select>
              </div>
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
                onClick={() => openGroupWizard()}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                <Plus size={16} />
                New Group
              </button>
            </div>

            {/* Key/Filter Bar */}
            <div className="flex flex-wrap gap-2">
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Selection
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-64 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                  <strong className="block mb-1">How does the customer choose?</strong>
                  <strong className="text-green-400">Pick One</strong> — customer picks one option only. e.g. Choose your protein: Chicken or Tofu.<br/>
                  <strong className="text-blue-400">No repeat</strong> — customer can pick several different options, but only once each.<br/>
                  <strong className="text-purple-400">Repeat</strong> — customer can pick the same option more than once. e.g. Extra Cheese x3.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Required
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                  <strong className="block mb-1">Must the customer choose?</strong>
                  When a group is <strong className="text-amber-400">Required</strong>, the customer cannot place their order without selecting from this group.<br/>
                  When <strong className="text-gray-400">Optional</strong>, the customer can skip it.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Default
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                  <strong className="block mb-1">Pre-selected for the customer</strong>
                  Options marked as default will already be selected when the customer opens the item. They can still change their choice.
                </span>
              </div>
              <div className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Limits
                <span className="invisible group-hover:visible absolute left-0 top-full mt-1 z-10 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                  <strong className="block mb-1">How many can the customer choose?</strong>
                  Set a minimum and maximum. e.g. &quot;1–3&quot; means the customer must pick at least 1 but no more than 3 from this group.
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
                if (normalized === "single") return "Customer picks one option only. e.g. Choose Chicken or Tofu.";
                if (normalized === "multiple_no_repeat") return "Customer can pick several different options, but only once each.";
                return "Customer can pick the same option more than once. e.g. Extra Cheese x3.";
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
                            ? {
                                ...addon,
                                selectionType: selType,
                                ...(selType === "single" ? { minSelections: undefined, maxSelections: undefined, isDefault: false } : {}),
                              }
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
                        className="border border-gray-200 rounded-lg"
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
                          <span className="text-xs text-gray-400">
                            {groupAddons.length} {groupAddons.length === 1 ? "item" : "items"}
                          </span>
                          {/* Group-level selection type badge */}
                          <div className="group/sel relative">
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
                            >
                              {getSelectionLabel(firstAddon?.selectionType)}
                            </button>
                            <span className="invisible group-hover/sel:visible absolute left-0 top-full mt-1 z-10 w-60 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                              {getSelectionTooltip(firstAddon?.selectionType)} <span className="text-gray-400">Click to change.</span>
                            </span>
                          </div>
                          {/* Group-level required toggle */}
                          <div className="group/req relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleApplyRequired(!firstAddon?.isRequired);
                              }}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${
                                firstAddon?.isRequired
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {firstAddon?.isRequired ? "Required" : "Optional"}
                            </button>
                            <span className="invisible group-hover/req:visible absolute left-0 top-full mt-1 z-10 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-lg leading-relaxed pointer-events-none">
                              {firstAddon?.isRequired
                                ? "The customer must choose from this group before ordering. Click to make optional."
                                : "The customer can skip this group. Click to make required."}
                            </span>
                          </div>
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

                        {/* Limits row — slides in for non-single groups */}
                        {normalizeSelectionType(firstAddon?.selectionType) !== "single" && (() => {
                          const itemCount = groupAddons.length;
                          const isRepeat = normalizeSelectionType(firstAddon?.selectionType) === "multiple_repeat";
                          const upperLimit = isRepeat ? 99 : itemCount;
                          const warn = (field: "min" | "max", message: string) => {
                            setLimitsWarning({ group: grpTitle, field, message });
                            setTimeout(() => setLimitsWarning(null), 3500);
                          };
                          const applyGroup = (updates: Partial<MenuItemAddon>) => {
                            setAddons((prev) => (prev || []).map((a) =>
                              (a.groupTitle || "Other") === grpTitle ? { ...a, ...updates } : a
                            ));
                          };
                          const syncDefaults = (newMin?: number, newMax?: number) => {
                            setAddons((prev) => (prev || []).map((a) => {
                              if ((a.groupTitle || "Other") !== grpTitle) return a;
                              if (!isRepeat && newMin != null && newMin >= itemCount) return { ...a, minSelections: newMin, maxSelections: newMax, isDefault: true };
                              return { ...a, minSelections: newMin, maxSelections: newMax, isDefault: false };
                            }));
                          };
                          const handleMin = (raw: string) => {
                            if (!raw) { syncDefaults(undefined, groupMax); setLimitsWarning(null); return; }
                            const val = parseInt(raw);
                            if (val < 0) { warn("min", "Minimum must be 0 or more"); return; }
                            if (val > upperLimit) { warn("min", isRepeat ? `Maximum allowed is ${upperLimit}` : `This group only has ${itemCount} option${itemCount !== 1 ? "s" : ""} — minimum can't be higher than that`); return; }
                            if (groupMax != null && groupMax > 0 && val > groupMax) { warn("min", `Minimum can't be higher than your maximum (${groupMax})`); return; }
                            syncDefaults(val, groupMax);
                            setLimitsWarning(null);
                          };
                          const handleMax = (raw: string) => {
                            if (!raw) { syncDefaults(groupMin, undefined); setLimitsWarning(null); return; }
                            const val = parseInt(raw);
                            if (val < 0) { warn("max", "Maximum must be 0 or more"); return; }
                            if (val > upperLimit) { warn("max", isRepeat ? `Maximum allowed is ${upperLimit}` : `This group only has ${itemCount} option${itemCount !== 1 ? "s" : ""} — maximum can't be higher than that`); return; }
                            if (groupMin != null && val < groupMin) { warn("max", `Maximum can't be lower than your minimum (${groupMin})`); return; }
                            syncDefaults(groupMin, val);
                            setLimitsWarning(null);
                          };
                          const showMinWarn = limitsWarning?.group === grpTitle && limitsWarning.field === "min";
                          const showMaxWarn = limitsWarning?.group === grpTitle && limitsWarning.field === "max";
                          return (
                            <div
                              className="flex items-center gap-3 px-4 py-2.5 bg-blue-50/50 border-b border-blue-100"
                              style={{ animation: "limitsSlideIn 0.3s ease-out" }}
                            >
                              <span className="text-[11px] font-medium text-blue-700">How many must the customer choose?</span>
                              <div className="flex items-center gap-2 ml-auto">
                                <div className="relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-500">at least</span>
                                    <input type="number" min="0" max={upperLimit} value={groupMin ?? ""} onChange={(e) => handleMin(e.target.value)}
                                      className={`w-12 px-2 py-1 text-xs text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${showMinWarn ? "border-amber-400 bg-amber-50" : "border-gray-300 bg-white"}`} placeholder="-" />
                                  </div>
                                  {showMinWarn && (
                                    <div className="absolute bottom-full left-0 mb-1.5 z-20 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg flex items-start gap-1.5 max-w-[280px]">
                                      <span className="text-amber-500 text-sm">⚠</span>
                                      <span className="text-[11px] text-amber-800 font-medium">{limitsWarning!.message}</span>
                                    </div>
                                  )}
                                </div>
                                <div className="relative">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-gray-500">at most</span>
                                    <input type="number" min="0" max={upperLimit} value={groupMax ?? ""} onChange={(e) => handleMax(e.target.value)}
                                      className={`w-12 px-2 py-1 text-xs text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${showMaxWarn ? "border-amber-400 bg-amber-50" : "border-gray-300 bg-white"}`} placeholder="-" />
                                  </div>
                                  {showMaxWarn && (
                                    <div className="absolute bottom-full right-0 mb-1.5 z-20 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg shadow-lg flex items-start gap-1.5 max-w-[280px]">
                                      <span className="text-amber-500 text-sm">⚠</span>
                                      <span className="text-[11px] text-amber-800 font-medium">{limitsWarning!.message}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })()}

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
                                  {/* Default toggle (single) or indicator (non-single with auto-default) */}
                                  {normalizeSelectionType(firstAddon?.selectionType) === "single" ? (
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
                                  ) : addon.isDefault ? (
                                  <div className="flex justify-center">
                                    <div className="w-4 h-4 rounded-full bg-purple-500 border-2 border-purple-500" title="Auto-selected (min equals total options)" />
                                  </div>
                                  ) : <span />}
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
                              const inheritSelectionType = firstAddon?.selectionType || "multiple_no_repeat";
                              const inheritRequired = firstAddon?.isRequired || false;
                              setCurrentAddon({
                                name: "",
                                price: 0,
                                allergens: [],
                                dietaryRestrictions: [],
                                groupTitle: grpTitle === "Other" ? "" : grpTitle,
                                selectionType: inheritSelectionType === "multiple" ? "multiple_no_repeat" : inheritSelectionType,
                                isRequired: inheritRequired,
                                isDefault: false,
                                displayOrder: 0,
                              } as any);
                              setEditingAddonIndex(null);
                              setAddonSectionOpen({ basicInfo: true, selectionRules: false, allergensDietary: false });
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
                  No add-ons yet. Click &quot;New Group&quot; to create a group, then add add-ons to it.
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
              onClick={() => handleNavigation(`/restaurant/menu/${restaurantId}`)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage || !hasUnsavedChanges}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {hasUnsavedChanges ? "Save Changes" : "No Changes"}
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
                <div className="border border-gray-200 rounded-lg">
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

                {/* ── Section 2: Addon Settings (only for single-selection groups) ── */}
                {currentAddon.selectionType === "single" && (
                <div className="border border-gray-200 rounded-lg">
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
                      <span className="text-sm font-semibold text-gray-900">Addon Settings</span>
                    </div>
                    {/* Summary pills */}
                    <div
                      className="flex items-center gap-2 transition-opacity duration-200"
                      style={{ opacity: addonSectionOpen.selectionRules ? 0.4 : 1 }}
                    >
                      <span className={`text-xs px-2 py-0.5 rounded-full ${currentAddon.isDefault ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-600"}`}>
                        {currentAddon.isDefault ? "Default" : "Not default"}
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
                      </div>
                    </div>
                  </div>
                </div>
                )}

                {/* ── Section 3: Allergens & Dietary ── */}
                <div className="border border-gray-200 rounded-lg">
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

        {/* New Category Group Modal */}
        {showNewGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">New Group</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g., Noodles, Mains, Desserts"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleCreateNewGroup(); }}
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => { setShowNewGroupModal(false); setNewGroupName(""); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">Cancel</button>
                <button type="button" onClick={handleCreateNewGroup} disabled={!newGroupName.trim()} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* New Addon Group Wizard */}
        {showGroupWizard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden">
              {/* Progress bar */}
              <div className="flex items-center gap-0 px-6 pt-5 pb-3">
                {[1, 2].map(step => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      wizardStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}>
                      {wizardStep > step ? "\u2713" : step}
                    </div>
                    <div className="flex-1 mx-2">
                      <div className="text-[11px] font-medium text-gray-500">
                        {step === 1 ? "Group settings" : "Add options"}
                      </div>
                      <div className={`h-1 rounded-full mt-0.5 transition-colors ${
                        wizardStep > step ? "bg-blue-600" : wizardStep === step ? "bg-blue-200" : "bg-gray-100"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Step content */}
              <div className="flex-1 overflow-y-auto overflow-x-visible px-6 pb-4">
                {wizardStep === 1 && (
                  <div className="space-y-4 pt-2 overflow-visible">
                    <h3 className="text-lg font-bold text-gray-900">New add-on group</h3>

                    {/* Group name */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-xs font-medium text-gray-500">Group name</label>
                        <div className="group/gn relative">
                          <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold inline-flex items-center justify-center cursor-help">?</span>
                          <span className="invisible group-hover/gn:visible absolute left-5 top-0 z-50 w-48 p-2 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed pointer-events-none">This is what the customer sees as the heading above the options.</span>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={wizardGroup.groupTitle}
                        onChange={e => setWizardGroup(g => ({ ...g, groupTitle: e.target.value }))}
                        placeholder="e.g. Choose your protein"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                        autoFocus
                      />
                    </div>

                    {/* Selection type — compact horizontal cards */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <label className="text-xs font-medium text-gray-500">Selection type</label>
                        <div className="group/st relative">
                          <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold inline-flex items-center justify-center cursor-help">?</span>
                          <span className="invisible group-hover/st:visible absolute left-5 top-0 z-50 w-64 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed pointer-events-none">
                            <strong className="block mb-1">How does the customer choose?</strong>
                            <strong className="text-green-400">Pick One</strong> — customer picks one option only. e.g. Choose your protein: Chicken or Tofu.<br/>
                            <strong className="text-blue-400">No repeat</strong> — customer can pick several different options, but only once each.<br/>
                            <strong className="text-purple-400">Repeat</strong> — customer can pick the same option more than once. e.g. Extra Cheese x3.
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { value: "single" as const, label: "Pick one", icon: "\u25C9" },
                          { value: "multiple_no_repeat" as const, label: "Pick many", icon: "\u2611" },
                          { value: "multiple_repeat" as const, label: "Quantities", icon: "\u00b1" },
                        ]).map(opt => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setWizardGroup(g => ({ ...g, selectionType: opt.value }))}
                            className={`text-center px-2 py-2.5 rounded-lg border-2 transition-all ${
                              wizardGroup.selectionType === opt.value
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-blue-200"
                            }`}
                          >
                            <div className="text-lg leading-none mb-1">{opt.icon}</div>
                            <div className="text-xs font-medium text-gray-900">{opt.label}</div>
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        {wizardGroup.selectionType === "single" && "Customer picks one option only. e.g. Chicken or Tofu."}
                        {wizardGroup.selectionType === "multiple_no_repeat" && "Customer can select several different options. e.g. Lettuce, Tomato, Onion."}
                        {wizardGroup.selectionType === "multiple_repeat" && "Customer can add the same option more than once. e.g. Extra Cheese x3."}
                      </p>
                    </div>

                    {/* Required + Limits in a compact row */}
                    <div className="flex items-center gap-4">
                      <div className="group/rq relative">
                        <button
                          type="button"
                          onClick={() => setWizardGroup(g => ({ ...g, isRequired: !g.isRequired }))}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                            wizardGroup.isRequired ? "border-blue-500 bg-blue-50 text-blue-800" : "border-gray-200 text-gray-600 hover:border-blue-200"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] ${
                            wizardGroup.isRequired ? "bg-blue-500 border-blue-500 text-white" : "border-gray-300"
                          }`}>{wizardGroup.isRequired ? "\u2713" : ""}</span>
                          Required
                        </button>
                        <span className="invisible group-hover/rq:visible absolute left-0 bottom-full mb-1 z-50 w-56 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed pointer-events-none">
                          <strong className="block mb-1">Must the customer choose?</strong>
                          When a group is <strong className="text-amber-400">Required</strong>, the customer cannot place their order without selecting from this group.<br/>
                          When <strong className="text-gray-400">Optional</strong>, the customer can skip it.
                        </span>
                      </div>

                      {wizardGroup.selectionType !== "single" && (
                        <div className="flex items-center gap-2 flex-1">
                          <label className="text-xs text-gray-500 whitespace-nowrap">Min</label>
                          <input
                            type="number"
                            min="0"
                            value={wizardGroup.minSelections ?? ""}
                            onChange={e => setWizardGroup(g => ({ ...g, minSelections: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-"
                          />
                          <label className="text-xs text-gray-500 whitespace-nowrap">Max</label>
                          <input
                            type="number"
                            min="0"
                            value={wizardGroup.maxSelections ?? ""}
                            onChange={e => setWizardGroup(g => ({ ...g, maxSelections: e.target.value ? parseInt(e.target.value) : undefined }))}
                            className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="-"
                          />
                          <div className="group/mm relative">
                            <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-bold inline-flex items-center justify-center cursor-help">?</span>
                            <span className="invisible group-hover/mm:visible absolute right-0 bottom-full mb-1 z-50 w-56 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-lg leading-relaxed pointer-events-none">
                              <strong className="block mb-1">How many can the customer choose?</strong>
                              Set a minimum and maximum. e.g. &quot;1–3&quot; means the customer must pick at least 1 but no more than 3 from this group.
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-4 pt-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Add options to &quot;{wizardGroup.groupTitle}&quot;</h3>
                      <p className="text-sm text-gray-500 mt-0.5">These are the choices the customer will see. You can add more later.</p>
                    </div>

                    {/* Added items list */}
                    {wizardItems.length > 0 && (
                      <div className="space-y-2">
                        {wizardItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900">{item.name}</span>
                              {item.price > 0 && <span className="text-xs text-gray-500 ml-2">+£{item.price.toFixed(2)}</span>}
                            </div>
                            {wizardGroup.selectionType === "single" && (
                              <button
                                type="button"
                                onClick={() => wizardToggleDefault(idx)}
                                className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                                  item.isDefault ? "bg-purple-100 text-purple-700" : "bg-gray-200 text-gray-500 hover:bg-purple-50"
                                }`}
                                title={item.isDefault ? "This option is pre-selected for the customer" : "Click to make this the default choice"}
                              >
                                {item.isDefault ? "Default" : "Set default"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => wizardRemoveItem(idx)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add new item row */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={wizardNewItemName}
                        onChange={e => setWizardNewItemName(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); wizardAddItem(); } }}
                        placeholder="Option name, e.g. Chicken"
                        className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                        autoFocus
                      />
                      <input
                        type="number"
                        value={wizardNewItemPrice}
                        onChange={e => setWizardNewItemPrice(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); wizardAddItem(); } }}
                        placeholder="£0"
                        min="0"
                        step="0.01"
                        className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
                      />
                      <button
                        type="button"
                        onClick={wizardAddItem}
                        disabled={!wizardNewItemName.trim()}
                        className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">Press Enter or click + to add. You can add allergens and dietary info later by editing each option.</p>

                    {/* Summary preview */}
                    {wizardItems.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="text-xs font-medium text-blue-800 mb-1">Preview</div>
                        <div className="text-xs text-blue-700">
                          <strong>{wizardGroup.groupTitle}</strong>
                          {" · "}
                          {wizardGroup.selectionType === "single" ? "Pick one" : wizardGroup.selectionType === "multiple_repeat" ? "Pick many with quantities" : "Pick many"}
                          {wizardGroup.isRequired && " · Required"}
                          {wizardGroup.minSelections != null && ` · At least ${wizardGroup.minSelections}`}
                          {wizardGroup.maxSelections != null && ` · At most ${wizardGroup.maxSelections}`}
                          {" · "}
                          {wizardItems.length} option{wizardItems.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowGroupWizard(false)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <div className="flex gap-2">
                  {wizardStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(s => s - 1)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                  )}
                  {wizardStep === 1 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      disabled={!wizardGroup.groupTitle.trim()}
                      className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Next: Add options
                    </button>
                  )}
                  {wizardStep === 2 && (
                    <button
                      type="button"
                      onClick={wizardSave}
                      disabled={wizardItems.length === 0}
                      className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Save group ({wizardItems.length} option{wizardItems.length !== 1 ? "s" : ""})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unsaved Changes Leave Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50 animate-[fadeIn_0.2s_ease-out]"
              onClick={() => setShowLeaveModal(false)}
            />
            {/* Modal */}
            <div
              className="relative bg-white rounded-lg max-w-md w-full p-6 animate-[modalIn_0.25s_ease-out]"
              style={{ animationFillMode: "both" }}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                You have unsaved changes
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your changes will be lost if you leave this page.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Stay on page
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveModal(false);
                    setHasUnsavedChanges(false);
                    if (pendingNavigation) {
                      router.push(pendingNavigation);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
                >
                  Leave without saving
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

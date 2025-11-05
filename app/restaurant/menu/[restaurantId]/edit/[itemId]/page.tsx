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
} from "lucide-react";
import { cateringService } from "@/services/cateringServices";
import {
  UpdateMenuItemDto,
  MenuCategory,
  MenuItemStatus,
  MenuItemStyle,
  MenuItemAddon,
} from "@/types/catering.types";
import { ALLERGENS, PREP_TIMES } from "@/constants/allergens";

const EditMenuItemPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;
  const itemId = params.itemId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Categories
  const [categories, setCategories] = useState<MenuCategory[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [isDiscount, setIsDiscount] = useState(false);
  const [prepTime, setPrepTime] = useState(15);
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [status, setStatus] = useState<MenuItemStatus>(MenuItemStatus.ACTIVE);
  const [style, setStyle] = useState<MenuItemStyle>(MenuItemStyle.CARD);
  const [popular, setPopular] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [addons, setAddons] = useState<MenuItemAddon[]>([]);

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [item, cats] = await Promise.all([
        cateringService.getRestaurantMenuItems(restaurantId).then(items =>
          items.find(i => i.id === itemId)
        ),
        cateringService.getCategories(),
      ]);

      if (!item) {
        throw new Error("Menu item not found");
      }

      setCategories(cats);

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

      // Handle categoryIds - check both categoryIds and categories fields
      console.log("Item data:", item);
      console.log("Item categoryIds:", item.categoryIds);
      console.log("Item categories:", item.categories);

      const categoryIds = item.categoryIds ||
        (item.categories && Array.isArray(item.categories)
          ? item.categories.map((cat: any) => cat.id)
          : []);

      console.log("Processed categoryIds:", categoryIds);
      setSelectedCategories(categoryIds);

      setSelectedAllergens(item.allergens || []);
      setAddons(item.addons || []);
    } catch (err: any) {
      setError(err.message || "Failed to load menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage("");
    setImageFile(null);
    setImagePreview("");
  };

  const handleAddAllergen = (allergenValue: string) => {
    const current = selectedAllergens || [];
    if (!current.includes(allergenValue)) {
      setSelectedAllergens([...current, allergenValue]);
    }
  };

  const handleRemoveAllergen = (allergenValue: string) => {
    setSelectedAllergens((selectedAllergens || []).filter((a) => a !== allergenValue));
  };

  const handleAddAddon = () => {
    setAddons([...(addons || []), { name: "", price: 0, allergens: [] }]);
  };

  const handleRemoveAddon = (index: number) => {
    setAddons((addons || []).filter((_, i) => i !== index));
  };

  const handleAddonChange = (
    index: number,
    field: keyof MenuItemAddon,
    value: any
  ) => {
    const updated = [...(addons || [])];
    updated[index] = { ...updated[index], [field]: value };
    setAddons(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Handle image upload if there's a new file
      let imageUrl = image;
      if (imageFile) {
        // In a real implementation, you would upload the image to cloud storage
        // For now, we'll use the data URL
        imageUrl = imagePreview;
      }

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
        allergens: selectedAllergens || [],
        addons: (addons && addons.length > 0) ? addons : null,
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
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
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
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
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
                maxLength={200}
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
              <input
                type="text"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                placeholder="e.g., Appetizers, Mains, Desserts"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
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
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDiscount"
                checked={isDiscount}
                onChange={(e) => setIsDiscount(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isDiscount" className="ml-2 text-sm text-gray-700">
                Apply discount pricing
              </label>
            </div>
          </div>

          {/* Image */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Image</h2>

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
              <label className="cursor-pointer inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
                <Upload size={20} />
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
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
                        setSelectedCategories([...(selectedCategories || []), cat.id]);
                      } else {
                        setSelectedCategories(
                          (selectedCategories || []).filter((id) => id !== cat.id)
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
                  const allergen = ALLERGENS.find((a) => a.value === allergenValue);
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

            {addons.map((addon, index) => (
              <div
                key={index}
                className="p-4 border border-gray-300 rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Add-on Name
                      </label>
                      <input
                        type="text"
                        value={addon.name}
                        onChange={(e) =>
                          handleAddonChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price (£)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={addon.price}
                        onChange={(e) =>
                          handleAddonChange(index, "price", parseFloat(e.target.value))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveAddon(index)}
                    className="ml-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Settings */}
          <div className="space-y-4">
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
              disabled={saving}
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
      </div>
    </div>
  );
};

export default EditMenuItemPage;

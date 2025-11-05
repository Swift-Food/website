"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ArrowLeft,
  Search,
  AlertCircle,
} from "lucide-react";
import { cateringService } from "@/services/cateringServices";
import { MenuItemDetails } from "@/types/catering.types";

const MenuListPage = () => {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.restaurantId as string;

  const [menuItems, setMenuItems] = useState<MenuItemDetails[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItemDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    console.log("Restaurant ID:", restaurantId);
    if (restaurantId) {
      fetchMenuItems();
    } else {
      setError("No restaurant ID provided");
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchQuery, selectedGroup]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await cateringService.getRestaurantMenuItems(restaurantId);
      console.log("Fetched menu items:", response);

      // Handle both array and object responses
      let items: MenuItemDetails[] = [];

      if (Array.isArray(response)) {
        items = response;
      } else if (response && typeof response === 'object' && Array.isArray(response.menuItems)) {
        // API now returns { menuItems: [...], groupSettings: {...} }
        items = response.menuItems;
      } else {
        console.error("API returned unexpected format:", response);
        setMenuItems([]);
        setError("Invalid response format from server");
        return;
      }

      setMenuItems(items);
    } catch (err: any) {
      console.error("Failed to fetch menu items:", err);
      setError(err.message || "Failed to fetch menu items");
      setMenuItems([]); // Ensure menuItems is always an array
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    // Ensure menuItems is an array before filtering
    if (!Array.isArray(menuItems)) {
      setFilteredItems([]);
      return;
    }

    let filtered = [...menuItems];

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGroup !== "all") {
      filtered = filtered.filter((item) => item.groupTitle === selectedGroup);
    }

    setFilteredItems(filtered);
  };

  const handleDuplicate = async (itemId: string) => {
    try {
      await cateringService.duplicateMenuItem(itemId, restaurantId);
      await fetchMenuItems();
    } catch (err: any) {
      setError(err.message || "Failed to duplicate item");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (deleteConfirm !== itemId) {
      setDeleteConfirm(itemId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      await cateringService.deleteMenuItem(itemId);
      await fetchMenuItems();
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete item");
    }
  };

  const getUniqueGroups = () => {
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return [];
    }
    const groups = Array.from(new Set(menuItems.map((item) => item.groupTitle)));
    return groups.filter(Boolean);
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return `£${numPrice.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading menu items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
              <p className="text-gray-600 mt-1">{menuItems.length} items</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/restaurant/menu/${restaurantId}/new`)}
            className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add New Item
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start text-red-700">
            <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Groups</option>
              {getUniqueGroups().map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Menu Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">No menu items found</p>
            <button
              onClick={() => router.push(`/restaurant/menu/${restaurantId}/new`)}
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={20} />
              Add your first menu item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Item Image */}
                {item.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Item Details */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-900 flex-1">
                      {item.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ml-2 ${
                        item.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : item.status === "DRAFT"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-primary font-bold text-xl">
                        {formatPrice(item.price)}
                      </p>
                      {item.isDiscount && item.discountPrice && (
                        <p className="text-gray-500 text-sm line-through">
                          {formatPrice(item.discountPrice)}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.groupTitle}
                    </span>
                  </div>

                  {/* Allergens */}
                  {item.allergens && item.allergens.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Allergens:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.allergens.slice(0, 3).map((allergen, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded"
                          >
                            {allergen.replace(/_/g, " ")}
                          </span>
                        ))}
                        {item.allergens.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.allergens.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() =>
                        router.push(`/restaurant/menu/${restaurantId}/edit/${item.id}`)
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(item.id)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className={`font-medium py-2 px-4 rounded-lg transition-colors ${
                        deleteConfirm === item.id
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                      title={
                        deleteConfirm === item.id ? "Click again to confirm" : "Delete"
                      }
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuListPage;

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
  ArrowUp,
  ArrowDown,
  GripVertical,
  Save,
  X,
} from "lucide-react";
import { cateringService } from "@/services/api/catering.api";
import { API_BASE_URL, API_ENDPOINTS } from "@/lib/constants/api";
import { MenuItemDetails, MenuItemStatus } from "@/types/catering.types";
import { fetchWithAuth } from "@/lib/api-client/auth-client";

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
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [restaurantData, setRestaurantData] = useState<any>(null);

  // Reorder mode state
  const [isReorderMode, setIsReorderMode] = useState(false);
  const [reorderGroups, setReorderGroups] = useState<string[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Status change state
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (restaurantId) {
      fetchMenuItems();
      fetchRestaurantData();
    } else {
      setError("No restaurant ID provided");
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    filterItems();
  }, [menuItems, searchQuery, selectedGroup, selectedStatus]);

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setStatusDropdownOpen(null);
    if (statusDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [statusDropdownOpen]);

  const fetchMenuItems = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await cateringService.getRestaurantMenuItems(
        restaurantId
      );

      // Handle both array and object responses
      let items: MenuItemDetails[] = [];

      if (Array.isArray(response)) {
        items = response;
      } else if (response && typeof response === "object") {
        // Type guard to check if response has menuItems property
        const hasMenuItems = "menuItems" in response;
        if (hasMenuItems) {
          const responseWithMenuItems = response as {
            menuItems: MenuItemDetails[];
            groupSettings?: any;
          };
          if (Array.isArray(responseWithMenuItems.menuItems)) {
            // API now returns { menuItems: [...], groupSettings: {...} }
            items = responseWithMenuItems.menuItems;

            // Store group settings if available
            if (responseWithMenuItems.groupSettings) {
              setRestaurantData({
                menuGroupSettings: responseWithMenuItems.groupSettings,
              });
            }
          }
        } else {
          console.error("API returned unexpected format:", response);
          setMenuItems([]);
          setError("Invalid response format from server");
          return;
        }
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

  const fetchRestaurantData = async () => {
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.RESTAURANT_DETAILS(restaurantId)}`
      );
      if (response.ok) {
        const data = await response.json();
        setRestaurantData(data);
      }
    } catch (err) {
      console.error("Failed to fetch restaurant data:", err);
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

    if (selectedStatus !== "all") {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    setFilteredItems(filtered);
  };

  const handleDuplicate = async (itemId: string) => {
    try {
      await cateringService.duplicateMenuItem(itemId, restaurantId);
      await fetchMenuItems();
    } catch (err: any) {
      console.error("Failed to duplicate: ", err);
      setError(err.message || "Failed to duplicate item");
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: MenuItemStatus) => {
    setUpdatingStatus(itemId);
    try {
      await cateringService.updateMenuItem(itemId, { status: newStatus });
      // Update local state
      setMenuItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
      setStatusDropdownOpen(null);
    } catch (err: any) {
      console.error("Failed to update status:", err);
      setError(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    itemId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (deleteConfirm !== itemId) {
      // Blur the button to prevent focus scroll behavior
      e.currentTarget.blur();
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
    const groups = Array.from(
      new Set(menuItems.map((item) => item.groupTitle))
    );
    return groups.filter(Boolean);
  };

  const getUniqueStatuses = () => {
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      return [];
    }
    const statuses = Array.from(new Set(menuItems.map((item) => item.status)));
    return statuses.filter(Boolean);
  };

  const getGroupedItems = () => {
    const isFiltered =
      searchQuery || selectedGroup !== "all" || selectedStatus !== "all";

    // If filtered, return flat list
    if (isFiltered) {
      return null;
    }

    // Group items by groupTitle
    const grouped: Record<string, MenuItemDetails[]> = {};
    filteredItems.forEach((item) => {
      const group = item.groupTitle || "Other";
      if (!grouped[group]) {
        grouped[group] = [];
      }
      grouped[group].push(item);
    });

    // Get group order from restaurant data
    const menuGroupSettings = restaurantData?.menuGroupSettings || {};
    const groupNames = Object.keys(grouped);

    // Sort groups by displayOrder
    const sortedGroupNames = groupNames.sort((a, b) => {
      const orderA = menuGroupSettings[a]?.displayOrder ?? 999;
      const orderB = menuGroupSettings[b]?.displayOrder ?? 999;
      return orderA - orderB;
    });

    // Sort items within each group by itemDisplayOrder
    const result: Array<{ groupName: string; items: MenuItemDetails[] }> = [];
    sortedGroupNames.forEach((groupName) => {
      const items = grouped[groupName].sort(
        (a, b) => (a.itemDisplayOrder ?? 999) - (b.itemDisplayOrder ?? 999)
      );
      result.push({ groupName, items });
    });

    return result;
  };

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `£${numPrice.toFixed(2)}`;
  };

  // Reorder mode functions
  const enterReorderMode = () => {
    const groupedItems = getGroupedItems();
    if (groupedItems) {
      const groups = groupedItems.map(({ groupName }) => groupName);
      setReorderGroups(groups);
      setIsReorderMode(true);
    }
  };

  const exitReorderMode = () => {
    setIsReorderMode(false);
    setReorderGroups([]);
  };

  const moveGroupUp = (index: number) => {
    if (index > 0) {
      const newGroups = [...reorderGroups];
      [newGroups[index - 1], newGroups[index]] = [
        newGroups[index],
        newGroups[index - 1],
      ];
      setReorderGroups(newGroups);
    }
  };

  const moveGroupDown = (index: number) => {
    if (index < reorderGroups.length - 1) {
      const newGroups = [...reorderGroups];
      [newGroups[index], newGroups[index + 1]] = [
        newGroups[index + 1],
        newGroups[index],
      ];
      setReorderGroups(newGroups);
    }
  };

  const deleteGroup = (index: number) => {
    const newGroups = reorderGroups.filter((_, i) => i !== index);
    setReorderGroups(newGroups);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) {
      return;
    }

    const newGroups = [...reorderGroups];
    const draggedItem = newGroups[draggedIndex];

    // Remove the dragged item from its current position
    newGroups.splice(draggedIndex, 1);

    // Insert it at the new position
    newGroups.splice(index, 0, draggedItem);

    setReorderGroups(newGroups);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const saveGroupOrder = async () => {
    setSavingOrder(true);
    try {
      // Create group settings object with new display order
      const newGroupSettings: Record<string, { displayOrder: number }> = {};
      reorderGroups.forEach((groupName, index) => {
        newGroupSettings[groupName] = { displayOrder: index + 1 };
      });

      // Save to backend
      await cateringService.reorderGroups(restaurantId, newGroupSettings);

      // Update local state
      setRestaurantData((prev: any) => ({
        ...prev,
        menuGroupSettings: newGroupSettings,
      }));

      // Exit reorder mode
      exitReorderMode();

      // Refresh menu items to reflect new order
      await fetchMenuItems();
    } catch (err: any) {
      console.error("Failed to save group order:", err);
      setError("Failed to save group order");
    } finally {
      setSavingOrder(false);
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
              onClick={() => router.push("/restaurant/dashboard")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Menu Management
              </h1>
              <p className="text-gray-600 mt-1">{menuItems.length} items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={enterReorderMode}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <GripVertical size={20} />
              Reorder Groups
            </button>
            <button
              onClick={() =>
                router.push(`/restaurant/menu/${restaurantId}/new`)
              }
              className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Add New Item
            </button>
          </div>
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="all">All Statuses</option>
              {getUniqueStatuses().map((status) => (
                <option key={status} value={status}>
                  {status}
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
              onClick={() =>
                router.push(`/restaurant/menu/${restaurantId}/new`)
              }
              className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={20} />
              Add your first menu item
            </button>
          </div>
        ) : (
          (() => {
            const groupedItems = getGroupedItems();

            // Render grouped view when not filtered
            if (groupedItems) {
              return (
                <div className="space-y-8">
                  {groupedItems.map(({ groupName, items }) => (
                    <div key={groupName}>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {groupName}
                      </h2>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <MenuItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            // Render flat view when filtered
            return (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            );
          })()
        )}

        {/* Reorder Groups Modal */}
        {isReorderMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Reorder Groups
                  </h2>
                  <button
                    onClick={exitReorderMode}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Drag groups to reorder them, use the arrows, or click the
                  trash icon to delete a group. Changes will be saved when you
                  click Save.
                </p>
              </div>

              {/* Groups List */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-2">
                  {reorderGroups.map((groupName, index) => (
                    <div
                      key={groupName}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-move transition-all ${
                        draggedIndex === index ? "opacity-50 scale-95" : ""
                      }`}
                    >
                      <GripVertical size={20} className="text-gray-400" />
                      <span className="flex-1 font-medium text-gray-900">
                        {groupName}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveGroupUp(index)}
                          disabled={index === 0}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button
                          onClick={() => moveGroupDown(index)}
                          disabled={index === reorderGroups.length - 1}
                          className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <ArrowDown size={18} />
                        </button>
                        <button
                          onClick={() => deleteGroup(index)}
                          className="p-2 rounded-lg border border-red-300 hover:bg-red-50 text-red-600 transition-colors"
                          title="Delete group"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={exitReorderMode}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveGroupOrder}
                  disabled={savingOrder}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {savingOrder ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save Order
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

  // Helper component to render a menu item card
  function MenuItemCard({ item }: { item: MenuItemDetails }) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Left Side - Content */}
          <div className="flex-1 p-4 sm:p-6">
            {/* Header - Name and Status */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-xl text-gray-900 flex-1">
                {item.name}
              </h3>
              <div className="relative ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusDropdownOpen(statusDropdownOpen === item.id ? null : item.id);
                  }}
                  disabled={updatingStatus === item.id}
                  className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                    item.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : item.status === "DRAFT"
                      ? "bg-yellow-100 text-yellow-800"
                      : item.status === "CATERING"
                      ? "bg-blue-100 text-blue-800"
                      : item.status === "SOLD_OUT"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  } ${updatingStatus === item.id ? "opacity-50" : ""}`}
                >
                  {updatingStatus === item.id ? "..." : item.status}
                </button>
                {statusDropdownOpen === item.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                    {Object.values(MenuItemStatus).map((status) => (
                      <button
                        key={status}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (status !== item.status) {
                            handleStatusChange(item.id, status);
                          } else {
                            setStatusDropdownOpen(null);
                          }
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          status === item.status ? "bg-gray-50 font-medium" : ""
                        }`}
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            status === "ACTIVE"
                              ? "bg-green-500"
                              : status === "DRAFT"
                              ? "bg-yellow-500"
                              : status === "CATERING"
                              ? "bg-blue-500"
                              : status === "SOLD_OUT"
                              ? "bg-red-500"
                              : "bg-gray-500"
                          }`}
                        />
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description - 2 lines */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {item.description || "No description available"}
            </p>

            {/* Price and Group */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <p className="text-primary font-bold text-2xl">
                  {item.isDiscount && item.discountPrice
                    ? formatPrice(item.discountPrice)
                    : formatPrice(item.price)}
                </p>
                {item.isDiscount && item.discountPrice && (
                  <p className="text-gray-500 text-sm line-through">
                    {formatPrice(item.price)}
                  </p>
                )}
              </div>
              {item.groupTitle && (
                <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                  {item.groupTitle}
                </span>
              )}
            </div>

            {/* Allergens */}
            {item.allergens && item.allergens.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {item.allergens.slice(0, 4).map((allergen, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full"
                    >
                      {allergen.replace(/_/g, " ")}
                    </span>
                  ))}
                  {item.allergens.length > 4 && (
                    <span className="text-xs text-gray-500 px-2 py-1">
                      +{item.allergens.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/restaurant/menu/${restaurantId}/edit/${item.id}`
                  )
                }
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDuplicate(item.id)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                title="Duplicate"
              >
                <Copy size={16} />
                <span className="hidden sm:inline">Duplicate</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(e, item.id)}
                className={`font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ${
                  deleteConfirm === item.id
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                title={
                  deleteConfirm === item.id
                    ? "Click again to confirm"
                    : "Delete"
                }
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">
                  {deleteConfirm === item.id ? "Confirm" : "Delete"}
                </span>
              </button>
            </div>
          </div>

          {/* Right Side - Image */}
          {item.image && (
            <div className="w-full sm:w-64 h-48 sm:h-auto bg-gray-200 flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default MenuListPage;

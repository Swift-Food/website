// services/catering.service.ts
import { fetchWithAuth } from "@/lib/api-client/auth-client";
import {
  SearchResponse,
  SearchFilters,
  EventDetails,
  SelectedMenuItem,
  ContactInfo,
  CateringPricingResult,
  PromoCodeValidation,
  CateringOrderDetails,
  CreateMenuItemDto,
  MenuItemDetails,
  UpdateMenuItemDto,
  MenuCategory,
} from "@/types/catering.types";
import {
  CreateCateringOrderRequest,
  CateringRestaurantOrderRequest,
  CateringMenuItemRequest,
  CateringAddonRequest,
  AddSharedAccessRequest,
  RemoveSharedAccessRequest,
  UpdatePickupContactRequest,
  UpdateDeliveryTimeRequest,
  UpdateSharedAccessRoleRequest,
} from "@/types/api";
import { API_BASE_URL, GOOGLE_MAPS_API_KEY } from "@/lib/constants";

class CateringService {
  async searchMenuItems(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();

    params.append("q", query || "");
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.marketId) params.append("marketId", filters.marketId);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.minRating)
      params.append("minRating", filters.minRating.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());
    // if (filters?.dietaryFilters && filters.dietaryFilters.length > 0) {
    //   filters.dietaryFilters.forEach((filter) =>
    //     params.append("dietaryFilters", filter)
    //   );
    // }
    if (filters?.dietaryFilters)
      params.append("dietaryFilters", filters.dietaryFilters.join(","));
    if (filters?.allergens)
      params.append("excludeAllergens", filters.allergens.join(","));
    // if (filters?.allergens && filters.allergens.length > 0) {
    //   filters.allergens.forEach((allergen) =>
    //     params.append("allergens", allergen)
    //   );
    // }

    console.log("Search payload: ", params);

    const response = await fetchWithAuth(
      `${API_BASE_URL}/search?catering=true&${params.toString()}`
    );

    console.log("Search response: ", response);

    if (!response.ok) {
      throw new Error("Failed to search menu items");
    }

    return response.json();
  }

  async getMenuItems() {
    const fullUrl = `${API_BASE_URL}/menu-item`;
    console.log("🌐 Fetching menu items from:", fullUrl);
    const response = await fetchWithAuth(`${API_BASE_URL}/menu-item/catering`);
    console.log("📡 Response status:", response.status);
    if (!response.ok) {
      throw new Error("Failed to search menu items");
    }

    return response.json();
  }

  async submitCateringOrder(
    eventDetails: EventDetails,
    selectedItems: SelectedMenuItem[],
    contactInfo: ContactInfo,
    promoCodes: string[],
    ccEmails?: string[],
    paymentInfo?: {
      corporateUserId?: string;
      organizationId?: string;
      useOrganizationWallet?: boolean;
      paymentMethodId?: string;
      paymentIntentId?: string;
    }
  ) {
    console.log("=== CATERING SERVICE: Submit Order ===");
    console.log("Event Details:", JSON.stringify(eventDetails, null, 2));
    console.log("Selected Items Count:", selectedItems.length);
    console.log("Contact Info:", JSON.stringify(contactInfo, null, 2));
    console.log("Promo Codes:", promoCodes);
    console.log("Payment Info:", JSON.stringify(paymentInfo, null, 2));

    let userId;
    try {
      userId = await this.findOrCreateConsumerAccount(contactInfo);
      console.log("✅ User ID obtained:", userId);
    } catch (error: any) {
      console.error("❌ Failed to find/create consumer account");
      console.error("Error:", error);
      throw new Error(`Failed to create user account: ${error.message}`);
    }

    // Group items by restaurant
    const groupedByRestaurant = selectedItems.reduce(
      (acc, { item, quantity }) => {
        const restaurantId =
          item.restaurant?.restaurantId || item.restaurantId || "unknown";
        const restaurantName = item.restaurant?.name || "Unknown Restaurant";

        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurantId,
            restaurantName,
            items: [],
          };
        }

        const price = parseFloat(item.price?.toString() || "0");
        const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
        const unitPrice =
          item.isDiscount && discountPrice > 0 ? discountPrice : price;

        // Calculate addon price
        const DISPLAY_FEEDS_PER_UNIT = item.feedsPerUnit || 10;
        const addonPricePerUnit = (item.selectedAddons || []).reduce(
          (addonTotal, { price, quantity }) => {
            return (
              addonTotal +
              (price || 0) * (quantity || 0) * DISPLAY_FEEDS_PER_UNIT
            );
          },
          0
        );

        // Total price includes both item price and addon price
        const itemTotalPrice = unitPrice * quantity + addonPricePerUnit;

        // Transform addon quantities for backend
        const transformedAddons = (item.selectedAddons || []).map((addon) => ({
          ...addon,
          quantity: (addon.quantity || 0) * DISPLAY_FEEDS_PER_UNIT,
        }));

        acc[restaurantId].items.push({
          menuItemId: item.id,
          name: item.name,
          groupTitle: item.groupTitle,
          quantity,
          unitPrice,
          addonPrice: addonPricePerUnit,
          selectedAddons: transformedAddons,
          totalPrice: itemTotalPrice,
        });

        return acc;
      },
      {} as Record<
        string,
        { restaurantId: string; restaurantName: string; items: any[] }
      >
    );

    // Transform to CateringRestaurantOrderRequest format (backend will calculate pricing)
    const orderItems: CateringRestaurantOrderRequest[] = Object.values(groupedByRestaurant).map(
      (group: any) => {
        return {
          restaurantId: group.restaurantId,
          menuItems: group.items.map((item: any) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            selectedAddons: item.selectedAddons,
            groupTitle: item.groupTitle,
          } as CateringMenuItemRequest)),
          specialInstructions: eventDetails.specialRequests || "",
        };
      }
    );

    // Calculate rough estimated total for display (backend will recalculate)
    const estimatedTotal = Object.values(groupedByRestaurant).reduce(
      (sum: number, group: any) => {
        const groupTotal = group.items.reduce(
          (itemSum: number, item: any) => itemSum + (item.totalPrice || 0),
          0
        );
        return sum + groupTotal;
      },
      0
    );

    const createDto: CreateCateringOrderRequest = {
      userId,
      organization: contactInfo.organization,
      customerName: contactInfo.fullName,
      customerEmail: contactInfo.email,
      customerPhone: contactInfo.phone,
      ccEmails: ccEmails || [],
      eventDate: eventDetails.eventDate,
      eventTime: eventDetails.eventTime,
      guestCount: eventDetails.guestCount,
      eventType: eventDetails.eventType,
      deliveryAddress: `${contactInfo.addressLine1}${
        contactInfo.addressLine2 ? ", " + contactInfo.addressLine2 : ""
      }, ${contactInfo.city}, ${contactInfo.zipcode}`,
      specialRequirements: eventDetails.specialRequests || "",
      orderItems,
      estimatedTotal,
      promoCodes,
      corporateUserId: paymentInfo?.corporateUserId,
      organizationId: paymentInfo?.organizationId,
      useOrganizationWallet: paymentInfo?.useOrganizationWallet,
      paymentMethodId: paymentInfo?.paymentMethodId,
      paymentIntentId: paymentInfo?.paymentIntentId,
    };

    const response = await fetchWithAuth(`${API_BASE_URL}/catering-orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(createDto),
    });

    if (!response.ok) {
      throw new Error("Failed to submit catering order");
    }

    return response.json();
  }

  async findOrCreateConsumerAccount(contactInfo: ContactInfo): Promise<string> {
    // Step 1: Check if user exists by email
    console.log("contact info being sent", JSON.stringify(contactInfo));
    try {
      const checkResponse = await fetchWithAuth(
        `${API_BASE_URL}/users/email/${encodeURIComponent(contactInfo.email)}`
      );

      console.log("Find or create consumer account response: ", checkResponse);
      if (checkResponse.ok) {
        const existingUser = await checkResponse.json();
        return existingUser.id; // User exists, return their ID
      }
    } catch (error) {
      console.error(error);
      // User doesn't exist, continue to create
    }

    // Step 2: Create new user if not found
    const randomPassword = Math.random().toString(36).slice(-10) + "A1";
    const formattedPhone = contactInfo.phone.startsWith("+")
      ? contactInfo.phone
      : "+44" + contactInfo.phone.replace(/^0/, "");

    const createConsumerDto = {
      userDetails: {
        username: contactInfo.email.split("@")[0] + "_" + Date.now(),
        password: randomPassword,
        email: contactInfo.email,
        phoneNumber: formattedPhone,
        role: "customer",
      },
    };
    console.log("consumer create data", JSON.stringify(createConsumerDto));
    const response = await fetchWithAuth(`${API_BASE_URL}/consumer-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createConsumerDto),
    });

    if (!response.ok) {
      throw new Error("Failed to create consumer account");
    }

    const data = await response.json();
    return data.user.id;
  }

  async createAddress(
    userId: string,
    contactInfo: ContactInfo
  ): Promise<string> {
    const createAddressDto = {
      userId,
      name: "Catering Delivery Address",
      addressLine1: contactInfo.addressLine1,
      addressLine2: contactInfo.addressLine2,
      city: contactInfo.city,
      zipcode: contactInfo.zipcode,
      location: {
        latitude: contactInfo.latitude || 0,
        longitude: contactInfo.longitude || 0,
      },
    };

    const response = await fetchWithAuth(`${API_BASE_URL}/address`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createAddressDto),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Failed to create address:", error);
      throw new Error("Failed to create address");
    }

    const data = await response.json();
    console.log("Address created:", data.id);
    return data.id;
  }

  // Add to services/catering.service.ts

  async geocodeAddress(
    address: string
  ): Promise<{ latitude: number; longitude: number }> {
    const encodedAddress = encodeURIComponent(address);

    const response = await fetchWithAuth(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error("Geocoding failed");
    }

    const data = await response.json();

    if (data.status === "OK" && data.results[0]) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    throw new Error("No results from geocoding");
  }

  async calculateCateringPricing(
    orderItems: CateringRestaurantOrderRequest[],
    promoCodes?: string[]
  ): Promise<CateringPricingResult> {
    const pricingData = {
      orderItems,
      promoCodes,
    };

    const response = await fetchWithAuth(
      `${API_BASE_URL}/pricing/catering-verify-cart`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Pricing calculation failed:", error);
      throw new Error("Failed to calculate pricing");
    }

    return response.json();
  }

  async validatePromoCode(
    promoCode: string,
    orderItems: CateringRestaurantOrderRequest[]
  ): Promise<PromoCodeValidation> {
    // Use POST request with body instead of GET with query params
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/promotions/validate-catering`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: promoCode,
            orderItems,
          }),
        }
      );

      if (!response.ok) {
        return { valid: false, reason: "Failed to validate promo code" };
      }

      return response.json();
    } catch (err) {
      console.error("Promo validation error:", err);
      return {
        valid: false,
        reason: "Network error while validating promo code",
      };
    }
  }

  async getOrderByToken(token: string): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/view/${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    return response.json();
  }

  async getOrdersByUserId(userId: string): Promise<CateringOrderDetails[]> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/user/${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return response.json();
  }

  async addSharedAccess(
    dto: AddSharedAccessRequest
  ): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/shared-access/add`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add shared access");
    }

    return response.json();
  }

  async updateSharedAccessRole(
    dto: UpdateSharedAccessRoleRequest
  ): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/shared-access/update-role`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update role");
    }

    return response.json();
  }

  async removeSharedAccess(
    dto: RemoveSharedAccessRequest
  ): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/shared-access/remove`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to remove shared access");
    }

    return response.json();
  }

  async updatePickupContact(
    dto: UpdatePickupContactRequest
  ): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/pickup-contact`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update pickup contact");
    }

    return response.json();
  }

  async updateDeliveryTime(
    dto: UpdateDeliveryTimeRequest
  ): Promise<CateringOrderDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/delivery-time`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update delivery time");
    }

    return response.json();
  }

  async getRestaurantMenuItems(
    restaurantId: string
  ): Promise<MenuItemDetails[]> {
    const url = `${API_BASE_URL}/menu-item/admin/restaurant/${restaurantId}`;
    console.log("Fetching menu items from:", url);

    const response = await fetchWithAuth(url);

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      throw new Error(
        `Failed to fetch menu items: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);

    // Handle both array and object responses
    if (Array.isArray(data)) {
      return data;
    } else if (
      data &&
      typeof data === "object" &&
      Array.isArray(data.menuItems)
    ) {
      return data.menuItems;
    }

    return [];
  }

  async createMenuItem(dto: CreateMenuItemDto): Promise<MenuItemDetails> {
    console.log("dto is", dto);
    const response = await fetchWithAuth(`${API_BASE_URL}/menu-item`, {
      method: "POST",
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create menu item");
    }

    return response.json();
  }

  async updateMenuItem(
    itemId: string,
    dto: UpdateMenuItemDto
  ): Promise<MenuItemDetails> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/menu-item/${itemId}`,
      {
        method: "PATCH",
        body: JSON.stringify(dto),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update menu item");
    }

    return response.json();
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/menu-item/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete menu item");
    }
  }

  async duplicateMenuItem(
    itemId: string,
    restaurantId: string
  ): Promise<MenuItemDetails> {
    // Fetch the original item
    const items = await this.getRestaurantMenuItems(restaurantId);
    const originalItem = items.find((item) => item.id === itemId);

    if (!originalItem) {
      throw new Error("Menu item not found");
    }

    // Create a duplicate with modified name
    const duplicateDto: CreateMenuItemDto = {
      restaurantId: originalItem.restaurantId,
      categoryIds: originalItem.categoryIds || [],
      groupTitle: originalItem.groupTitle,
      name: `${originalItem.name} (Copy)`,
      description: originalItem.description,
      price: originalItem.price,
      prepTime: originalItem.prepTime,
      discountPrice: originalItem.discountPrice,
      isDiscount: originalItem.isDiscount,
      image: originalItem.image,
      isAvailable: originalItem.isAvailable,
      allergens: originalItem.allergens || [],
      addons: originalItem.addons,
      itemDisplayOrder: originalItem.itemDisplayOrder,
      popular: originalItem.popular,
      style: originalItem.style,
      status: originalItem.status,
    };

    return this.createMenuItem(duplicateDto);
  }

  async getCategories(): Promise<MenuCategory[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/categories`);

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    return response.json();
  }

  async reorderGroups(
    restaurantId: string,
    groupSettings: { [groupTitle: string]: { displayOrder: number } }
  ): Promise<void> {
    console.log("groupSettings", groupSettings);
    const response = await fetchWithAuth(
      `${API_BASE_URL}/restaurant/menu/reorder-groups/${restaurantId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupSettings }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to reorder groups");
    }

    return response.json();
  }

  async getRestaurant(restaurantId: string): Promise<any> {
    const response = await fetchWithAuth(`${API_BASE_URL}/restaurant/${restaurantId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch restaurant");
    }

    return response.json();
  }

  // NEW PRICING API METHODS

  /**
   * Get detailed pricing breakdown for a catering order
   * Uses new clear pricing API with explicit field names
   */
  async getCateringOrderPricingBreakdown(
    orderId: string
  ): Promise<import("@/types/catering.types").PricingBreakdownDto> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/${orderId}/pricing-breakdown`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pricing breakdown");
    }

    return response.json();
  }

  /**
   * Get restaurant payout information for a catering order
   * Shows exactly what each restaurant will receive
   */
  async getCateringOrderRestaurantPayouts(
    orderId: string
  ): Promise<
    Record<string, import("@/types/catering.types").RestaurantPayoutDto>
  > {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/catering-orders/${orderId}/restaurant-payouts`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch restaurant payouts");
    }

    return response.json();
  }

  /**
   * Get detailed pricing breakdown for a corporate order
   * Uses new clear pricing API with explicit field names
   */
  async getCorporateOrderPricingBreakdown(
    orderId: string
  ): Promise<import("@/types/catering.types").PricingBreakdownDto> {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/corporate-orders/${orderId}/pricing-breakdown`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pricing breakdown");
    }

    return response.json();
  }

  /**
   * Get restaurant payout information for a corporate order
   * Shows exactly what each restaurant will receive
   */
  async getCorporateOrderRestaurantPayouts(
    orderId: string
  ): Promise<
    Record<string, import("@/types/catering.types").RestaurantPayoutDto>
  > {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/corporate-orders/${orderId}/restaurant-payouts`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch restaurant payouts");
    }

    return response.json();
  }
}

export const cateringService = new CateringService();

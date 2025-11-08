// services/catering.service.ts

import {
  SearchResponse,
  SearchFilters,
  CreateCateringOrderDto,
  OrderItemDto,
  EventDetails,
  SelectedMenuItem,
  ContactInfo,
  CateringPricingResult,
  PromoCodeValidation,
  UpdateDeliveryTimeDto,
  CateringOrderDetails,
  AddSharedAccessDto,
  RemoveSharedAccessDto,
  UpdatePickupContactDto,
  UpdateSharedAccessRoleDto,
  CreateMenuItemDto,
  MenuItemDetails,
  UpdateMenuItemDto,
  MenuCategory,
} from "@/types/catering.types";
// import { create } from "domain";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class CateringService {
  async searchMenuItems(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResponse> {
    const params = new URLSearchParams();

    if (query) params.append("q", query);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.marketId) params.append("marketId", filters.marketId);
    if (filters?.categoryId) params.append("categoryId", filters.categoryId);
    if (filters?.minRating)
      params.append("minRating", filters.minRating.toString());
    if (filters?.maxPrice)
      params.append("maxPrice", filters.maxPrice.toString());

    const response = await fetch(
      `${API_BASE_URL}/search?catering=true&${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to search menu items");
    }

    return response.json();
  }

  async getMenuItems() {
    const fullUrl = `${API_BASE_URL}/menu-item`;
    console.log("🌐 Fetching menu items from:", fullUrl);
    const response = await fetch(`${API_BASE_URL}/menu-item/catering`);
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
    }
  ) {
    const userId = await this.findOrCreateConsumerAccount(contactInfo);
    console.log(
      "submitted order with payment info",
      JSON.stringify(paymentInfo)
    );
    // Step 2: Create address
    // await this.createAddress(userId, contactInfo);

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

    // Transform to OrderItemDto format
    const orderItems: OrderItemDto[] = Object.values(groupedByRestaurant).map(
      (group: any) => {
        const restaurantTotal = group.items.reduce(
          (sum: any, item: any) => sum + item.totalPrice,
          0
        );

        return {
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          menuItems: group.items,
          status: "pending",
          restaurantCost: restaurantTotal,
          totalPrice: restaurantTotal,
          specialInstructions: eventDetails.specialRequests || "",
        };
      }
    );

    const estimatedTotal = orderItems.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    const createDto: CreateCateringOrderDto = {
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
    };
    console.log("catering req", JSON.stringify(createDto));

    const response = await fetch(`${API_BASE_URL}/catering-orders`, {
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
      const checkResponse = await fetch(
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
    const response = await fetch(`${API_BASE_URL}/consumer-user`, {
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

    console.log(
      "Creating address for user:",
      userId,
      JSON.stringify(createAddressDto)
    );
    const response = await fetch(`${API_BASE_URL}/address`, {
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
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const encodedAddress = encodeURIComponent(address);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`
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
    orderItems: OrderItemDto[],
    promoCodes?: string[]
  ): Promise<CateringPricingResult> {
    const pricingData = {
      orderItems,
      promoCodes,
    };

    console.log(
      "Calculating catering pricing:",
      JSON.stringify(pricingData, null, 2)
    );

    const response = await fetch(
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
  // New: validate a catering promo for a specific restaurant (calls GET /promotions/validate-catering)
  async validateCateringPromo(
    code: string,
    orderTotal: number,
    restaurantId: string
  ): Promise<PromoCodeValidation> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";
    const url = `${API_BASE_URL}/promotions/validate-catering?code=${encodeURIComponent(
      code
    )}&orderTotal=${encodeURIComponent(
      String(orderTotal)
    )}&restaurantId=${encodeURIComponent(restaurantId)}`;

    const res = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to validate catering promo: ${res.status} ${text}`
      );
    }
    return res.json();
  }

  async validatePromoCode(
    promoCode: string,
    orderItems: OrderItemDto[]
  ): Promise<PromoCodeValidation> {
    const subtotal = orderItems.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );
    const firstRestaurantId = orderItems[0]?.restaurantId;

    const response = await fetch(
      `${API_BASE_URL}/promotions/validate-catering?code=${promoCode}&orderTotal=${subtotal}&restaurantId=${
        firstRestaurantId || ""
      }`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) {
      return { valid: false, reason: "Failed to validate promo code" };
    }

    return response.json();
  }

  // services/catering.service.ts - Add these methods to the CateringService class

  async getOrderByToken(token: string): Promise<CateringOrderDetails> {
    const response = await fetch(
      `${API_BASE_URL}/catering-orders/view/${token}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch order");
    }

    return response.json();
  }

  async getOrdersByUserId(userId: string): Promise<CateringOrderDetails[]> {
    const response = await fetch(
      `${API_BASE_URL}/catering-orders/user/${userId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch orders");
    }

    return response.json();
  }

  async addSharedAccess(
    dto: AddSharedAccessDto
  ): Promise<CateringOrderDetails> {
    const response = await fetch(
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
    dto: UpdateSharedAccessRoleDto
  ): Promise<CateringOrderDetails> {
    const response = await fetch(
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
    dto: RemoveSharedAccessDto
  ): Promise<CateringOrderDetails> {
    const response = await fetch(
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
    dto: UpdatePickupContactDto
  ): Promise<CateringOrderDetails> {
    const response = await fetch(
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
    dto: UpdateDeliveryTimeDto
  ): Promise<CateringOrderDetails> {
    const response = await fetch(
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

  // MENU MANAGEMENT METHODS

  async getRestaurantMenuItems(
    restaurantId: string
  ): Promise<MenuItemDetails[]> {
    const url = `${API_BASE_URL}/menu-item/admin/restaurant/${restaurantId}`;
    console.log("Fetching menu items from:", url);

    const response = await fetch(url);

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
    const response = await fetch(`${API_BASE_URL}/menu-item`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const response = await fetch(`${API_BASE_URL}/menu-item/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update menu item");
    }

    return response.json();
  }

  async deleteMenuItem(itemId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/menu-item/${itemId}`, {
      method: "DELETE",
    });

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
    const response = await fetch(`${API_BASE_URL}/categories`);

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
    const response = await fetch(
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
    const response = await fetch(`${API_BASE_URL}/restaurant/${restaurantId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch restaurant");
    }

    return response.json();
  }
}

export const cateringService = new CateringService();

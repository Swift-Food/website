// components/catering/Step3ContactInfo.tsx

"use client";

import { useState, FormEvent, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCatering } from "@/context/CateringContext";
import { cateringService } from "@/services/api/catering.api";
import { CateringPricingResult, ContactInfo } from "@/types/catering.types";
import { PaymentMethodSelector } from "../PaymentMethodSelector";
import { GOOGLE_MAPS_CONFIG } from "@/lib/constants/google-maps";
import { loadGoogleMapsScript } from "@/lib/utils/google-maps-loader";
import AllMealSessionsItems from "./AllMealSessionsItems";

interface ValidationErrors {
  organization?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  zipcode?: string;
  ccEmail?: string;
  latitude?: number;
  longitude?: number;
}

export default function Step3ContactInfo() {
  const router = useRouter();
  const {
    contactInfo,
    setContactInfo,
    setCurrentStep,
    eventDetails,
    mealSessions,
    getAllItems,
    resetOrder,
    markOrderAsSubmitted,
    corporateUser,
  } = useCatering();

  // Get all items from all sessions for pricing calculations
  const selectedItems = getAllItems();

  const [formData, setFormData] = useState<ContactInfo>({
    organization: contactInfo?.organization || "",
    fullName: contactInfo?.fullName || "",
    email: contactInfo?.email || "",
    phone: contactInfo?.phone || "",
    addressLine1: contactInfo?.addressLine1 || "",
    addressLine2: contactInfo?.addressLine2 || "",
    city: contactInfo?.city || "",
    zipcode: contactInfo?.zipcode || "",
    latitude: contactInfo?.latitude,
    longitude: contactInfo?.longitude,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [promoCodes, setPromoCodes] = useState<string[]>([]);
  const [promoInput, setPromoInput] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [ccEmailInput, setCcEmailInput] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [corporateUserId, setCorporateUserId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "wallet" | "card" | null
  >(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [importantNotesOpen, setImportantNotesOpen] = useState(false);

  // Calculate estimated total without triggering state updates
  const estimatedTotal = useMemo(() => {
    return selectedItems.reduce((total, { item, quantity }) => {
      const price = parseFloat(item.price?.toString() || "0");
      const discountPrice = parseFloat(item.discountPrice?.toString() || "0");
      const unitPrice =
        item.isDiscount && discountPrice > 0 ? discountPrice : price;

      // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
      const addonTotal = (item.selectedAddons || []).reduce(
        (sum, { price, quantity }) => {
          return sum + (price || 0) * (quantity || 0);
        },
        0
      );

      return total + unitPrice * quantity + addonTotal;
    }, 0);
  }, [selectedItems]);

  const validateEmail = (email: string): string | undefined => {
    if (!email.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return undefined;
  };

  const checkCorporateUser = async () => {
    try {
      if (eventDetails?.userType === "corporate") {
        if (corporateUser) {
          setCorporateUserId(corporateUser.id);
          setOrganizationId(corporateUser.organizationId);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) {
      return "Phone number is required";
    }
    // UK phone number validation (accepts various formats)
    const cleanPhone = phone.replace(/[\s()-]/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return "Please enter a valid UK phone number";
    }
    return undefined;
  };
  const validateFullName = (name: string): string | undefined => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return undefined;
  };

  const handleBlur = (field: keyof ContactInfo) => {
    let error: string | undefined;

    switch (field) {
      case "fullName":
        error = validateFullName(formData.fullName);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "phone":
        error = validatePhone(formData.phone);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error,
    }));
  };

  // Clear error when user starts typing
  const handleChange = (field: keyof ContactInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    };

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleAddCcEmail = () => {
    const trimmedEmail = ccEmailInput.trim();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    if (ccEmails.includes(trimmedEmail)) {
      alert("This email is already added");
      return;
    }

    setCcEmails([...ccEmails, trimmedEmail]);
    setCcEmailInput("");
  };

  const handleRemoveCcEmail = (emailToRemove: string) => {
    setCcEmails(ccEmails.filter((email) => email !== emailToRemove));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions to continue");
      return;
    }

    if (!validateForm()) {
      // Scroll to first error - improved version
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find(
          (key) => errors[key as keyof ValidationErrors]
        );

        if (firstErrorField) {
          // Try multiple selectors
          const element =
            document.querySelector(`[name="${firstErrorField}"]`) ||
            document.getElementById(firstErrorField) ||
            document.querySelector(`input[name="${firstErrorField}"]`);

          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            // Focus the input to draw attention
            (element as HTMLInputElement).focus();
          } else {
            // Fallback: scroll to top of form
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }, 100); // Small delay to ensure errors are rendered

      return;
    }

    // setSubmitting(true);

    const isCorporate = await checkCorporateUser();
    if (isCorporate) {
      // Show payment modal for corporate users
      setShowPaymentModal(true);
      return;
    }

    await submitOrder();
  };

  const submitOrder = async (paymentInfo?: {
    useOrganizationWallet?: boolean;
    paymentMethodId?: string;
    paymentIntentId?: string;
  }) => {
    setSubmitting(true);

    try {
      if (!pricing) {
        console.error("ERROR: Pricing not available");
        alert("Please wait for pricing calculation to complete");
        setSubmitting(false);
        return;
      }

      setContactInfo(formData);

      const paymentData = paymentInfo
        ? {
            corporateUserId,
            organizationId,
            ...paymentInfo,
          }
        : undefined;

      const createCateringOrderResponse =
        await cateringService.submitCateringOrder(
          eventDetails!,
          mealSessions,
          formData,
          promoCodes,
          ccEmails,
          paymentData
        );

      console.log("Catering order response: ", createCateringOrderResponse);

      markOrderAsSubmitted();
      setShowPaymentModal(false);

      // Navigate to the order view page using the access token
      const accessToken = createCateringOrderResponse?.sharedAccessUsers?.[0]?.accessToken;
      if (accessToken) {
        router.push(`/event-order/view/${accessToken}`);
      } else {
        // Fallback to success screen if no token available
        setSuccess(true);
      }
    } catch (error: any) {
      console.error("=== SUBMIT ORDER ERROR ===");
      console.error("Error Type:", error?.name);
      console.error("Error Message:", error?.message);
      console.error("Error Stack:", error?.stack);
      console.error("Full Error Object:", JSON.stringify(error, null, 2));

      // Check if it's a network error
      if (
        error?.message?.includes("fetch") ||
        error?.message?.includes("network")
      ) {
        console.error("Network Error Detected");
        alert(
          "Network error: Please check your internet connection and try again."
        );
      }
      // Check if it's an API error with response
      else if (error?.response) {
        console.error(
          "API Response Error:",
          JSON.stringify(error.response, null, 2)
        );
        console.error("Status Code:", error.response.status);
        console.error("Status Text:", error.response.statusText);
        console.error(
          "Response Data:",
          JSON.stringify(error.response.data, null, 2)
        );
        alert(
          `Failed to submit order: ${
            error.response.data?.message ||
            error.response.statusText ||
            "Unknown error"
          }`
        );
      }
      // Generic error
      else {
        console.error("Unknown Error Type");
        alert(
          `Failed to submit order: ${error?.message || "Please try again."}`
        );
      }

      console.error("=== END ERROR LOG ===");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWalletPayment = async () => {
    // Validation
    if (!organizationId || !corporateUserId) {
      console.error("ERROR: Missing organization or user information");
      console.error("- Organization ID:", organizationId);
      console.error("- Corporate User ID:", corporateUserId);
      alert(
        "Missing organization or user information. Please try logging in again."
      );
      return;
    }

    if (!pricing || !pricing.total) {
      console.error("ERROR: Pricing information not available");
      console.error("Pricing:", pricing);
      alert("Pricing information not available. Please refresh and try again.");
      return;
    }

    try {
      await submitOrder({ useOrganizationWallet: true });
    } catch (error: any) {
      console.error("=== WALLET PAYMENT ERROR ===");
      console.error("Error:", error);
      console.error("Error Message:", error?.message);
      console.error("Error Stack:", error?.stack);
      console.error("=== END WALLET PAYMENT ERROR ===");
      // Error is already handled in submitOrder
    }
  };

  const handleCardPaymentComplete = async (
    paymentMethodId: string,
    paymentIntentId: string
  ) => {
    // Validation
    if (!paymentMethodId || !paymentIntentId) {
      console.error("ERROR: Missing payment information");
      console.error("- Payment Method ID:", paymentMethodId);
      console.error("- Payment Intent ID:", paymentIntentId);
      alert("Payment information missing. Please try again.");
      return;
    }

    try {
      await submitOrder({ paymentMethodId, paymentIntentId });
    } catch (error: any) {
      console.error("=== CARD PAYMENT ERROR ===");
      console.error("Error:", error);
      console.error("Error Message:", error?.message);
      console.error("Error Stack:", error?.stack);
      console.error("=== END CARD PAYMENT ERROR ===");
      // Error is already handled in submitOrder
    }
  };

  const calculatePricing = async () => {
    setCalculatingPricing(true);
    try {
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
          const discountPrice = parseFloat(
            item.discountPrice?.toString() || "0"
          );
          const unitPrice =
            item.isDiscount && discountPrice > 0 ? discountPrice : price;

          // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
          const addonTotal = (item.selectedAddons || []).reduce(
            (sum, { price, quantity }) => {
              return sum + (price || 0) * (quantity || 0);
            },
            0
          );

          // Total price includes both item price and addon price
          const itemTotalPrice = unitPrice * quantity + addonTotal;

          // Send addons as-is to backend (no quantity transformation needed)
          const transformedAddons = (item.selectedAddons || []).map(
            (addon) => ({
              ...addon,
              quantity: addon.quantity || 0,
            })
          );

          acc[restaurantId].items.push({
            menuItemId: item.id,
            menuItemName: item.menuItemName,
            groupTitle: item.groupTitle,
            quantity,
            unitPrice,
            addonPrice: addonTotal,
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

      const orderItems = Object.values(groupedByRestaurant).map(
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
          };
        }
      );

      const pricingResult = await cateringService.calculateCateringPricing(
        orderItems,
        promoCodes
      );

      if (!pricingResult.isValid) {
        alert(pricingResult.error || "Unable to calculate pricing");
        setPricing(null);
        return;
      }

      setPricing(pricingResult);

      if (!pricingResult.isValid) {
        alert(pricingResult.error || "Unable to calculate pricing");
        setPricing(null);
        return;
      }

      setPricing(pricingResult);
    } catch (error) {
      console.error("Error calculating pricing:", error);
      alert("Failed to calculate pricing. Please try again.");
      setPricing(null);
    } finally {
      setCalculatingPricing(false);
    }
  };

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Update form data when contactInfo changes (e.g., after corporate login)
  useEffect(() => {
    if (contactInfo) {
      setFormData({
        organization: contactInfo.organization || "",
        fullName: contactInfo.fullName || "",
        email: contactInfo.email || "",
        phone: contactInfo.phone || "",
        addressLine1: contactInfo.addressLine1 || "",
        addressLine2: contactInfo.addressLine2 || "",
        city: contactInfo.city || "",
        zipcode: contactInfo.zipcode || "",
        latitude: contactInfo.latitude,
        longitude: contactInfo.longitude,
      });
    }
  }, [contactInfo]);

  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCodes]);

  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return;

    setValidatingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
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
          const discountPrice = parseFloat(
            item.discountPrice?.toString() || "0"
          );
          const unitPrice =
            item.isDiscount && discountPrice > 0 ? discountPrice : price;

          // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
          const addonTotal = (item.selectedAddons || []).reduce(
            (sum, { price, quantity }) => {
              return sum + (price || 0) * (quantity || 0);
            },
            0
          );

          // Total price includes both item price and addon price
          const itemTotalPrice = unitPrice * quantity + addonTotal;

          // Send addons as-is to backend (no quantity transformation needed)
          const transformedAddons = (item.selectedAddons || []).map(
            (addon) => ({
              ...addon,
              quantity: addon.quantity || 0,
            })
          );

          acc[restaurantId].items.push({
            menuItemId: item.id,
            menuItemName: item.menuItemName,
            quantity,
            unitPrice,
            addonPrice: addonTotal,
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

      const orderItems = Object.values(groupedByRestaurant).map(
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
          };
        }
      );

      const validation = await cateringService.validatePromoCode(
        promoInput.toUpperCase(),
        orderItems
      );

      if (validation.valid) {
        if (!promoCodes.includes(promoInput.toUpperCase())) {
          setPromoCodes([...promoCodes, promoInput.toUpperCase()]);
          setPromoSuccess(
            `Promo code "${promoInput.toUpperCase()}" applied! You saved £${validation.discount?.toFixed(
              2
            )}`
          );
          setPromoInput("");
        } else {
          setPromoError("This promo code has already been applied");
        }
      } else {
        setPromoError(validation.reason || "Invalid promo code");
      }
    } catch (error) {
      console.error("Promo validation error:", error);
      setPromoError("Failed to validate promo code");
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = (codeToRemove: string) => {
    const updatedCodes = promoCodes.filter((code) => code !== codeToRemove);
    setPromoCodes(updatedCodes);
    setPromoSuccess("");
    setPromoError("");
    // The useEffect will automatically trigger calculatePricing when promoCodes changes
  };

  useEffect(() => {
    const initAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) {
        console.error("Google Maps Places not available");
        return;
      }

      autocompleteRef.current = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          // Remove types restriction or use "geocode" instead of "address"
          componentRestrictions: {
            country: GOOGLE_MAPS_CONFIG.COUNTRY_RESTRICTION,
          },
          fields: GOOGLE_MAPS_CONFIG.FIELDS,
        }
      );

      autocompleteRef.current.addListener("place_changed", handlePlaceSelect);
    };

    loadGoogleMapsScript().then(initAutocomplete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();

    if (!place || !place.address_components) {
      console.error("No place data received");
      return;
    }

    let addressLine1 = "";
    let city = "";
    let zipcode = "";
    const latitude = place.geometry?.location?.lat() || 0;
    const longitude = place.geometry?.location?.lng() || 0;

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        addressLine1 = component.long_name;
      }
      if (types.includes("route")) {
        addressLine1 += (addressLine1 ? " " : "") + component.long_name;
      }
      if (types.includes("postal_town") || types.includes("locality")) {
        city = component.long_name;
      }
      if (types.includes("postal_code")) {
        zipcode = component.long_name;
      }
    });

    setFormData((prev) => ({
      ...prev,
      addressLine1,
      city,
      zipcode,
      latitude,
      longitude,
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen bg-base-100 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">
              Thank you! Your event order request has been submitted.
            </h2>
            <p className="text-base-content/70 text-lg">
              We'll get back to you within 24 hours via your preferred contact
              method. Trusted by 90+ London university societies.
            </p>
          </div>

          <div className="bg-base-200/50 rounded-2xl p-6 md:p-8 mb-8 text-left border border-base-300">
            <h3 className="text-xl font-bold mb-6 text-base-content">
              Event & Order Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-base-300">
              <div>
                <p className="text-xs text-base-content/60 mb-1">
                  Event Date & Time
                </p>
                <p className="font-semibold text-base-content">
                  {eventDetails?.eventDate}
                </p>
                <p className="text-sm text-base-content/80">
                  {eventDetails?.eventTime}
                </p>
              </div>
              <div>
                <p className="text-xs text-base-content/60 mb-1">
                  Type of Event
                </p>
                <p className="font-semibold text-base-content capitalize">
                  {eventDetails?.eventType}
                </p>
              </div>
              {/* <div> */}
              {/* <p className="text-xs text-base-content/60 mb-1">Guest Count</p>
                <p className="font-semibold text-base-content">
                  {(eventDetails?.guestCount || 10) - 10} -{" "}
                  {(eventDetails?.guestCount || 10) + 10}{" "}
                </p>
              </div> */}
            </div>

            <h4 className="font-bold mb-4 text-base-content">Your List</h4>

            {promoCodes.length > 0 && (
              <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl">
                <p className="text-sm text-success font-medium">
                  ✓ Promo codes applied: {promoCodes.join(", ")}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {selectedItems.map(({ item, quantity }, index) => {
                const price = parseFloat(item.price?.toString() || "0");
                const discountPrice = parseFloat(
                  item.discountPrice?.toString() || "0"
                );
                const itemPrice =
                  item.isDiscount && discountPrice > 0 ? discountPrice : price;

                // USE ITEM'S OWN VALUES:
                const BACKEND_QUANTITY_UNIT = item.cateringQuantityUnit || 7;
                const displayFeeds = quantity / BACKEND_QUANTITY_UNIT;

                // Addon total = sum of (addonPrice × addonQuantity) - no scaling multipliers
                const addonTotal = (item.selectedAddons || []).reduce(
                  (sum, { price, quantity }) => {
                    return sum + (price || 0) * (quantity || 0);
                  },
                  0
                );

                const subtotal = itemPrice * quantity + addonTotal;

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-base-100 rounded-xl"
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.menuItemName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base-content truncate">
                        {item.menuItemName}
                      </p>
                      {item.selectedAddons &&
                        item.selectedAddons.length > 0 && (
                          <p className="text-xs text-base-content/50 mb-1">
                            {item.selectedAddons.map((addon, idx) => (
                              <span key={idx}>
                                + {addon.name}
                                {addon.quantity > 1 && ` (×${addon.quantity})`}
                                {idx < item.selectedAddons!.length - 1
                                  ? ", "
                                  : ""}
                              </span>
                            ))}
                          </p>
                        )}
                      <p className="text-sm text-base-content/60">
                        {displayFeeds} portions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        £{subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {pricing && (
              <div className="space-y-2 pt-4 border-t border-base-300">
                {/* Subtotal */}
                <div className="flex justify-between text-sm text-base-content/70">
                  <span>Subtotal</span>
                  <span>£{pricing.subtotal.toFixed(2)}</span>
                </div>

                {/* Restaurant Promotion Discount - FROM BACKEND */}
                {(pricing.restaurantPromotionDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-semibold">
                    <span>Restaurant Promotion</span>
                    <span>
                      -£{pricing.restaurantPromotionDiscount!.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Delivery fee */}
                <div className="flex justify-between text-sm text-base-content/70">
                  <span>Delivery Cost</span>
                  <span>£{pricing.deliveryFee.toFixed(2)}</span>
                </div>

                {/* Promo code discount */}
                {(pricing.promoDiscount ?? 0) > 0 && (
                  <div className="flex justify-between text-sm text-success font-medium">
                    <span>Promo Code Discount</span>
                    <span>-£{pricing.promoDiscount!.toFixed(2)}</span>
                  </div>
                )}

                {/* Total - Now correct from backend */}
                <div className="flex justify-between text-lg font-bold text-base-content pt-3 border-t border-base-300">
                  <span>Total</span>
                  <div className="text-right">
                    <p className="">£{pricing.total.toFixed(2)}</p>
                    {(pricing.totalDiscount ?? 0) > 0 && (
                      <p className="text-xs line-through text-base-content/50">
                        £{(pricing.subtotal + pricing.deliveryFee).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetOrder}
              className="bg-base-300 hover:opacity-90 text-base-content px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              Back to Home
            </button>
            <a
              href="https://www.instagram.com/swiftfood_uk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-dark-pink hover:bg-base-content/10 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all inline-block text-center"
            >
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Progress Bar */}
      <div className="w-full bg-base-100 h-2">
        <div
          className="h-2 transition-all duration-300"
          style={{ width: "100%" }}
        ></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              {/* <p className="text-sm text-base-content/60 mb-2">
                Step 3 of 3 - Contact & Confirmation
              </p> */}
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">
                Your Contact Details
              </h2>
              <p className="text-base-content/70">
                Please provide your contact details so we can confirm your event
                order request.
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-primary hover:opacity-80 font-medium flex items-center gap-1 mt-1"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Selected Items - Left Side */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <AllMealSessionsItems showActions={false} />
          </div>

          {/* Contact Form Card - Right Side */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300">
              <h3 className="text-xl font-bold mb-6 text-base-content">
                Contact Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Organization */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={(e) => handleChange("organization", e.target.value)}
                    onBlur={() => handleBlur("organization")}
                    placeholder="Your Organization Name"
                    className={`w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">
                    Name*
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    placeholder="Your Name"
                    className={`w-full px-4 py-3 bg-base-200/50 border ${
                      errors.fullName ? "border-error" : "border-base-300"
                    } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-error">✗ {errors.fullName}</p>
                  )}
                </div>

                {/* Telephone */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">
                    Telephone*
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="Your Number"
                    className={`w-full px-4 py-3 bg-base-200/50 border ${
                      errors.phone ? "border-error" : "border-base-300"
                    } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-error">✗ {errors.phone}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">
                    Email*
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="Your Email"
                    className={`w-full px-4 py-3 bg-base-200/50 border ${
                      errors.email ? "border-error" : "border-base-300"
                    } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error">✗ {errors.email}</p>
                  )}
                </div>

                {/* CC Additional Emails */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">
                    CC Additional Emails (Optional)
                  </label>
                  <p className="text-xs text-base-content/60 mb-3">
                    Add additional email addresses to receive order updates
                  </p>

                  <div className="flex gap-2 mb-3">
                    <input
                      type="email"
                      value={ccEmailInput}
                      onChange={(e) => setCcEmailInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCcEmail();
                        }
                      }}
                      placeholder="additional@email.com"
                      className="flex-1 px-4 py-2 bg-base-200/50 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddCcEmail}
                      className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all text-sm"
                    >
                      Add
                    </button>
                  </div>

                  {ccEmails.length > 0 && (
                    <div className="space-y-2">
                      {ccEmails.map((email, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300"
                        >
                          <span className="text-sm text-base-content">
                            {email}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCcEmail(email)}
                            className="text-error hover:opacity-80 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promo Code Section */}
                <div className="pt-4 border-t border-base-300">
                  <h4 className="font-semibold mb-3 text-base-content">
                    Discount Code
                  </h4>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) =>
                        setPromoInput(e.target.value.toUpperCase())
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyPromoCode();
                        }
                      }}
                      placeholder="Add discount code or voucher"
                      className="flex-1 px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromoCode}
                      disabled={validatingPromo || !promoInput.trim()}
                      className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:bg-base-300 disabled:cursor-not-allowed text-sm"
                    >
                      {validatingPromo ? "..." : "Apply"}
                    </button>
                  </div>

                  {promoError && (
                    <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg">
                      <p className="text-xs text-error">✗ {promoError}</p>
                    </div>
                  )}

                  {promoSuccess && (
                    <div className="mb-3 p-2 bg-success/10 border border-success/30 rounded-lg">
                      <p className="text-xs text-success">✓ {promoSuccess}</p>
                    </div>
                  )}

                  {promoCodes.length > 0 && (
                    <div className="space-y-2">
                      {promoCodes.map((code) => (
                        <div
                          key={code}
                          className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300"
                        >
                          <span className="font-mono text-xs font-medium text-primary">
                            {code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePromoCode(code)}
                            className="text-error hover:opacity-80 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-base-content/60 mt-2">
                    If your organisation is partnered with us, please contact us
                    for vouchers before payment.
                  </p>
                </div>

                {/* Pricing Summary */}
                {calculatingPricing && (
                  <div className="text-center py-4 text-base-content/60 text-sm">
                    Calculating pricing...
                  </div>
                )}

                {pricing && (
                  <div className="space-y-2 pt-4 border-t border-base-300">
                    {/* Show subtotal */}
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Subtotal</span>
                      <span>£{pricing.subtotal.toFixed(2)}</span>
                    </div>

                    {/* Show promotion discount if active */}
                    {(pricing.restaurantPromotionDiscount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-semibold">
                        <span>Restaurant Promotion</span>
                        <span>-£{pricing.restaurantPromotionDiscount!.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Delivery fee */}
                    <div className="flex justify-between text-sm text-base-content/70">
                      <span>Delivery Cost</span>
                      <span>£{pricing.deliveryFee.toFixed(2)}</span>
                    </div>

                    {/* Promo code discount */}
                    {(pricing.promoDiscount ?? 0) > 0 && (
                      <div className="flex justify-between text-sm text-success font-medium">
                        <span>Promo Code Discount</span>
                        <span>-£{pricing.promoDiscount!.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Total */}
                    <div className="flex justify-between text-lg font-bold text-base-content pt-3 border-t border-base-300">
                      <span>Total</span>
                      <div className="text-right">
                        <p className="">£{pricing.total.toFixed(2)}</p>
                        {(pricing.totalDiscount ?? 0) > 0 && (
                          <p className="text-xs line-through text-base-content/50">
                            £{(pricing.subtotal + pricing.deliveryFee).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!pricing && !calculatingPricing && (
                  <div className="flex justify-between pt-4 border-t border-base-300">
                    <span className="font-semibold text-base-content">
                      Estimated Total:
                    </span>
                    <span className="font-bold text-xl text-base-content">
                      £{estimatedTotal.toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Important Notes */}
                <div className="pt-4">
                  <button
                    type="button"
                    className="w-full bg-warning/10 border border-warning/30 rounded-xl p-4 flex items-center justify-between focus:outline-none group"
                    onClick={() => setImportantNotesOpen((open) => !open)}
                    aria-expanded={importantNotesOpen}
                    aria-controls="important-notes-content"
                  >
                    <span className="text-xs font-semibold text-warning">
                      Important Notes
                    </span>
                    <span className="ml-2 text-warning group-hover:underline flex items-center">
                      <svg
                        className={`transition-transform duration-200 w-4 h-4 ${
                          importantNotesOpen ? "rotate-180" : "rotate-0"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </button>
                  {importantNotesOpen && (
                    <div
                      id="important-notes-content"
                      className="mt-2 text-xs text-base-content/80 leading-relaxed"
                    >
                      <p>
                        For accurate allergen information, please contact stalls
                        or restaurants directly.
                      </p>
                      <p>
                        For any last-minute changes, please contact us at least
                        two days before your event.
                      </p>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="pt-4">
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-base-300 text-dark-pink focus:ring-2 focus:ring-dark-pink cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-base-content/80 cursor-pointer"
                    >
                      I accept the{" "}
                      <a
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-pink hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Terms and Conditions
                      </a>
                      *
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting || !termsAccepted}
                  className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Payment Modal JSX */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-base-100 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-base-100 border-b border-base-300 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-base-content">
                  Select Payment Method
                </h3>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPaymentMethod(null);
                  }}
                  className="text-base-content/60 hover:text-base-content"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                  <p className="text-sm text-base-content/70 mb-2">
                    Order Total
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    £{pricing?.total.toFixed(2)}
                  </p>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedPaymentMethod("wallet")}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPaymentMethod === "wallet"
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content">
                            Organization Wallet
                          </p>
                          <p className="text-sm text-base-content/60">
                            Pay from your organization balance
                          </p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "wallet" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={() => setSelectedPaymentMethod("card")}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedPaymentMethod === "card"
                        ? "border-primary bg-primary/10"
                        : "border-base-300 hover:border-base-content/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content">
                            Credit/Debit Card
                          </p>
                          <p className="text-sm text-base-content/60">
                            Pay securely with Stripe
                          </p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "card" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* ONLY show PaymentMethodSelector for CARD payment */}
                {selectedPaymentMethod === "card" && (
                  <PaymentMethodSelector
                    organizationId={organizationId}
                    managerId={corporateUserId}
                    amount={pricing?.total || 0}
                    onPaymentComplete={handleCardPaymentComplete}
                    onCancel={() => setShowPaymentModal(false)}
                  />
                )}

                {/* Wallet Confirm Button - NO Stripe needed */}
                {selectedPaymentMethod === "wallet" && (
                  <button
                    onClick={handleWalletPayment}
                    disabled={submitting}
                    className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        Processing Payment...
                      </>
                    ) : (
                      `Pay £${pricing?.total.toFixed(2)} from Wallet`
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Submit Button (Below Form) */}
        {/* <div className="lg:hidden mt-6">
          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-full font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div> */}
      </div>
    </div>
  );
}

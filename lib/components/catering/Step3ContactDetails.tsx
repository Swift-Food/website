// components/catering/Step3ContactInfo.tsx

"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCatering } from "@/context/CateringContext";
import { cateringService } from "@/services/api/catering.api";
import { CateringPricingResult, ContactInfo } from "@/types/catering.types";
import { PaymentMethodSelector } from "../PaymentMethodSelector";
import AllMealSessionsItems from "./AllMealSessionsItems";
import { openMenuPreview, LocalMealSession } from "@/lib/utils/menuPdfUtils";
import DeliveryAddressForm from "./contact/DeliveryAddressForm";
import ContactInfoForm from "./contact/ContactInfoForm";
import PromoCodeSection from "./contact/PromoCodeSection";
import PricingSummary from "./contact/PricingSummary";

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
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [corporateUserId, setCorporateUserId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "wallet" | "card" | null
  >(null);

  const [importantNotesOpen, setImportantNotesOpen] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

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

  // UK Postcode validation regex
  const UK_POSTCODE_REGEX = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s?(\d[A-Z]{2})$/i;

  const validateUKPostcode = (postcode: string): boolean => {
    if (!postcode) return false;
    return UK_POSTCODE_REGEX.test(postcode.trim());
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      fullName: validateFullName(formData.fullName),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
    };

    // Validate address fields for guest users
    if (eventDetails?.userType === "guest") {
      if (!formData.addressLine1?.trim()) {
        newErrors.addressLine1 = "Address Line 1 is required";
      }
      if (!formData.city?.trim()) {
        newErrors.city = "City is required";
      }
      if (!formData.zipcode?.trim()) {
        newErrors.zipcode = "Postcode is required";
      } else if (!validateUKPostcode(formData.zipcode)) {
        newErrors.zipcode = "Please enter a valid UK postcode (e.g., SW1A 1AA)";
      }
    }

    setErrors(newErrors);

    // Return true if no errors
    return !Object.values(newErrors).some((error) => error !== undefined);
  };

  const handleAddCcEmail = (email: string) => {
    setCcEmails([...ccEmails, email]);
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

      // console.log("Catering order response: ", createCateringOrderResponse);

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
      // Use meal sessions for pricing calculation to get proper per-session delivery fees
      const pricingResult = await cateringService.calculateCateringPricingWithMealSessions(
        mealSessions,
        promoCodes
      );

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
  }, [promoCodes, mealSessions]);

  const handleApplyPromoCode = async (code: string) => {
    setValidatingPromo(true);
    setPromoError("");
    setPromoSuccess("");

    try {
      // Use meal sessions format for promo validation
      const validation = await cateringService.validatePromoCodeWithMealSessions(
        code,
        mealSessions
      );

      if (validation.valid) {
        if (!promoCodes.includes(code)) {
          setPromoCodes([...promoCodes, code]);
          setPromoSuccess(`Promo code "${code}" applied!`);
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

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (!place || !place.address_components) {
      console.error("No place data received");
      return;
    }

    // Store place_id for validation
    if (place.place_id) {
      setSelectedPlaceId(place.place_id);
    }

    let addressLine1 = "";
    let city = "";
    let zipcode = "";
    let country = "";
    const latitude = place.geometry?.location?.lat() || 0;
    const longitude = place.geometry?.location?.lng() || 0;

    place.address_components.forEach((component) => {
      const types = component.types;

      if (types.includes("street_number")) {
        addressLine1 = component.long_name + " ";
      }
      if (types.includes("route")) {
        addressLine1 += component.long_name;
      }
      if (types.includes("postal_town") || types.includes("locality")) {
        city = component.long_name;
      }
      if (types.includes("postal_code")) {
        zipcode = component.long_name;
      }
      if (types.includes("country")) {
        country = component.short_name;
      }
    });

    // Validate if address is in UK
    if (country && country !== "GB") {
      setErrors((prev) => ({
        ...prev,
        addressLine1: "Sorry, we only deliver to addresses within the United Kingdom.",
      }));
    } else {
      // Clear address errors
      setErrors((prev) => ({
        ...prev,
        addressLine1: undefined,
        city: undefined,
        zipcode: undefined,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      addressLine1: addressLine1.trim(),
      city,
      zipcode,
      latitude,
      longitude,
    }));
  };


  // Handle view menu preview
  const handleViewMenu = () => {
    // Convert mealSessions to LocalMealSession format
    const sessionsForPreview: LocalMealSession[] = mealSessions.map((session) => ({
      sessionName: session.sessionName,
      sessionDate: session.sessionDate,
      eventTime: session.eventTime,
      orderItems: session.orderItems.map((orderItem) => ({
        item: {
          id: orderItem.item.id,
          menuItemName: orderItem.item.menuItemName,
          price: orderItem.item.price,
          discountPrice: orderItem.item.discountPrice,
          isDiscount: orderItem.item.isDiscount,
          image: orderItem.item.image,
          restaurantId: orderItem.item.restaurantId,
          cateringQuantityUnit: orderItem.item.cateringQuantityUnit,
          feedsPerUnit: orderItem.item.feedsPerUnit,
          categoryName: orderItem.item.categoryName,
          subcategoryName: orderItem.item.subcategoryName,
          selectedAddons: orderItem.item.selectedAddons,
        },
        quantity: orderItem.quantity,
      })),
    }));

    openMenuPreview(sessionsForPreview, formData.fullName, formData.organization);
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
              method. You will receive a payment link once the order is confirmed by the restaurants. Trusted by 90+ London university societies.
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
              onClick={() => setCurrentStep(1)}
              className="text-primary hover:opacity-80 font-medium flex items-center gap-1"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Selected Items - Left Side */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <AllMealSessionsItems showActions={false} onViewMenu={handleViewMenu} />
          </div>

          {/* Contact Form Card - Right Side */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300">
              <h3 className="text-xl font-bold mb-6 text-base-content">
                Contact & Delivery Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Delivery Address Section - Only for guest users */}
       
                <DeliveryAddressForm
                  formData={formData}
                  errors={errors}
                  onFieldChange={handleChange}
                  onPlaceSelect={handlePlaceSelect}
                  hasValidAddress={selectedPlaceId !== null && formData.addressLine1 !== ""}
                />
     

                {/* Contact Details Section */}
                <ContactInfoForm
                  formData={formData}
                  errors={errors}
                  onFieldChange={handleChange}
                  onBlur={handleBlur}
                  ccEmails={ccEmails}
                  onAddCcEmail={handleAddCcEmail}
                  onRemoveCcEmail={handleRemoveCcEmail}
                />

                {/* Promo Code Section */}
                <PromoCodeSection
                  promoCodes={promoCodes}
                  onApplyPromoCode={handleApplyPromoCode}
                  onRemovePromoCode={handleRemovePromoCode}
                  validatingPromo={validatingPromo}
                  promoError={promoError}
                  promoSuccess={promoSuccess}
                  promoDiscount={pricing?.promoDiscount}
                />

                {/* Pricing Summary */}
                <PricingSummary
                  pricing={pricing}
                  calculatingPricing={calculatingPricing}
                  estimatedTotal={estimatedTotal}
                />

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

"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import { useCatering } from "@/context/CateringContext";
import { PaymentMethodSelector } from "../PaymentMethodSelector";

// Feature-specific imports
import { useContactForm } from "@/features/contact-details/hooks/useContactForm";
import { usePromoCode } from "@/features/contact-details/hooks/usePromoCode";
import { useAddressAutocomplete } from "@/features/contact-details/hooks/useAddressAutocomplete";
import { useCcEmails } from "@/features/contact-details/hooks/useCcEmails";
import { contactDetailsPricingService } from "@/features/contact-details/services/pricing.service";
import { orderSubmissionService } from "@/features/contact-details/services/order-submission.service";
import { ContactForm } from "@/features/contact-details/components/ContactForm";
import { CcEmailInput } from "@/features/contact-details/components/CcEmailInput";
import { PromoCodeInput } from "@/features/contact-details/components/PromoCodeInput";
import { EventDetailsSummary } from "@/features/contact-details/components/EventDetailsSummary";
import { ImportantNotes } from "@/features/contact-details/components/ImportantNotes";
import { OrderItemsList } from "@/features/contact-details/components/OrderItemsList";
import { PricingSummary } from "@/features/contact-details/components/PricingSummary";
import { TermsCheckbox } from "@/features/contact-details/components/TermsCheckbox";
import { SuccessScreen } from "@/features/contact-details/components/SuccessScreen";
import { CateringPricingResult } from "@/types/catering.types";

export default function Step3ContactInfo() {
  const {
    contactInfo,
    setContactInfo,
    setCurrentStep,
    eventDetails,
    selectedItems,
    resetOrder,
    markOrderAsSubmitted,
    corporateUser,
    subtotalBeforeDiscount,
    promotionDiscount,
  } = useCatering();

  // Form state
  const {
    formData,
    errors,
    handleChange,
    handleBlur,
    validateForm,
    updateFormData,
  } = useContactForm(contactInfo);

  // CC Emails state
  const {
    ccEmails,
    ccEmailInput,
    setCcEmailInput,
    handleAddCcEmail,
    handleRemoveCcEmail,
  } = useCcEmails();

  // Promo code state
  const {
    promoInput,
    validatingPromo,
    promoError,
    promoSuccess,
    setPromoInput,
    handleApplyPromoCode,
    handleRemovePromoCode,
  } = usePromoCode();

  // Address autocomplete - destructure but don't use inputRef directly
  useAddressAutocomplete((address) => {
    updateFormData(address);
  });

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Pricing state
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [corporateUserId, setCorporateUserId] = useState<string>("");
  const [organizationId, setOrganizationId] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"wallet" | "card" | null>(null);

  // Calculate estimated total
  const estimatedTotal = useMemo(() => {
    return contactDetailsPricingService.calculateEstimatedTotal(selectedItems);
  }, [selectedItems]);

  // Check if user is corporate
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

  // Calculate pricing whenever promo codes change
  const calculatePricing = async () => {
    setCalculatingPricing(true);
    const pricingResult = await contactDetailsPricingService.calculatePricing(
      selectedItems,
      promoCodes
    );
    setPricing(pricingResult);
    setCalculatingPricing(false);
  };

  // Handle promo code application
  const handlePromoCodeApply = async () => {
    const groupedItems = contactDetailsPricingService['groupItemsByRestaurant'](selectedItems);
    const orderItems = contactDetailsPricingService['buildOrderItems'](groupedItems);
    await handleApplyPromoCode(orderItems);
  };

  // Submit order
  const submitOrder = async (paymentInfo?: {
    useOrganizationWallet?: boolean;
    paymentMethodId?: string;
    paymentIntentId?: string;
  }) => {
    setSubmitting(true);

    try {
      if (!pricing) {
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

      await orderSubmissionService.submitOrder(
        eventDetails!,
        selectedItems,
        formData,
        promoCodes,
        ccEmails,
        paymentData
      );

      markOrderAsSubmitted();
      setSuccess(true);
      setShowPaymentModal(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle wallet payment
  const handleWalletPayment = async () => {
    if (!organizationId || !corporateUserId) {
      alert("Missing organization or user information. Please try logging in again.");
      return;
    }

    if (!pricing || !pricing.total) {
      alert("Pricing information not available. Please refresh and try again.");
      return;
    }

    await submitOrder({ useOrganizationWallet: true });
  };

  // Handle card payment
  const handleCardPaymentComplete = async (
    paymentMethodId: string,
    paymentIntentId: string
  ) => {
    if (!paymentMethodId || !paymentIntentId) {
      alert("Payment information missing. Please try again.");
      return;
    }

    await submitOrder({ paymentMethodId, paymentIntentId });
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions to continue");
      return;
    }

    if (!validateForm()) {
      // Scroll to first error
      setTimeout(() => {
        const firstErrorField = Object.keys(errors).find((key) => errors[key as keyof typeof errors]);

        if (firstErrorField) {
          const element =
            document.querySelector(`[name="${firstErrorField}"]`) ||
            document.getElementById(firstErrorField) ||
            document.querySelector(`input[name="${firstErrorField}"]`);

          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
            (element as HTMLInputElement).focus();
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }, 100);

      return;
    }

    const isCorporate = await checkCorporateUser();
    if (isCorporate) {
      setShowPaymentModal(true);
      return;
    }

    await submitOrder();
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Update form when contactInfo changes
  useEffect(() => {
    if (contactInfo) {
      updateFormData(contactInfo);
    }
  }, [contactInfo]);

  // Calculate pricing when promo codes change
  useEffect(() => {
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCodes]);

  // Show success screen
  if (success) {
    return (
      <SuccessScreen
        eventDetails={eventDetails}
        selectedItems={selectedItems}
        promoCodes={promoCodes}
        pricing={pricing}
        onReset={resetOrder}
      />
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-base-100">
      {/* Progress Bar */}
      <div className="w-full bg-base-100 h-2">
        <div className="h-2 transition-all duration-300" style={{ width: "100%" }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">
                Your Contact Details
              </h2>
              <p className="text-base-content/70">
                Please provide your contact details so we can confirm your event order request.
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
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <ContactForm
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <CcEmailInput
                ccEmails={ccEmails}
                ccEmailInput={ccEmailInput}
                setCcEmailInput={setCcEmailInput}
                onAddEmail={handleAddCcEmail}
                onRemoveEmail={handleRemoveCcEmail}
              />

              {/* Terms - Desktop */}
              <div className="hidden lg:block pt-4">
                <TermsCheckbox
                  termsAccepted={termsAccepted}
                  onToggle={setTermsAccepted}
                  id="terms-desktop"
                />
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block">
                <button
                  type="submit"
                  disabled={submitting || !termsAccepted}
                  className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300 sticky top-4">
              <h3 className="text-xl font-bold mb-6 text-base-content">
                Event & Order Summary
              </h3>

              <p className="text-sm text-base-content/70 mb-4">
                Review your event details and order summary before submitting your request.
              </p>

              <EventDetailsSummary eventDetails={eventDetails} />

              <h4 className="font-bold mb-4 text-base-content">Your List</h4>

              <ImportantNotes />

              <PromoCodeInput
                promoCodes={promoCodes}
                promoInput={promoInput}
                validatingPromo={validatingPromo}
                promoError={promoError}
                promoSuccess={promoSuccess}
                onPromoInputChange={setPromoInput}
                onApplyPromoCode={handlePromoCodeApply}
                onRemovePromoCode={handleRemovePromoCode}
              />

              <OrderItemsList selectedItems={selectedItems} />

              <PricingSummary
                pricing={pricing}
                calculatingPricing={calculatingPricing}
                estimatedTotal={estimatedTotal}
                subtotalBeforeDiscount={subtotalBeforeDiscount}
                promotionDiscount={promotionDiscount}
              />

              {/* Terms - Mobile */}
              <div className="lg:hidden mt-6">
                <TermsCheckbox
                  termsAccepted={termsAccepted}
                  onToggle={setTermsAccepted}
                  id="terms-mobile"
                />
              </div>

              {/* Mobile Submit Button */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={submitting || !termsAccepted}
                  onClick={handleSubmit}
                  className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-xl font-bold text-lg transition-all disabled:bg-base-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-base-200/50 rounded-xl p-4 border border-base-300">
                  <p className="text-sm text-base-content/70 mb-2">Order Total</p>
                  <p className="text-2xl font-bold text-primary">£{pricing?.total.toFixed(2)}</p>
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
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content">Organization Wallet</p>
                          <p className="text-sm text-base-content/60">Pay from your organization balance</p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "wallet" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-base-content">Credit/Debit Card</p>
                          <p className="text-sm text-base-content/60">Pay securely with Stripe</p>
                        </div>
                      </div>
                      {selectedPaymentMethod === "card" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                {/* Payment Method Components */}
                {selectedPaymentMethod === "card" && (
                  <PaymentMethodSelector
                    organizationId={organizationId}
                    managerId={corporateUserId}
                    amount={pricing?.total || 0}
                    onPaymentComplete={handleCardPaymentComplete}
                    onCancel={() => setShowPaymentModal(false)}
                  />
                )}

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
      </div>
    </div>
  );
}

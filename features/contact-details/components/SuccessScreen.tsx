import { EventDetails } from '@/types/catering.types';
import { CateringPricingResult } from '@/types/catering.types';

interface MenuItem {
  menuItemName: string;
  image?: string;
  price: string | number;
  discountPrice?: string | number;
  isDiscount?: boolean;
  feedsPerUnit?: number;
  cateringQuantityUnit?: number;
  selectedAddons?: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface SelectedItem {
  item: MenuItem;
  quantity: number;
}

interface SuccessScreenProps {
  eventDetails: EventDetails | null;
  selectedItems: SelectedItem[];
  promoCodes: string[];
  pricing: CateringPricingResult | null;
  onReset: () => void;
}

export function SuccessScreen({
  eventDetails,
  selectedItems,
  promoCodes,
  pricing,
  onReset,
}: SuccessScreenProps) {
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
            We'll get back to you within 24 hours via your preferred contact method. Trusted
            by 90+ London university societies.
          </p>
        </div>

        <div className="bg-base-200/50 rounded-2xl p-6 md:p-8 mb-8 text-left border border-base-300">
          <h3 className="text-xl font-bold mb-6 text-base-content">
            Event & Order Summary
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-base-300">
            <div>
              <p className="text-xs text-base-content/60 mb-1">Event Date & Time</p>
              <p className="font-semibold text-base-content">{eventDetails?.eventDate}</p>
              <p className="text-sm text-base-content/80">{eventDetails?.eventTime}</p>
            </div>
            <div>
              <p className="text-xs text-base-content/60 mb-1">Type of Event</p>
              <p className="font-semibold text-base-content capitalize">
                {eventDetails?.eventType}
              </p>
            </div>
          </div>

          <h4 className="font-bold mb-4 text-base-content">Your List</h4>

          {promoCodes.length > 0 && (
            <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl">
              <p className="text-sm text-success font-medium">
                ✓ Promo codes applied: {promoCodes.join(', ')}
              </p>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {selectedItems.map(({ item, quantity }, index) => {
              const price = parseFloat(item.price?.toString() || '0');
              const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
              const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;

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
                    <p className="font-semibold text-base-content truncate">{item.menuItemName}</p>
                    {item.selectedAddons && item.selectedAddons.length > 0 && (
                      <p className="text-xs text-base-content/50 mb-1">
                        {item.selectedAddons.map((addon, idx) => (
                          <span key={idx}>
                            + {addon.name}
                            {addon.quantity > 1 && ` (×${addon.quantity})`}
                            {idx < item.selectedAddons!.length - 1 ? ', ' : ''}
                          </span>
                        ))}
                      </p>
                    )}
                    <p className="text-sm text-base-content/60">{displayFeeds} portions</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">£{subtotal.toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {pricing && (
            <div className="space-y-2 pt-4 border-t border-base-300">
              <div className="flex justify-between text-sm text-base-content/70">
                <span>Subtotal</span>
                <span>£{pricing.subtotal.toFixed(2)}</span>
              </div>

              {(pricing.restaurantPromotionDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-semibold">
                  <span>Restaurant Promotion</span>
                  <span>-£{pricing.restaurantPromotionDiscount!.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm text-base-content/70">
                <span>Delivery Cost</span>
                <span>£{pricing.deliveryFee.toFixed(2)}</span>
              </div>

              {(pricing.promoDiscount ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-success font-medium">
                  <span>Promo Code Discount</span>
                  <span>-£{pricing.promoDiscount!.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-lg font-bold text-base-content pt-3 border-t border-base-300">
                <span>Total</span>
                <div className="text-right">
                  <p>£{pricing.total.toFixed(2)}</p>
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
            onClick={onReset}
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

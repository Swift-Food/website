"use client";

/**
 * Live preview of the customer-facing restaurant card.
 *
 * Mirrors the card rendered in the catering-widget's RestaurantMenuBrowser
 * (banner on top, details below, circular logo overlay). Rating, distance and
 * price tier aren't editable in settings, so they're shown as static sample
 * values to communicate layout only.
 */

interface RestaurantCardPreviewProps {
  restaurantName: string;
  images: string[];
  logoImageUrl?: string;
  tags: string[];
  /** Human-readable cuisine label, used as the subtitle fallback when no tags exist. */
  cuisineLabel?: string;
}

const SAMPLE_RATING = "4.0";
const SAMPLE_DISTANCE = "1.5 mi";
const SAMPLE_PRICE_RANGE = "Premium";
const SAMPLE_SUBTITLE = "Asian - Bento Box";

export const RestaurantCardPreview = ({
  restaurantName,
  images,
  logoImageUrl,
  tags,
  cuisineLabel,
}: RestaurantCardPreviewProps) => {
  const name = restaurantName.trim() || "Your Restaurant";
  const bannerImage = images?.[0];

  const cleanTags = tags?.filter(Boolean) ?? [];
  const subtitle =
    cleanTags.length > 0
      ? cleanTags.slice(0, 3).join(" - ")
      : cuisineLabel?.trim() || SAMPLE_SUBTITLE;

  return (
    <div>
      <label className="block text-lg font-bold text-gray-900 mb-2">
        Preview
      </label>
      <p className="text-sm text-gray-500 mb-4">
        How your card appears to customers. Rating, distance and price tier are
        sample values.
      </p>

      <div className="max-w-sm rounded-xl border border-base-300 bg-white shadow-sm">
        <div className="overflow-hidden rounded-xl bg-white">
          {/* Banner */}
          {bannerImage ? (
            <div className="relative aspect-video w-full bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bannerImage}
                alt={name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative flex aspect-video w-full items-center justify-center bg-base-200">
              <span className="text-3xl font-bold text-gray-300">
                {name.charAt(0)}
              </span>
            </div>
          )}

          {/* Details */}
          <div className="min-w-0 flex-1 p-3 flex flex-col relative">
            {logoImageUrl && (
              <div className="absolute top-1/2 right-2 -translate-y-1/2 w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <p className="line-clamp-2 text-sm font-semibold leading-tight text-gray-900 pr-14">
              {name}
            </p>

            <div className="mt-auto pt-2 flex flex-col gap-1.5">
              <div className="min-h-[18px] flex items-center gap-2">
                <span className="flex items-center gap-0.5 text-[11px] text-gray-500">
                  <span className="text-yellow-400">★</span>
                  {SAMPLE_RATING}
                </span>
                <span className="text-gray-300 text-[11px]">·</span>
                <span className="text-[11px] text-gray-500">
                  {SAMPLE_DISTANCE}
                </span>
                <span className="text-gray-300 text-[11px]">·</span>
                <span className="text-[11px] text-gray-500">
                  {SAMPLE_PRICE_RANGE}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

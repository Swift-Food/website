"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Clock, Users, ImageOff, ChevronRight } from "lucide-react";
import type { NoticeHoursGroupItem } from "../hooks/useOrderTimingState";

interface Props {
  item: NoticeHoursGroupItem | null;
  groupTitle: string;
  restaurantId: string;
  onClose: () => void;
}

const formatPrice = (price: number | undefined): string => {
  if (typeof price !== "number" || !Number.isFinite(price)) return "";
  return `£${price.toFixed(2)}`;
};

const formatPrepTime = (mins: number | null | undefined): string | null => {
  if (typeof mins !== "number" || !Number.isFinite(mins) || mins <= 0) return null;
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
};

const formatFeeds = (n: number | null | undefined): string | null => {
  if (typeof n !== "number" || !Number.isFinite(n) || n <= 0) return null;
  return `Feeds ${n}`;
};

const humaniseTag = (raw: string): string =>
  raw
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Read-only peek of a menu item — image, price, prep-time badge, description,
 * dietary/allergen chips, and a link to the actual edit page. Kept out of
 * OrderTimingTab.tsx so a future settings screen can reuse it.
 */
export const MenuItemPreviewModal = ({
  item,
  groupTitle,
  restaurantId,
  onClose,
}: Props) => {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    // Lock scroll on the underlying page while modal is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  const image = item.images?.[0];
  const prep = formatPrepTime(item.prepTime);
  const feeds = formatFeeds(item.feedsPerUnit);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-item-preview-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image area — full-bleed hero, or a neutral fallback */}
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 aspect-[16/9] flex items-center justify-center flex-shrink-0">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image}
              alt={item.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageOff size={32} />
              <span className="text-xs font-medium">No image</span>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
                {groupTitle}
              </div>
              <h2
                id="menu-item-preview-title"
                className="text-xl font-bold text-gray-900 break-words"
              >
                {item.name}
              </h2>
            </div>
            {formatPrice(item.price) && (
              <div className="text-xl font-bold text-gray-900 flex-shrink-0">
                {formatPrice(item.price)}
              </div>
            )}
          </div>

          {/* Prep / feeds pill — the "why does notice-hours matter" signal */}
          {(prep || feeds) && (
            <div className="flex flex-wrap gap-2">
              {prep && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  <Clock size={14} />
                  {prep} prep
                </span>
              )}
              {feeds && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <Users size={14} />
                  {feeds}
                </span>
              )}
            </div>
          )}

          {item.description && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">
                Description
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {item.description}
              </p>
            </div>
          )}

          {(item.dietaryFilters?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-2">
                Dietary
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.dietaryFilters!.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-100"
                  >
                    {humaniseTag(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {(item.allergens?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-2">
                Allergens
              </div>
              <div className="flex flex-wrap gap-1.5">
                {item.allergens!.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-100"
                  >
                    {humaniseTag(tag)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 p-4 flex-shrink-0">
          <Link
            href={`/restaurant/menu/${restaurantId}/edit/${item.id}`}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm bg-white border-2 border-blue-600 text-blue-700 hover:bg-blue-50 transition-colors"
          >
            Edit menu item
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  ImageIcon,
  Loader,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import { coworkingApi } from "@/services/api/coworking.api";
import { CoworkingSpace } from "@/types/api/coworking.api.types";

const DEFAULT_PRIMARY = "#fa43ad";
const HEX_RE = /^#[0-9a-fA-F]{6}$/;
const SLUG_RE = /^[a-z0-9-]+$/;
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const ORDER_PAGE_ORIGIN = "https://swiftfood.uk";

const brandedLinkFor = (slug: string) =>
  `${ORDER_PAGE_ORIGIN}/event-order?partner=${slug}`;

interface SlugChangeModalProps {
  currentSlug: string;
  nextSlug: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Changing the slug silently breaks every link already handed out for the old
 * one, and there is no redirect. Requiring the new slug to be typed back makes
 * that a deliberate act rather than a stray keystroke plus Save.
 */
const SlugChangeModal = ({
  currentSlug,
  nextSlug,
  onCancel,
  onConfirm,
}: SlugChangeModalProps) => {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Change your slug?
            </h3>
            <p className="mt-0.5 text-xs text-gray-500">
              This affects links you have already shared.
            </p>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-sm text-gray-700">
            Anyone who opens your old link will see an &ldquo;unavailable&rdquo;
            page instead of your ordering page. Old links are not redirected.
          </p>

          <div className="space-y-2 rounded-lg bg-gray-50 p-3 font-mono text-xs">
            <div className="text-gray-500 line-through break-all">
              {brandedLinkFor(currentSlug)}
            </div>
            <div className="text-gray-900 break-all">
              {brandedLinkFor(nextSlug)}
            </div>
          </div>

          <p className="text-sm text-gray-700">
            Update anywhere you have shared it &mdash; your website, emails,
            QR codes and printed material.
          </p>

          <div>
            <label
              htmlFor="confirm-slug"
              className="mb-1.5 block text-xs font-medium text-gray-700"
            >
              Type <span className="font-mono text-gray-900">{nextSlug}</span> to
              confirm
            </label>
            <input
              id="confirm-slug"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={typed !== nextSlug}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Change slug
          </button>
        </div>
      </div>
    </div>
  );
};

interface BrandingSettingsProps {
  space: CoworkingSpace;
  onUpdated: (space: CoworkingSpace) => void;
}

export const BrandingSettings = ({
  space,
  onUpdated,
}: BrandingSettingsProps) => {
  const [slug, setSlug] = useState(space.slug);
  const [logoImageUrl, setLogoImageUrl] = useState<string | null>(
    space.logoImageUrl ?? null,
  );
  const [primary, setPrimary] = useState(
    space.theme?.primary ?? DEFAULT_PRIMARY,
  );

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingSlug, setConfirmingSlug] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  const slugChanged = slug !== space.slug;
  const dirty =
    slugChanged ||
    logoImageUrl !== (space.logoImageUrl ?? null) ||
    primary !== (space.theme?.primary ?? DEFAULT_PRIMARY);

  const slugValid = SLUG_RE.test(slug) && slug.length > 0 && slug.length <= 100;
  const primaryValid = HEX_RE.test(primary);
  const canSave = dirty && slugValid && primaryValid && !saving && !uploading;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Logo must be under 5MB.");
      return;
    }

    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      setLogoImageUrl(await coworkingApi.uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const persist = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await coworkingApi.updateBranding(space.id, {
        slug,
        logoImageUrl,
        theme: { primary },
      });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save branding");
    } finally {
      setSaving(false);
      setConfirmingSlug(false);
    }
  };

  const handleSave = () => {
    setSaved(false);
    if (slugChanged) {
      setConfirmingSlug(true);
      return;
    }
    void persist();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(brandedLinkFor(space.slug));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ImageIcon size={18} />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Branding</h2>
          <p className="text-xs text-gray-500">
            How your ordering page on Swift Food looks to your customers.
          </p>
        </div>
      </div>

      <div className="space-y-6 px-5 py-5 sm:px-6">
        <p className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
          These settings apply to your ordering page hosted on Swift Food. If you
          have embedded the catering component on your own website, its
          appearance is controlled by your site&apos;s own code and is not
          affected by anything here.
        </p>

        {/* ── Logo ──────────────────────────────────────────────────── */}
        <div>
          <span className="mb-2 block text-xs font-medium text-gray-700">
            Logo
          </span>
          <div className="flex items-center gap-4">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {logoImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoImageUrl}
                  alt="Your logo"
                  className="h-full w-full object-contain"
                />
              ) : (
                <ImageIcon size={22} className="text-gray-300" />
              )}
            </span>

            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}
                  {uploading ? "Uploading…" : "Upload"}
                </button>
                {logoImageUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoImageUrl(null)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                PNG or JPG, under 5MB. A wide logo on a transparent background
                works best. Without one, your name is shown as text.
              </p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        {/* ── Accent colour ─────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="accent-colour"
            className="mb-2 block text-xs font-medium text-gray-700"
          >
            Accent colour
          </label>
          <div className="flex items-center gap-3">
            <input
              id="accent-colour"
              type="color"
              value={primaryValid ? primary : DEFAULT_PRIMARY}
              onChange={(e) => setPrimary(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded-lg border border-gray-200 bg-white p-1"
            />
            <input
              type="text"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              spellCheck={false}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm text-gray-900 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => setPrimary(DEFAULT_PRIMARY)}
              className="text-xs font-medium text-gray-500 transition-colors hover:text-primary"
            >
              Reset
            </button>
          </div>
          {!primaryValid && (
            <p className="mt-1.5 text-xs text-red-600">
              Use a 6-digit hex colour, like {DEFAULT_PRIMARY}.
            </p>
          )}
        </div>

        {/* ── Link address ──────────────────────────────────────────── */}
        <div>
          <label
            htmlFor="slug"
            className="mb-2 block text-xs font-medium text-gray-700"
          >
            Slug
          </label>
          <div className="flex items-stretch overflow-hidden rounded-lg border border-gray-300 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
            <span className="flex items-center bg-gray-50 px-3 font-mono text-xs text-gray-500">
              {ORDER_PAGE_ORIGIN}/event-order?partner=
            </span>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              spellCheck={false}
              autoComplete="off"
              className="min-w-0 flex-1 px-3 py-2 font-mono text-sm text-gray-900 outline-none"
            />
          </div>

          {!slugValid ? (
            <p className="mt-1.5 text-xs text-red-600">
              Use lowercase letters, numbers and hyphens only.
            </p>
          ) : slugChanged ? (
            <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle size={13} className="mt-px shrink-0" />
              Links you have already shared will stop working. We&apos;ll ask you
              to confirm.
            </p>
          ) : (
            <button
              type="button"
              onClick={copyLink}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-primary"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy your link"}
            </button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {saved && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <CheckCircle size={14} />
              Saved
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? (
              <Loader size={15} className="animate-spin" />
            ) : (
              <Save size={15} />
            )}
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {confirmingSlug && (
        <SlugChangeModal
          currentSlug={space.slug}
          nextSlug={slug}
          onCancel={() => setConfirmingSlug(false)}
          onConfirm={() => void persist()}
        />
      )}
    </div>
  );
};

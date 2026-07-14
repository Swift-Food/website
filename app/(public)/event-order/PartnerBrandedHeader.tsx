"use client";

interface PartnerBrandedHeaderProps {
  logoImageUrl: string | null;
  name: string;
  accentColor: string;
}

export default function PartnerBrandedHeader({
  logoImageUrl,
  name,
  accentColor,
}: PartnerBrandedHeaderProps) {
  return (
    <header
      className="w-full flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white"
      style={{ borderTopColor: accentColor, borderTopWidth: 3, borderTopStyle: "solid" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {logoImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoImageUrl}
            alt={`${name} logo`}
            className="h-8 max-w-[160px] object-contain"
          />
        ) : (
          <span className="font-semibold text-gray-900 truncate">{name}</span>
        )}
      </div>
      <span className="text-sm text-gray-500 shrink-0">
        Powered by <span className="font-semibold text-gray-700">Swift</span>
      </span>
    </header>
  );
}

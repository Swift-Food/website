/**
 * SpecialRequirements Component
 * Displays special requirements if present
 */

interface SpecialRequirementsProps {
  requirements: string;
}

export function SpecialRequirements({ requirements }: SpecialRequirementsProps) {
  if (!requirements) return null;

  return (
    <div className="mt-4 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <p className="text-xs font-semibold text-yellow-900 mb-1">
        Special Requirements:
      </p>
      <p className="text-xs sm:text-sm text-yellow-800 break-words">
        {requirements}
      </p>
    </div>
  );
}

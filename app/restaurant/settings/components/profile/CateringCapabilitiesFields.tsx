"use client";

import { useState } from "react";
import { X } from "lucide-react";

export const CUISINE_OPTIONS = [
  { value: "british", label: "British" },
  { value: "italian", label: "Italian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
  { value: "indian", label: "Indian" },
  { value: "middle_eastern", label: "Middle Eastern" },
  { value: "american", label: "American" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "thai", label: "Thai" },
  { value: "mexican", label: "Mexican" },
  { value: "caribbean", label: "Caribbean" },
  { value: "african", label: "African" },
  { value: "eastern_european", label: "Eastern European" },
  { value: "fusion", label: "Fusion" },
  { value: "other", label: "Other" },
];

const CATERING_FORMAT_OPTIONS = [
  { value: "buffet", label: "Buffet" },
  { value: "set_menu", label: "Set Menu" },
  { value: "individual_box", label: "Individual Box" },
  { value: "canapes", label: "Canapés" },
  { value: "grazing_table", label: "Grazing Table" },
  { value: "family_style", label: "Family Style" },
];

const DIETARY_SUPPORT_OPTIONS = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "gluten_free", label: "Gluten Free" },
  { value: "dairy_free", label: "Dairy Free" },
  { value: "nut_free", label: "Nut Free" },
  { value: "peanut_free", label: "Peanut Free" },
  { value: "high_protein", label: "High Protein" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "low_calorie", label: "Low Calorie" },
];

const labelClass = "block text-sm font-medium text-gray-700 mb-3";

interface CateringCapabilitiesFieldsProps {
  cuisine: string;
  cateringFormats: string[];
  dietarySupport: string[];
  tags: string[];
  onCuisineChange: (value: string) => void;
  onCateringFormatsChange: (value: string[]) => void;
  onDietarySupportChange: (value: string[]) => void;
  onTagsChange: (value: string[]) => void;
}

export const CateringCapabilitiesFields = ({
  cuisine,
  cateringFormats,
  dietarySupport,
  tags,
  onCuisineChange,
  onCateringFormatsChange,
  onDietarySupportChange,
  onTagsChange,
}: CateringCapabilitiesFieldsProps) => {
  const [tagInput, setTagInput] = useState("");

  const toggleArrayValue = (arr: string[], value: string): string[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      onTagsChange([...tags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Cuisine */}
      <div>
        <label className={labelClass}>Primary cuisine</label>
        <select
          value={cuisine}
          onChange={(e) => onCuisineChange(e.target.value)}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white"
        >
          {CUISINE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Service Formats */}
      <div>
        <label className={labelClass}>Service formats</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CATERING_FORMAT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={cateringFormats.includes(opt.value)}
                onChange={() =>
                  onCateringFormatsChange(toggleArrayValue(cateringFormats, opt.value))
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dietary Capabilities */}
      <div>
        <label className={labelClass}>Dietary capabilities</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {DIETARY_SUPPORT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dietarySupport.includes(opt.value)}
                onChange={() =>
                  onDietarySupportChange(toggleArrayValue(dietarySupport, opt.value))
                }
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags (max 5)</label>
        <p className="text-xs text-gray-400 mb-3">
          Help customers discover you (e.g. &quot;Street Food&quot;, &quot;Family Friendly&quot;).
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={
              tags.length >= 5 ? "Maximum 5 tags reached" : "Type a tag and press Enter"
            }
            disabled={tags.length >= 5}
            className="flex-1 px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={addTag}
            disabled={!tagInput.trim() || tags.length >= 5}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-800 text-sm font-medium rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-purple-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

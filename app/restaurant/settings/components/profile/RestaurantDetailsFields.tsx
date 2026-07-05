"use client";

const inputClass =
  "w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 bg-white placeholder:text-gray-400";

const labelClass = "block text-sm font-medium text-gray-700 mb-2";

interface RestaurantDetailsFieldsProps {
  restaurantName: string;
  description: string;
  contactNumber: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
}

export const RestaurantDetailsFields = ({
  restaurantName,
  description,
  contactNumber,
  onNameChange,
  onDescriptionChange,
  onContactNumberChange,
}: RestaurantDetailsFieldsProps) => {
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="restaurant_name" className={labelClass}>
          Restaurant name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="restaurant_name"
          name="restaurant_name"
          value={restaurantName}
          onChange={(e) => onNameChange(e.target.value)}
          required
          className={inputClass}
          placeholder="Enter restaurant name"
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
          className={`${inputClass} resize-none`}
          placeholder="Tell customers about your restaurant..."
        />
        <p className="text-xs text-gray-400 mt-1.5">
          Shown to customers when they browse your restaurant.
        </p>
      </div>

      <div>
        <label htmlFor="contact_number" className={labelClass}>
          Contact number
        </label>
        <input
          type="tel"
          id="contact_number"
          name="contact_number"
          value={contactNumber}
          onChange={(e) => onContactNumberChange(e.target.value)}
          className={inputClass}
          placeholder="+44 7123 456789"
        />
      </div>
    </div>
  );
};

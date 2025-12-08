import { useState } from "react";
import { ContactInfo } from "@/types/catering.types";

interface ValidationErrors {
  organization?: string;
  fullName?: string;
  email?: string;
  phone?: string;
}

interface ContactInfoFormProps {
  formData: ContactInfo;
  errors: ValidationErrors;
  onFieldChange: (field: keyof ContactInfo, value: string) => void;
  onBlur: (field: keyof ContactInfo) => void;
  ccEmails: string[];
  onAddCcEmail: (email: string) => void;
  onRemoveCcEmail: (email: string) => void;
}

export default function ContactInfoForm({
  formData,
  errors,
  onFieldChange,
  onBlur,
  ccEmails,
  onAddCcEmail,
  onRemoveCcEmail,
}: ContactInfoFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [ccEmailInput, setCcEmailInput] = useState("");

  const handleAddCcEmail = () => {
    const trimmedEmail = ccEmailInput.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) return;

    if (!emailRegex.test(trimmedEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    if (ccEmails.includes(trimmedEmail)) {
      alert("This email is already added");
      return;
    }

    onAddCcEmail(trimmedEmail);
    setCcEmailInput("");
  };

  // Check if section is complete
  const isComplete =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    !errors.fullName &&
    !errors.email &&
    !errors.phone;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold text-base-content">
            Contact Details
          </h4>
          {isComplete && (
            <span className="text-xs text-success">✓ Complete</span>
          )}
        </div>
        <svg
          className={`w-5 h-5 text-base-content/60 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="space-y-4">
          {/* Organization */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Organization (Optional)
            </label>
            <input
              type="text"
              name="organization"
              value={formData.organization}
              onChange={(e) => onFieldChange("organization", e.target.value)}
              onBlur={() => onBlur("organization")}
              placeholder="Your Organization Name"
              className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Name*
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={(e) => onFieldChange("fullName", e.target.value)}
              onBlur={() => onBlur("fullName")}
              placeholder="Your Name"
              className={`w-full px-4 py-3 bg-base-200/50 border ${
                errors.fullName ? "border-error" : "border-base-300"
              } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-error">✗ {errors.fullName}</p>
            )}
          </div>

          {/* Telephone */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Telephone*
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={(e) => onFieldChange("phone", e.target.value)}
              onBlur={() => onBlur("phone")}
              placeholder="Your Number"
              className={`w-full px-4 py-3 bg-base-200/50 border ${
                errors.phone ? "border-error" : "border-base-300"
              } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-error">✗ {errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-base-content">
              Email*
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => onFieldChange("email", e.target.value)}
              onBlur={() => onBlur("email")}
              placeholder="Your Email"
              className={`w-full px-4 py-3 bg-base-200/50 border ${
                errors.email ? "border-error" : "border-base-300"
              } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">✗ {errors.email}</p>
            )}
          </div>

          {/* CC Additional Emails */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-base-content">
              CC Additional Emails (Optional)
            </label>
            <p className="text-xs text-base-content/60 mb-3">
              Add additional email addresses to receive order updates
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="email"
                value={ccEmailInput}
                onChange={(e) => setCcEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCcEmail();
                  }
                }}
                placeholder="additional@email.com"
                className="flex-1 px-4 py-2 bg-base-200/50 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={handleAddCcEmail}
                className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all text-sm"
              >
                Add
              </button>
            </div>

            {ccEmails.length > 0 && (
              <div className="space-y-2">
                {ccEmails.map((email, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300"
                  >
                    <span className="text-sm text-base-content">{email}</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCcEmail(email)}
                      className="text-error hover:opacity-80 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

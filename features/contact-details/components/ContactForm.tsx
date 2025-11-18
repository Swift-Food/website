import { Input } from '@/lib/components/form';
import { ContactFormData, ContactFormErrors } from '../types/contact-form.dto';

interface ContactFormProps {
  formData: ContactFormData;
  errors: ContactFormErrors;
  onChange: (field: keyof ContactFormData, value: string) => void;
  onBlur: (field: keyof ContactFormData) => void;
}

export function ContactForm({ formData, errors, onChange, onBlur }: ContactFormProps) {
  return (
    <div className="space-y-6">
      {/* Organization */}
      <div>
        <label className="block text-sm font-semibold mb-2 text-base-content">
          Organization (Optional)
        </label>
        <input
          type="text"
          name="organization"
          value={formData.organization}
          onChange={(e) => onChange('organization', e.target.value)}
          onBlur={() => onBlur('organization')}
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
          onChange={(e) => onChange('fullName', e.target.value)}
          onBlur={() => onBlur('fullName')}
          placeholder="Your Name"
          className={`w-full px-4 py-3 bg-base-200/50 border ${
            errors.fullName ? 'border-error' : 'border-base-300'
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
          onChange={(e) => onChange('phone', e.target.value)}
          onBlur={() => onBlur('phone')}
          placeholder="Your Number"
          className={`w-full px-4 py-3 bg-base-200/50 border ${
            errors.phone ? 'border-error' : 'border-base-300'
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
          onChange={(e) => onChange('email', e.target.value)}
          onBlur={() => onBlur('email')}
          placeholder="Your Email"
          className={`w-full px-4 py-3 bg-base-200/50 border ${
            errors.email ? 'border-error' : 'border-base-300'
          } rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">✗ {errors.email}</p>
        )}
      </div>
    </div>
  );
}

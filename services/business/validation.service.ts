/**
 * ValidationService
 * Centralized validation logic
 */

import {
  isValidEmail,
  isValidUKPostcode,
  isValidUKPhone,
  validateRequired,
  validateMinLength,
} from '@/lib/utils/validation.utils';
import { ValidationErrorDto } from '@/types/shared/common.dto';
import { ContactFormData } from '@/features/contact-details/types/contact-form.dto';

export interface AddressFormData {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
}

class ValidationService {
  /**
   * Validate contact details
   */
  validateContactDetails(formData: ContactFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    // Organization
    const orgError = validateRequired(formData.organization, 'Organization');
    if (orgError) {
      errors.organization = orgError;
    }

    // Full name
    const nameError = validateRequired(formData.fullName, 'Full name');
    if (nameError) {
      errors.fullName = nameError;
    } else {
      const minLengthError = validateMinLength(formData.fullName, 2, 'Full name');
      if (minLengthError) {
        errors.fullName = minLengthError;
      }
    }

    // Email
    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      errors.email = emailError;
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone
    const phoneError = validateRequired(formData.phone, 'Phone number');
    if (phoneError) {
      errors.phone = phoneError;
    } else if (!isValidUKPhone(formData.phone)) {
      errors.phone = 'Please enter a valid UK phone number';
    }

    // Address Line 1
    const addressError = validateRequired(formData.addressLine1, 'Address');
    if (addressError) {
      errors.addressLine1 = addressError;
    }

    // City
    const cityError = validateRequired(formData.city, 'City');
    if (cityError) {
      errors.city = cityError;
    }

    // Zipcode
    const zipcodeError = validateRequired(formData.zipcode, 'Postcode');
    if (zipcodeError) {
      errors.zipcode = zipcodeError;
    } else if (!isValidUKPostcode(formData.zipcode)) {
      errors.zipcode = 'Please enter a valid UK postcode';
    }

    return errors;
  }

  /**
   * Validate single contact field
   */
  validateContactField(formData: ContactFormData, field: keyof ContactFormData): Record<string, string> {
    const errors: Record<string, string> = {};

    switch (field) {
      case 'organization':
        const orgError = validateRequired(formData.organization, 'Organization');
        if (orgError) {
          errors.organization = orgError;
        }
        break;
      case 'fullName':
        const nameError = validateRequired(formData.fullName, 'Full name');
        if (nameError) {
          errors.fullName = nameError;
        } else {
          const minLengthError = validateMinLength(formData.fullName, 2, 'Full name');
          if (minLengthError) {
            errors.fullName = minLengthError;
          }
        }
        break;
      case 'email':
        const emailError = validateRequired(formData.email, 'Email');
        if (emailError) {
          errors.email = emailError;
        } else if (!isValidEmail(formData.email)) {
          errors.email = 'Please enter a valid email address';
        }
        break;
      case 'phone':
        const phoneError = validateRequired(formData.phone, 'Phone number');
        if (phoneError) {
          errors.phone = phoneError;
        } else if (!isValidUKPhone(formData.phone)) {
          errors.phone = 'Please enter a valid UK phone number';
        }
        break;
      case 'addressLine1':
        const addressError = validateRequired(formData.addressLine1, 'Address');
        if (addressError) {
          errors.addressLine1 = addressError;
        }
        break;
      case 'city':
        const cityError = validateRequired(formData.city, 'City');
        if (cityError) {
          errors.city = cityError;
        }
        break;
      case 'zipcode':
        const zipcodeError = validateRequired(formData.zipcode, 'Postcode');
        if (zipcodeError) {
          errors.zipcode = zipcodeError;
        } else if (!isValidUKPostcode(formData.zipcode)) {
          errors.zipcode = 'Please enter a valid UK postcode';
        }
        break;
      case 'addressLine2':
      case 'latitude':
      case 'longitude':
        // Optional fields - no validation needed
        break;
    }

    return errors;
  }

  /**
   * Validate UK address
   */
  validateAddress(addressData: AddressFormData): ValidationErrorDto[] {
    const errors: ValidationErrorDto[] = [];

    // Address Line 1
    const addressError = validateRequired(addressData.addressLine1, 'Address');
    if (addressError) {
      errors.push({ field: 'addressLine1', message: addressError });
    }

    // City
    const cityError = validateRequired(addressData.city, 'City');
    if (cityError) {
      errors.push({ field: 'city', message: cityError });
    }

    // Postcode
    const postcodeError = validateRequired(addressData.postcode, 'Postcode');
    if (postcodeError) {
      errors.push({ field: 'postcode', message: postcodeError });
    } else if (!isValidUKPostcode(addressData.postcode)) {
      errors.push({ field: 'postcode', message: 'Please enter a valid UK postcode' });
    }

    return errors;
  }

  /**
   * Check if form has errors
   */
  hasErrors(errors: ValidationErrorDto[]): boolean {
    return errors.length > 0;
  }

  /**
   * Get error message for specific field
   */
  getFieldError(errors: ValidationErrorDto[], fieldName: string): string | undefined {
    return errors.find(e => e.field === fieldName)?.message;
  }
}

export const validationService = new ValidationService();

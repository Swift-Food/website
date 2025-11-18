import { useState, useEffect } from 'react';
import { ContactFormData, ContactFormErrors } from '../types/contact-form.dto';
import { validationService } from '@/services/business';

export function useContactForm(initialData?: Partial<ContactFormData>) {
  const [formData, setFormData] = useState<ContactFormData>({
    organization: initialData?.organization || '',
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    addressLine1: initialData?.addressLine1 || '',
    addressLine2: initialData?.addressLine2 || '',
    city: initialData?.city || '',
    zipcode: initialData?.zipcode || '',
    latitude: initialData?.latitude,
    longitude: initialData?.longitude,
  });

  const [errors, setErrors] = useState<ContactFormErrors>({});

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        organization: initialData.organization || '',
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        addressLine1: initialData.addressLine1 || '',
        addressLine2: initialData.addressLine2 || '',
        city: initialData.city || '',
        zipcode: initialData.zipcode || '',
        latitude: initialData.latitude,
        longitude: initialData.longitude,
      });
    }
  }, [initialData]);

  const handleChange = (field: keyof ContactFormData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof ContactFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof ContactFormData) => {
    const fieldErrors = validationService.validateContactField(formData, field);
    setErrors((prev) => ({
      ...prev,
      [field]: fieldErrors[field as keyof ContactFormErrors],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = validationService.validateContactDetails(formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateFormData = (data: Partial<ContactFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    validateForm,
    updateFormData,
  };
}

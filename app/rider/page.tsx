'use client';

import MultiStepDriverForm from "../components/rider_form";

export default function RegisterPage() {
  const handleFormSubmit = async (formData: any) => {
    try {
      console.log('Form submitted:', formData);
      
      // Send to your NestJS backend
      const response = await fetch('/api/restaurants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Registration successful:', result);
        // Redirect or show success message
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error (show error message, etc.)
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MultiStepDriverForm/>
    </div>
  );
}
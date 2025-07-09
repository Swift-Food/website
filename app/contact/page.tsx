'use client';

import React, { useState } from 'react';

// Types for form data
interface ContactFormData {
  name: string;
  email: string;
  description: string;
}

interface ContactFormProps {
  onSubmit: (data: ContactFormData) => void;
  className?: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ onSubmit, className = '' }) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        description: ''
      });
      
      alert('Message sent successfully!');
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary mb-6">📧 Contact Us</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Name Field */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
              placeholder="Enter your full name"
            />
          </div>

          {/* Email Field */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
              placeholder="Enter your email address"
            />
          </div>

          {/* Description Field */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
              Message *
            </label>
            <textarea
              required
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 resize-vertical"
              placeholder="Please describe your inquiry or message..."
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 We typically respond within 24 hours during business days.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`btn btn-primary btn-sm rounded-full px-8 text-white ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

     
      </div>
    </div>
  );
};

export default ContactForm;
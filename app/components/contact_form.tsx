'use client';

import React, { useState } from 'react';
import { mailService } from '../service/mail';

// Types for form data
interface ContactFormData {
  name: string;
  email: string;
  description: string;
}

const ContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    description: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await mailService.sendFormResponse(formData);
      console.log('Email sent successfully:');
      
      setIsSuccess(true);
      
      // Reset form after success
      setFormData({ name: '', email: '', description: '' });
      
      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error sending form:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', description: '' });
    setIsSuccess(false);
    setError(null);
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-6 py-8 px-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Message Sent! 📧</h2>
            <p className="text-gray-600">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
          </div>
          
          <div className="rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">What's next?</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Our team will review your message
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We'll respond within 24 hours during business days
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Check your email for our response
              </li>
            </ul>
          </div>
          
          <button
            onClick={resetForm}
            className="btn btn-primary btn-sm rounded-full px-6 text-white"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-primary mb-6">📧 Contact Us</h2>
        
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
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
            type="submit"
            disabled={isSubmitting}
            className={`btn btn-primary btn-sm rounded-full px-8 text-white ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </div>

        
      </form>
    </div>
  );
};

export default ContactForm;
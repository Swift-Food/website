'use client';

import React, { useState } from 'react';
import { mailService } from '@/services/utilities/mail.service';
import Link from 'next/link';

interface ComplaintFormData {
  email: string;
  orderId: string;
  description: string;
  image: File | null;
}

const ComplaintForm = () => {
  const [formData, setFormData] = useState<ComplaintFormData>({
    email: '',
    orderId: '',
    description: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ComplaintFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrl = null;

      // Step 1: Upload image if provided
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append('image', formData.image);

        const imageUploadResponse = await fetch(
          'https://swiftfoods-32981ec7b5a4.herokuapp.com/image-upload',
          {
            method: 'POST',
            body: imageFormData,
          }
        );

        if (!imageUploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const imageData = await imageUploadResponse.json();
        imageUrl = imageData.url || imageData.imageUrl || imageData;
      }

      // Step 2: Send complaint data via mail service
      const complaintData = {
        email: formData.email,
        orderId: formData.orderId || 'N/A',
        description: formData.description,
        imageUrl: imageUrl,
        type: 'complaint'
      };

      await mailService.sendFormResponse(complaintData);
      
      setIsSuccess(true);
      
      // Reset form after success
      setFormData({ email: '', orderId: '', description: '', image: null });
      setImagePreview(null);
      
      // Hide success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
      
    } catch (error) {
      console.error('Error sending complaint:', error);
      setError('Failed to submit complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', orderId: '', description: '', image: null });
    setImagePreview(null);
    setIsSuccess(false);
    setError(null);
  };

  if (isSuccess) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center space-y-6 py-8 px-6 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Complaint Submitted! 📧</h2>
            <p className="text-gray-600">
              Thank you for reporting this issue. Our support team will review your complaint and respond within 24-48 hours.
            </p>
          </div>
          
          <div className="rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-gray-800 mb-2">What happens next?</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Our support team will review your complaint
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We'll investigate the issue thoroughly
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You'll receive a response via email within 24-48 hours
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                We may reach out for additional information if needed
              </li>
            </ul>
          </div>
          
          <button
            onClick={resetForm}
            className="btn btn-primary btn-sm rounded-full px-6 text-white"
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-full">
      <div className="flex flex-col lg:flex-row gap-12 h-full">
        {/* Left Column - Info */}
        <div className="flex flex-1 flex-col">
          <h2 className="text-6xl font-bold text-primary mb-6">Report an Issue</h2>
          
          <div className="bg-base-200 p-6 rounded-lg space-y-4 text-primary">
            <h3 className="text-2xl font-bold">We're here to help</h3>
            <p className="text-sm leading-relaxed">
              Experienced an issue with your order? Let us know and we'll make it right. 
              <br/><br/>
              Please provide as much detail as possible, including your order ID and any relevant photos.
              <br/><br/>
              Need immediate assistance?
            </p>
            <Link 
              href="mailto:swiftfooduk@gmail.com"
              className="text-xl font-bold hover:underline cursor-pointer"
            >
              swiftfooduk@gmail.com
            </Link>
          </div>
        </div>

        {/* Right Column - Form */}
        <div className="flex w-full flex-2">
          <form onSubmit={handleSubmit} className="space-y-6 w-full">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {/* Email Field */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* Order ID Field */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID <span className="text-gray-500 text-xs">(Optional but helpful)</span>
                </label>
                <input
                  type="text"
                  value={formData.orderId}
                  onChange={(e) => handleInputChange('orderId', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
                  placeholder="e.g., 59968cc6-0105-4d9a-96d9"
                />
              </div>

              {/* Problem Description Field */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700 resize-vertical"
                  placeholder="Please describe the issue you experienced in detail..."
                />
              </div>

              {/* Image Upload Field */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image <span className="text-gray-500 text-xs">(Optional, max 5MB)</span>
                </label>
                
                {!imagePreview ? (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="w-full p-8 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors flex flex-col items-center justify-center bg-gray-50"
                    >
                      <svg 
                        className="w-12 h-12 text-gray-400 mb-3" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                        />
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        Click to upload an image
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="relative rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`btn btn-primary text-lg btn-sm rounded-full px-8 py-6 text-white ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ComplaintForm;
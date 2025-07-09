'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import InfoContainer from './containers/InfoContainer';

// Types for form data
interface BasicBusinessInfo {
  restaurantName: string;
  ownerName: string;
  businessEmail: string;
  businessPhone: string;
  // password: string;
  // confirmPassword: string;
}

interface LocationInfo {
  streetAddress: string;
  city: string;
  postalCode: string;
  // state: string;
  market: string;
  // coordinates: { lat: number; lng: number } | null;
}

interface RestaurantProfile {
  cuisineTypes: string[];
  serviceTypes: string[];
  description: string;
  openingHours: { [key: string]: { open: string; close: string; closed: boolean } };
  daysOpen: string[];
}

interface FormData {
  basicInfo: BasicBusinessInfo;
  location: LocationInfo;
  profile: RestaurantProfile;
}

interface MultiStepFormProps {
  onSubmit: (data: FormData) => void;
  className?: string;
}

const MultiStepRestaurantForm: React.FC<MultiStepFormProps> = ({ onSubmit, className = '' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    basicInfo: {
      restaurantName: '',
      ownerName: '',
      businessEmail: '',
      businessPhone: '',
      // password: '',
      // confirmPassword: ''
    },
    location: {
      streetAddress: '',
      city: '',
      postalCode: '',
      // state: '',
      market: '',
      // coordinates: null
    },
    profile: {
      cuisineTypes: [],
      serviceTypes: [],
      description: '',
      openingHours: {
        monday: { open: '09:00', close: '22:00', closed: false },
        tuesday: { open: '09:00', close: '22:00', closed: false },
        wednesday: { open: '09:00', close: '22:00', closed: false },
        thursday: { open: '09:00', close: '22:00', closed: false },
        friday: { open: '09:00', close: '22:00', closed: false },
        saturday: { open: '09:00', close: '22:00', closed: false },
        sunday: { open: '09:00', close: '22:00', closed: true }
      },
      daysOpen: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    }
  });

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese',
    'French', 'Korean',  'Greek', 'Vegan', 'Vegetarian'
  ];

  const serviceOptions = ['Delivery', 'Takeaway'];
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const updateFormData = (section: keyof FormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              currentStep >= step
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step ? 'bg-primary' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Basic Business Info</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Restaurant Name *
          </label>
          <input
            type="text"
            required
            value={formData.basicInfo.restaurantName}
            onChange={(e) => updateFormData('basicInfo', { restaurantName: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter restaurant name"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Username*
          </label>
          <input
            type="text"
            required
            value={formData.basicInfo.ownerName}
            onChange={(e) => updateFormData('basicInfo', { ownerName: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter owner/manager name"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Business Email *
          </label>
          <input
            type="email"
            required
            value={formData.basicInfo.businessEmail}
            onChange={(e) => updateFormData('basicInfo', { businessEmail: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter business email"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Business Phone Number *
          </label>
          <input
            type="tel"
            required
            value={formData.basicInfo.businessPhone}
            onChange={(e) => updateFormData('basicInfo', { businessPhone: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter phone number"
          />
        </div>

        {/* <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Password *
          </label>
          <input
            type="password"
            required
            value={formData.basicInfo.password}
            onChange={(e) => updateFormData('basicInfo', { password: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Enter password"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Confirm Password *
          </label>
          <input
            type="password"
            required
            value={formData.basicInfo.confirmPassword}
            onChange={(e) => updateFormData('basicInfo', { confirmPassword: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="Confirm password"
          />
        </div> */}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Location & Address</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Street Address *
          </label>
          <input
            type="text"
            required
            value={formData.location.streetAddress}
            onChange={(e) => updateFormData('location', { streetAddress: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter street address"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            City *
          </label>
          <input
            type="text"
            required
            value={formData.location.city}
            onChange={(e) => updateFormData('location', { city: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter city"
          />
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Postal Code *
          </label>
          <input
            type="text"
            required
            value={formData.location.postalCode}
            onChange={(e) => updateFormData('location', { postalCode: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
            placeholder="Enter postal code"
          />
        </div>

        {/* <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            State/Region *
          </label>
          <select
            required
            value={formData.location.state}
            onChange={(e) => updateFormData('location', { state: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Select state/region</option>
            <option value="california">California</option>
            <option value="texas">Texas</option>
            <option value="newyork">New York</option>
            <option value="florida">Florida</option>
          </select>
        </div> */}

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2 min-h-[20px]">
            Market *
          </label>
          <select
            required
            value={formData.location.market}
            onChange={(e) => updateFormData('location', { market: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          >
            <option value="">Select market</option>
            <option value="goodge">Goodge Street Market</option>
            <option value="tcr">Tottenham Court Road Market</option>

          </select>
        </div>
      </div>

      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Location Coordinates (Optional)
        </label>
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600">
            📍 Click on the map or enter coordinates manually
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={formData.location.coordinates?.lat || ''}
              onChange={(e) => updateFormData('location', { 
                coordinates: { 
                  ...formData.location.coordinates, 
                  lat: parseFloat(e.target.value) 
                } 
              })}
              className="p-2 border border-gray-300 rounded text-sm"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={formData.location.coordinates?.lng || ''}
              onChange={(e) => updateFormData('location', { 
                coordinates: { 
                  ...formData.location.coordinates, 
                  lng: parseFloat(e.target.value) 
                } 
              })}
              className="p-2 border border-gray-300 rounded text-sm"
            />
          </div>
        </div> */}
      {/* </div> */}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary mb-6">Restaurant Profile</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cuisine Types *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-gray-700">
          {cuisineOptions.map((cuisine) => (
            <label key={cuisine} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.profile.cuisineTypes.includes(cuisine)}
                onChange={(e) => {
                  const updatedCuisines = e.target.checked
                    ? [...formData.profile.cuisineTypes, cuisine]
                    : formData.profile.cuisineTypes.filter(c => c !== cuisine);
                  updateFormData('profile', { cuisineTypes: updatedCuisines });
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm">{cuisine}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Service Types *
        </label>
        <div className="flex flex-wrap gap-4">
          {serviceOptions.map((service) => (
            <label key={service} className="flex items-center space-x-2 cursor-pointer text-gray-700">
              <input
                type="checkbox"
                checked={formData.profile.serviceTypes.includes(service)}
                onChange={(e) => {
                  const updatedServices = e.target.checked
                    ? [...formData.profile.serviceTypes, service]
                    : formData.profile.serviceTypes.filter(s => s !== service);
                  updateFormData('profile', { serviceTypes: updatedServices });
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium">{service}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Restaurant Description *
        </label>
        <textarea
          required
          rows={4}
          value={formData.profile.description}
          onChange={(e) => updateFormData('profile', { description: e.target.value })}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-gray-700"
          placeholder="Describe your restaurant, specialties, ambiance, etc."
        />
      </div>

      {/* <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Days Open *
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => (
            <label key={day} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.profile.daysOpen.includes(day)}
                onChange={(e) => {
                  const updatedDays = e.target.checked
                    ? [...formData.profile.daysOpen, day]
                    : formData.profile.daysOpen.filter(d => d !== day);
                  updateFormData('profile', { daysOpen: updatedDays });
                }}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm capitalize">{day}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Opening Hours
        </label>
        <div className="space-y-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="flex items-center space-x-4">
              <div className="w-20 text-sm capitalize font-medium">{day}</div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={!formData.profile.openingHours[day].closed}
                  onChange={(e) => {
                    updateFormData('profile', {
                      openingHours: {
                        ...formData.profile.openingHours,
                        [day]: { ...formData.profile.openingHours[day], closed: !e.target.checked }
                      }
                    });
                  }}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm">Open</span>
              </label>
              {!formData.profile.openingHours[day].closed && (
                <>
                  <input
                    type="time"
                    value={formData.profile.openingHours[day].open}
                    onChange={(e) => {
                      updateFormData('profile', {
                        openingHours: {
                          ...formData.profile.openingHours,
                          [day]: { ...formData.profile.openingHours[day], open: e.target.value }
                        }
                      });
                    }}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm">to</span>
                  <input
                    type="time"
                    value={formData.profile.openingHours[day].close}
                    onChange={(e) => {
                      updateFormData('profile', {
                        openingHours: {
                          ...formData.profile.openingHours,
                          [day]: { ...formData.profile.openingHours[day], close: e.target.value }
                        }
                      });
                    }}
                    className="p-2 border border-gray-300 rounded text-sm"
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );

  return (
    <div className={`h-full ${className}`}>
      <section className="flex w-full h-full gap-4 max-lg:flex-col">
        <section className="flex-4 relative aspect-video rounded-xl overflow-hidden">
        <Image
            fill
            src="/store.jpg"
            className="object-cover w-full h-auto"
            alt="swift food store"
          />
        </section>
        
        <aside className="flex-1 flex flex-col gap-4">
          <InfoContainer heading="Restaurant Registration" className="relative flex-1">
            <div className="p-6 h-full overflow-y-auto">
              {renderStepIndicator()}
              
              <div className="min-h-[400px]">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
              </div>
              
              <div className="flex justify-between mt-8 pt-4 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className={`btn btn-sm rounded-full px-6 ${
                    currentStep === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Previous
                </button>
                
                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    className="btn btn-primary btn-sm rounded-full px-6 text-white"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    className="btn btn-primary btn-sm rounded-full px-6 text-white"
                  >
                    Submit Registration
                  </button>
                )}
              </div>
            </div>
          </InfoContainer>
        </aside>
      </section>
    </div>
  );
};

export default MultiStepRestaurantForm;
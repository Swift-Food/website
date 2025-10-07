'use client';

import { useState, FormEvent } from 'react';
import Image from 'next/image';
import { useCatering } from '@/context/CateringContext';
import { EventDetails } from '@/types/catering.types';


// Define the options for Guest Count and Event Type to map to the UI
// REPLACE the GUEST_COUNT_OPTIONS with:
const GUEST_COUNT_OPTIONS = [
  { label: '10-30 (Small)', value: 20 },
  { label: '30-50 (Medium)', value: 40 },
  { label: '50-70 (Large)', value: 60 },
  { label: '70-90 (XL)', value: 80 },
  { label: '90+ (XXL)', value: 100 },
];

const EVENT_TYPE_OPTIONS = [
  { name: 'Corporate Lunch', value: 'corporate', imgSrc: '/event-detail-img/corporate.png' }, // Placeholder paths
  { name: 'Student Event', value: 'student', imgSrc: '/event-detail-img/student.png' },
  { name: 'Birthday/Private Party', value: 'birthday', imgSrc: '/event-detail-img/birthday.png' },
  { name: 'Wedding/Celebration', value: 'wedding', imgSrc: '/event-detail-img/birthday.png' },
  { name: 'Other', value: 'other', imgSrc: '/event-detail-img/other.png' },
];

export default function Step1EventDetails() {
  const { eventDetails, setEventDetails, setCurrentStep } = useCatering();
  
  // REPLACE with:
  const [formData, setFormData] = useState<EventDetails>(
    eventDetails || {
      eventType: '',
      eventDate: '',
      eventTime: '',
      guestCount: 0, // No default selection
      specialRequests: '',
    }
  );



  // REPLACE handleSubmit with:
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  
  // Validate all required fields
  if (!formData.eventDate || !formData.eventTime || !formData.eventType || formData.guestCount === 0) {
    alert('Please fill in all required fields');
    return;
  }
  
  setEventDetails(formData);
  setCurrentStep(2);
};
  
  // Custom input component for Date & Time to match the UI style
  const DateTimeInput = ({ type, label, value, onChange, placeholder }: {
    type: 'date' | 'time';
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }) => (
    <div className="relative">
      <input
        type={type}
        required
        value={value}
        onChange={onChange}
        min={type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
        // Tailwind/DaisyUI classes for the input
        className={`peer w-full h-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-0 focus:border-dark-pink appearance-none transition duration-150 ${type === 'date' && !value ? 'text-transparent' : 'text-gray-900'} `}
        // Using an empty string for placeholder to ensure the date picker's native text is hidden on empty
        placeholder={placeholder || ''} 
      />
      {/* Visual label/placeholder when input is empty or focused (for date/time) */}
      <label className={`absolute left-4 top-3 text-gray-500 pointer-events-none transition-all duration-150 ${value ? 'text-xs -translate-y-5 bg-base-100 px-1' : 'text-base'}`}>
        {label}
      </label>
 
      {/* Force padding for date input to prevent the native text from overlapping the icon */}
      {type === 'date' && <div className="absolute inset-y-0 right-0 w-12"></div>}
    </div>
  );


  const handleGuestCountSelect = (optionValue: number) => {
    setFormData({ ...formData, guestCount: optionValue });
  };

  

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">

      
      {/* Event Details Header */}
      <h2 className="text-4xl font-bold mb-2">Event Details</h2>
      <p className="text-lg text-gray-600 mb-10">We just need a few details before we start building your catering menu.</p>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Delivery Date & Time Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Delivery Date & Time</h3>
          <p className="text-sm text-gray-500 mb-4">Catering orders require at least 3 days' notice.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Event Date</label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Event Time</label>
            <input
              type="time"
              required
              value={formData.eventTime}
              onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          </div>
        </div>

        {/* Portion Size (Guest Count) Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Portion Size (Guest Count)</h3>
          

            <div className="flex flex-wrap gap-3 mb-3">
              {GUEST_COUNT_OPTIONS.map((option) => {
                const isActive = formData.guestCount === option.value;
                
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => handleGuestCountSelect(option.value)}
                    className={`
                      px-5 py-2 rounded-full text-base font-medium transition-all duration-200 
                      ${isActive 
                        ? 'bg-dark-pink text-white shadow-lg' 
                        : 'bg-base-200 text-gray-600 hover:bg-base-300'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          
     

          {/* Custom guest count input for 90+ */}

        </div>

        {/* Type of Event Section */}
        <div>
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">Type of Event</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {EVENT_TYPE_OPTIONS.map((option) => {
              const isSelected = formData.eventType === option.value;
              return (
                <div
                  key={option.value}
                  onClick={() => setFormData({ ...formData, eventType: option.value })}
                  className={`
                    cursor-pointer transition-all duration-200 text-center
                    ${isSelected ? 'border-dark-pink bg-base-300' : 'border-base-300 hover:border-gray-400'}
                  `}
                >
                 
                    {/* Placeholder for the image */}
                    <Image
                        src={option.imgSrc}
                        alt="sample dish"
                   
                        width={170}
                        height={170}
                      />
                    
          
                  <p className="text-xs pt-2 pb-2 font-medium text-gray-800">{option.name}</p>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Special Requests (kept from original code, adjust styling if needed) */}
        {/* I've removed the special requests section to more closely match the image, 
            which only shows event details, portion size, and type of event. 
            If you need it, you can uncomment a version of it here. */}
        
        {/* Submit Button */}
        <div className="text-center pt-4">
          <button
            type="submit"
            className="bg-dark-pink text-white py-4 px-12 rounded-full font-bold text-lg hover:bg-pink-700 transition-colors shadow-lg shadow-dark-pink/30"
          >
            Next - Choose Menu
          </button>
          <p className="text-sm text-gray-500 mt-3">
            You can edit your event details later before submission.
          </p>
        </div>
      </form>
    </div>
  );
}
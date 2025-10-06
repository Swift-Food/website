// components/catering/Step3ContactInfo.tsx

'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useCatering } from '@/context/CateringContext';
import { cateringService } from '@/services/cateringServices';
import { CateringPricingResult, ContactInfo } from '@/types/catering.types';


export default function Step3ContactInfo() {
  const { 
    contactInfo, 
    setContactInfo, 
    setCurrentStep, 
    eventDetails,
    selectedItems,
    getTotalPrice,
    resetOrder 
  } = useCatering();
  
  const [formData, setFormData] = useState<ContactInfo>(
    contactInfo || {
      fullName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      zipcode: '',
    }
  );
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
  
    try {
      if (!formData.latitude || !formData.longitude) {
        alert('Please select an address from the dropdown');
        setSubmitting(false);
        return;
      }
  
      if (!pricing) {
        alert('Please wait for pricing calculation to complete');
        setSubmitting(false);
        return;
      }
  
      setContactInfo(formData);
  
      await cateringService.submitCateringOrder(
        eventDetails!,
        selectedItems,
        formData
      );
      setSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculatePricing = async () => {
    setCalculatingPricing(true);
    try {
      // Build order items from selected items
      const groupedByRestaurant = selectedItems.reduce((acc, { item, quantity }) => {
        const restaurantId = item.restaurant?.restaurantId || item.restaurantId || 'unknown';
        const restaurantName = item.restaurant?.name || 'Unknown Restaurant';
        
        if (!acc[restaurantId]) {
          acc[restaurantId] = {
            restaurantId,
            restaurantName,
            items: [],
          };
        }
        
        const price = parseFloat(item.price?.toString() || '0');
        const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
        const unitPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
        
        acc[restaurantId].items.push({
          menuItemId: item.id,
          name: item.name,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        });
        
        return acc;
      }, {} as Record<string, { restaurantId: string; restaurantName: string; items: any[] }>);
  
      const orderItems = Object.values(groupedByRestaurant).map((group: any) => {
        const restaurantTotal = group.items.reduce((sum, item) => sum + item.totalPrice, 0);
        
        return {
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          menuItems: group.items,
          status: 'pending',
          restaurantCost: restaurantTotal,
          totalPrice: restaurantTotal,
        };
      });
  
      const pricingResult = await cateringService.calculateCateringPricing(orderItems);
      
      if (!pricingResult.isValid) {
        alert(pricingResult.error || 'Unable to calculate pricing');
        setPricing(null);
        return;
      }
  
      setPricing(pricingResult);
    } catch (error) {
      console.error('Error calculating pricing:', error);
      alert('Failed to calculate pricing. Please try again.');
      setPricing(null);
    } finally {
      setCalculatingPricing(false);
    }
  };
  useEffect(() => {
    // Calculate pricing when component loads
    calculatePricing();
  }, []);

  useEffect(() => {
    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (window.google) {
        initAutocomplete();
      }
      return;
    }
  
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      initAutocomplete();
    };
    
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
    };
    
    document.head.appendChild(script);
  
    return () => {
      // Don't remove script on unmount to avoid reloading
    };
  }, []);
  
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error('Google Maps Places not available');
      return;
    }
  
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'gb' },
      fields: ['address_components', 'geometry', 'formatted_address'], // Explicitly request fields
    });
  
    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };
  
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (!place || !place.address_components) {
      console.error('No place data received');
      return;
    }
  
    let addressLine1 = '';
    let city = '';
    let zipcode = '';
    const latitude = place.geometry?.location?.lat() || 0;
    const longitude = place.geometry?.location?.lng() || 0;
  
    // Parse address components
    place.address_components.forEach((component) => {
      const types = component.types;
  
      if (types.includes('street_number')) {
        addressLine1 = component.long_name;
      }
      if (types.includes('route')) {
        addressLine1 += (addressLine1 ? ' ' : '') + component.long_name;
      }
      if (types.includes('postal_town') || types.includes('locality')) {
        city = component.long_name;
      }
      if (types.includes('postal_code')) {
        zipcode = component.long_name;
      }
    });
  
    // Update ONLY the address fields, keep everything else
    setFormData(prev => ({
      ...prev, // Keep all existing fields (name, email, phone)
      addressLine1,
      city,
      zipcode,
      latitude,
      longitude,
    }));
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2">Order Submitted!</h2>
          <p className="text-gray-600">We'll contact you shortly to confirm your catering order.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Event Type:</span>
              <span className="font-medium">{eventDetails?.eventType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time:</span>
              <span className="font-medium">
                {eventDetails?.eventDate} at {eventDetails?.eventTime}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Guests:</span>
              <span className="font-medium">{eventDetails?.guestCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Items:</span>
              <span className="font-medium">{selectedItems.length}</span>
              
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600 font-semibold">Total:</span>
              <span className="font-bold text-lg">${getTotalPrice().toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={resetOrder}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Place Another Order
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Contact Information</h2>
          <p className="text-gray-600">How can we reach you?</p>
        </div>
        <button
          onClick={() => setCurrentStep(2)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+44 7XXX XXXXXX or 07XXX XXXXXX"
            pattern="^(\+?[1-9]\d{1,14}|0\d{10})$"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Enter with country code (e.g., +44) or starting with 0</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Search Address</label>
          <input
            ref={inputRef}
            type="text"
            placeholder="Start typing your address..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Select your address from the dropdown</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address Line 1</label>
          <input
            type="text"
            required
            disabled={!formData.addressLine1} // Disabled until autocomplete fills it
            value={formData.addressLine1}
            onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
            placeholder="Select from search above first"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
          <input
            type="text"
            disabled={!formData.addressLine1} // Disabled until address selected
            value={formData.addressLine2 || ''}
            onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
            placeholder="Apartment, suite, unit, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              type="text"
              required
              disabled={!formData.city} // Disabled until autocomplete fills it
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Select from search above first"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Zipcode</label>
            <input
              type="text"
              required
              disabled={!formData.zipcode} // Disabled until autocomplete fills it
              value={formData.zipcode}
              onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
              placeholder="Select from search above first"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm mb-4">
            {selectedItems.map(({ item, quantity }) => {
              const price = parseFloat(item.price?.toString() || '0');
              const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
              const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
              
              return (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} x{quantity}</span>
                  <span className="font-medium">${(itemPrice * quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          {calculatingPricing && (
            <div className="text-center py-4 text-gray-500">
              Calculating pricing...
            </div>
          )}

          {pricing && (
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>${pricing.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service Charge:</span>
                <span>${pricing.serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee:</span>
                <span>${pricing.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold text-base">
                <span>Total:</span>
                <span>${pricing.total.toFixed(2)}</span>
              </div>
            </div>
          )}

          {!pricing && !calculatingPricing && (
            <div className="flex justify-between pt-4 border-t">
              <span className="font-semibold">Estimated Total:</span>
              <span className="font-bold text-xl">${getTotalPrice().toFixed(2)}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
        >
          {submitting ? 'Submitting...' : 'Submit Catering Order'}
        </button>
      </form>
    </div>
  );
}
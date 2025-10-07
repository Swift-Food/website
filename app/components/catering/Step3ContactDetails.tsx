// components/catering/Step3ContactInfo.tsx

'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useCatering } from '@/context/CateringContext';
import { cateringService } from '@/services/cateringServices';
import { CateringPricingResult, ContactInfo } from '@/types/catering.types';

export default function Step3ContactInfo() {
  const BACKEND_QUANTITY_UNIT = 7;
  const DISPLAY_FEEDS_PER_UNIT = 10;
  const { 
    contactInfo, 
    setContactInfo, 
    setCurrentStep, 
    eventDetails,
    selectedItems,
    getTotalPrice,
    resetOrder,
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
  const [promoCodes, setPromoCodes] = useState<string[]>([]);
  const [promoInput, setPromoInput] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [pricing, setPricing] = useState<CateringPricingResult | null>(null);
  const [calculatingPricing, setCalculatingPricing] = useState(false);
  const [preferredContact, setPreferredContact] = useState<'email' | 'phone'>('email');
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
        formData,
        promoCodes
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
        const restaurantTotal = group.items.reduce((sum : any, item : any) => sum + item.totalPrice, 0);
        
        return {
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          menuItems: group.items,
          status: 'pending',
          restaurantCost: restaurantTotal,
          totalPrice: restaurantTotal,
        };
      });
  
      const pricingResult = await cateringService.calculateCateringPricing(
        orderItems, 
        promoCodes
      );
      
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
    calculatePricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoCodes]);

  const handleApplyPromoCode = async () => {
    if (!promoInput.trim()) return;
    
    setValidatingPromo(true);
    setPromoError('');
    setPromoSuccess('');
    
    try {
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
        const restaurantTotal = group.items.reduce((sum: any, item: any) => sum + item.totalPrice, 0);
        
        return {
          restaurantId: group.restaurantId,
          restaurantName: group.restaurantName,
          menuItems: group.items,
          status: 'pending',
          restaurantCost: restaurantTotal,
          totalPrice: restaurantTotal,
        };
      });
  
      const validation = await cateringService.validatePromoCode(
        promoInput.toUpperCase(),
        orderItems
      );
      
      if (validation.valid) {
        if (!promoCodes.includes(promoInput.toUpperCase())) {
          setPromoCodes([...promoCodes, promoInput.toUpperCase()]);
          setPromoSuccess(`Promo code "${promoInput.toUpperCase()}" applied! You saved £${validation.discount?.toFixed(2)}`);
          setPromoInput('');
        } else {
          setPromoError('This promo code has already been applied');
        }
      } else {
        setPromoError(validation.reason || 'Invalid promo code');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError('Failed to validate promo code');
    } finally {
      setValidatingPromo(false);
    }
  };
  
  const handleRemovePromoCode = (codeToRemove: string) => {
    const updatedCodes = promoCodes.filter(code => code !== codeToRemove);
    setPromoCodes(updatedCodes);
    setPromoSuccess('');
    setPromoError('');
    // The useEffect will automatically trigger calculatePricing when promoCodes changes
  };

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const initAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) {
      console.error('Google Maps Places not available');
      return;
    }
  
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'gb' },
      fields: ['address_components', 'geometry', 'formatted_address'],
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
  
    setFormData(prev => ({
      ...prev,
      addressLine1,
      city,
      zipcode,
      latitude,
      longitude,
    }));
  };

  if (success) {
   
    return (
      <div className="min-h-screen bg-base-100 py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">Thank you! Your catering request has been submitted.</h2>
            <p className="text-base-content/70 text-lg">We'll get back to you within 24 hours via your preferred contact method. Trusted by 90+ London university societies.</p>
          </div>

          <div className="bg-base-200/50 rounded-2xl p-6 md:p-8 mb-8 text-left border border-base-300">
            <h3 className="text-xl font-bold mb-6 text-base-content">Event & Order Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 pb-6 border-b border-base-300">
              <div>
                <p className="text-xs text-base-content/60 mb-1">Event Date & Time</p>
                <p className="font-semibold text-base-content">{eventDetails?.eventDate}</p>
                <p className="text-sm text-base-content/80">{eventDetails?.eventTime}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60 mb-1">Type of Event</p>
                <p className="font-semibold text-base-content capitalize">{eventDetails?.eventType}</p>
              </div>
              <div>
                <p className="text-xs text-base-content/60 mb-1">Guest Count</p>
                <p className="font-semibold text-base-content">{eventDetails?.guestCount}</p>
              </div>
            </div>

            <h4 className="font-bold mb-4 text-base-content">Your Catering List</h4>
            
            {promoCodes.length > 0  && (
              <div className="mb-4 p-3 bg-success/10 border border-success/30 rounded-xl">
                <p className="text-sm text-success font-medium">
                  ✓ Promo codes applied: {promoCodes.join(', ')}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {selectedItems.map(({ item, quantity }) => {
                const price = parseFloat(item.price?.toString() || '0');
                const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                const subtotal = itemPrice * quantity;
            
                const displayFeeds = (quantity / BACKEND_QUANTITY_UNIT) * DISPLAY_FEEDS_PER_UNIT;

                return (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-base-100 rounded-xl">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base-content truncate">{item.name}</p>
                      <p className="text-sm text-base-content/60">Feeds {displayFeeds} people</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">£{subtotal.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {pricing && (
              <div className="space-y-2 pt-4 border-t border-base-300">
                <div className="flex justify-between text-base-content/70">
                  <span>Subtotal</span>
                  <span>£{pricing.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Service Charge</span>
                  <span>£{pricing.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base-content/70">
                  <span>Estimated Delivery Cost</span>
                  <span>£{pricing.deliveryFee.toFixed(2)}</span>
                </div>
                {pricing.promoDiscount && pricing.promoDiscount > 0 && (
                  <div className="flex justify-between text-success font-medium">
                    <span>Promo Discount</span>
                    <span>-£{pricing.promoDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-base-content pt-2 border-t border-base-300">
                  <span>Total</span>
                  <div className="text-right">
                    <p className="">£{pricing.total.toFixed(2)}</p>
                    {pricing.promoDiscount && pricing.promoDiscount > 0 && (
                      <p className="text-sm line-through text-base-content/50">
                        £{(pricing.total + pricing.promoDiscount).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={resetOrder}
              className="bg-dark-pink hover:opacity-90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg"
            >
              Back to Home
            </button>
            <a
              href="https://www.instagram.com/swiftfood_uk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="bg-base-300 hover:bg-base-content/10 text-base-content px-8 py-4 rounded-full font-bold text-lg transition-all inline-block text-center"
            >
              Follow us on Instagram
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Progress Bar */}
      <div className="w-full bg-base-100 h-2">
        <div className="h-2 transition-all duration-300" style={{ width: '100%' }}></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-base-content/60 mb-2">Step 3 of 3 - Contact & Confirmation</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 text-base-content">Your Contact Details</h2>
              <p className="text-base-content/70">Please provide your contact details so we can confirm your catering request.</p>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="text-primary hover:opacity-80 font-medium flex items-center gap-1 mt-1"
            >
              ← Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Name*</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
                />
              </div>

              {/* Telephone */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Telephone*</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Your Phone Number"
                  pattern="^(\+?[1-9]\d{1,14}|0\d{10})$"
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Email*</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
                />
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-base-content">How would you prefer to be contacted?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="email"
                      checked={preferredContact === 'email'}
                      onChange={() => setPreferredContact('email')}
                      className="radio radio-primary"
                    />
                    <span className="text-base-content">Email</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contact"
                      value="phone"
                      checked={preferredContact === 'phone'}
                      onChange={() => setPreferredContact('phone')}
                      className="radio radio-primary"
                    />
                    <span className="text-base-content">Phone</span>
                  </label>
                </div>
              </div>

              {/* Address Search */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Search Address</label>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Start typing your address..."
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all"
                />
                <p className="text-xs text-base-content/60 mt-2">Select your address from the dropdown</p>
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Address Line 1*</label>
                <input
                  type="text"
                  required
                  disabled={!formData.addressLine1}
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  placeholder="Select from search above first"
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all disabled:bg-base-300/30 disabled:cursor-not-allowed"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-base-content">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  disabled={!formData.addressLine1}
                  value={formData.addressLine2 || ''}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  placeholder="Apartment, suite, unit, etc."
                  className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all disabled:bg-base-300/30 disabled:cursor-not-allowed"
                />
              </div>

              {/* City and Zipcode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">City*</label>
                  <input
                    type="text"
                    required
                    disabled={!formData.city}
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Select from search"
                    className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all disabled:bg-base-300/30 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-base-content">Zipcode*</label>
                  <input
                    type="text"
                    required
                    disabled={!formData.zipcode}
                    value={formData.zipcode}
                    onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                    placeholder="Select from search"
                    className="w-full px-4 py-3 bg-base-200/50 border border-base-300 rounded-xl focus:ring-2 focus:ring-dark-pink focus:border-transparent transition-all disabled:bg-base-300/30 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <div className="hidden lg:block pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg disabled:bg-base-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-base-200/30 rounded-2xl p-6 border border-base-300 sticky top-4">
              <h3 className="text-xl font-bold mb-6 text-base-content">Event & Order Summary</h3>
              
              <p className="text-sm text-base-content/70 mb-4">Review your event details and order summary before submitting your request.</p>

              {/* Event Details */}
              <div className="space-y-3 mb-6 pb-6 border-b border-base-300">
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Event Date & Time</span>
                  <span className="font-semibold text-base-content text-right">{eventDetails?.eventDate}<br/>{eventDetails?.eventTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Type of Event</span>
                  <span className="font-semibold text-base-content capitalize">{eventDetails?.eventType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-base-content/70">Guest Count</span>
                  <span className="font-semibold text-base-content">{eventDetails?.guestCount}</span>
                </div>
              </div>

              {/* Catering List */}
              <h4 className="font-bold mb-4 text-base-content">Your Catering List</h4>
              
              {/* Important Notes */}
              <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
                <p className="text-xs font-semibold text-warning mb-2">Important Notes</p>
                <p className="text-xs text-base-content/80 leading-relaxed">
                  For accurate delivery information, please contact stalls or restaurants directly. For any last-minute times, please contact us immediately — at least two days before your event.
                </p>
              </div>

              {/* Promo Code Section */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-base-content">Discount Code</h4>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyPromoCode();
                      }
                    }}
                    placeholder="Add discount code or voucher"
                    className="flex-1 px-4 py-2 bg-base-100 border border-base-300 rounded-lg focus:ring-2 focus:ring-dark-pink focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromoCode}
                    disabled={validatingPromo || !promoInput.trim()}
                    className="px-4 py-2 bg-dark-pink text-white rounded-lg font-medium hover:opacity-90 transition-all disabled:bg-base-300 disabled:cursor-not-allowed text-sm"
                  >
                    {validatingPromo ? '...' : 'Apply'}
                  </button>
                </div>

                {promoError && (
                  <div className="mb-3 p-2 bg-error/10 border border-error/30 rounded-lg">
                    <p className="text-xs text-error">✗ {promoError}</p>
                  </div>
                )}

                {promoSuccess && (
                  <div className="mb-3 p-2 bg-success/10 border border-success/30 rounded-lg">
                    <p className="text-xs text-success">✓ {promoSuccess}</p>
                  </div>
                )}

                {promoCodes.length > 0 && (
                  <div className="space-y-2">
                    {promoCodes.map((code) => (
                      <div key={code} className="flex items-center justify-between bg-base-100 p-2 rounded-lg border border-base-300">
                        <span className="font-mono text-xs font-medium text-primary">{code}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePromoCode(code)}
                          className="text-error hover:opacity-80 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-base-content/60 mt-2">
                  If your organisation is partnered with us, please contact us for vouchers before payment.
                </p>
              </div>

              {/* Order Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {selectedItems.map(({ item, quantity }) => {
                  const price = parseFloat(item.price?.toString() || '0');
                  const discountPrice = parseFloat(item.discountPrice?.toString() || '0');
                  const itemPrice = item.isDiscount && discountPrice > 0 ? discountPrice : price;
                  const subtotal = itemPrice * quantity;
     
                  const displayFeeds = (quantity / BACKEND_QUANTITY_UNIT) * DISPLAY_FEEDS_PER_UNIT;
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-base-content truncate">{item.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {/* <button
                            type="button"
                            className="w-6 h-6 bg-base-100 border border-base-300 rounded flex items-center justify-center hover:bg-base-200 text-sm"
                            onClick={() => {
                              const newQty = Math.max(0, quantity - 10);
                              if (newQty === 0) {
                                removeMenuItem(item.id);
                              } else {
                                updateItemQuantity(item.id, newQty);
                              }
                            }}
                          >
                            −
                          </button> */}
                          
                          <span className="text-xs text-base-content/70">feeds upto {displayFeeds} people</span>
                          {/* <button
                            type="button"
                            className="w-6 h-6 bg-base-100 border border-base-300 rounded flex items-center justify-center hover:bg-base-200 text-sm"
                            onClick={() => {
                              updateItemQuantity(item.id, quantity + 10);
                            }}
                          >
                            +
                          </button> */}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-primary">£{subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pricing Summary */}
              {calculatingPricing && (
                <div className="text-center py-4 text-base-content/60 text-sm">
                  Calculating pricing...
                </div>
              )}

              {pricing && (
                <div className="space-y-2 pt-4 border-t border-base-300">
                  <div className="flex justify-between text-sm text-base-content/70">
                    <span>Subtotal</span>
                    <span>£{pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-base-content/70">
                    <span>Service Charge</span>
                    <span>£{pricing.serviceCharge.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-base-content/70">
                    <span>Estimated Delivery Cost</span>
                    <span>£{pricing.deliveryFee.toFixed(2)}</span>
                  </div>
                  {pricing.promoDiscount && pricing.promoDiscount > 0 && (
                    <div className="flex justify-between text-sm text-success font-medium">
                      <span>Promo Discount</span>
                      <span>-£{pricing.promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-base-content pt-3 border-t border-base-300">
                    <span>Total</span>
                    <div className="text-right">
                      <p className="">£{pricing.total.toFixed(2)}</p>
                      {pricing.promoDiscount && pricing.promoDiscount > 1 && (
                        <p className="text-xs line-through text-base-content/50">
                          £{(pricing.total + pricing.promoDiscount).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!pricing && !calculatingPricing && (
                <div className="flex justify-between pt-4 border-t border-base-300">
                  <span className="font-semibold text-base-content">Estimated Total:</span>
                  <span className="font-bold text-xl text-base-content">£{getTotalPrice().toFixed(2)}</span>
                </div>
              )}

              {/* Mobile Submit Button */}
              <div className="lg:hidden mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg disabled:bg-base-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Submit Button (Below Form) */}
        <div className="lg:hidden mt-6">
          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="w-full bg-dark-pink hover:opacity-90 text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg disabled:bg-base-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}
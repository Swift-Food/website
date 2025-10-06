// components/catering/Step1EventDetails.tsx

'use client';

import { useState, FormEvent } from 'react';
import { useCatering } from '@/context/CateringContext';
import { EventDetails } from '@/types/catering.types';

export default function Step1EventDetails() {
  const { eventDetails, setEventDetails, setCurrentStep } = useCatering();
  
  const [formData, setFormData] = useState<EventDetails>(
    eventDetails || {
      eventType: '',
      eventDate: '',
      eventTime: '',
      guestCount: 10,
      specialRequests: '',
    }
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setEventDetails(formData);
    setCurrentStep(2);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-2">Event Details</h2>
      <p className="text-gray-600 mb-8">Tell us about your catering event</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Event Type</label>
          <select
            required
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select event type</option>
            <option value="corporate">Corporate Event</option>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday Party</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium mb-2">Number of Guests</label>
          <input
            type="number"
            required
            min="1"
            value={formData.guestCount}
            onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Special Requests (Optional)</label>
          <textarea
            rows={4}
            value={formData.specialRequests}
            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            placeholder="Any dietary restrictions, setup requirements, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue to Menu Selection
        </button>
      </form>
    </div>
  );
}
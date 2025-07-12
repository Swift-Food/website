'use client'

import Image from "next/image";
import InfoContainer from "../components/containers/InfoContainer";
import { useState } from "react";

export default function CateringPage() {
  const [deliveryDate, setDeliveryDate] = useState("");
  const [capacity, setCapacity] = useState("");

  const capacityOptions = [
    { value: "", label: "Select capacity" },
    { value: "10-20", label: "10-20 people" },
    { value: "21-50", label: "21-50 people" },
    { value: "51-100", label: "51-100 people" },
    { value: "101-200", label: "101-200 people" },
    { value: "200+", label: "200+ people" },
  ];

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!deliveryDate || !capacity) {
      alert("Please fill in all fields");
      return;
    }
    // Handle form submission
    console.log("Catering request:", { deliveryDate, capacity });
    alert(`Catering request submitted for ${capacity} on ${deliveryDate}`);
  };

  return (
    <div className="px-4 max-w-7xl mx-auto py-8">
      {/* Main Catering Section */}
      <section className="flex w-full gap-6 max-lg:flex-col justify-between mb-12">
        {/* Left side - Store Image */}
        <section className="flex-2 relative h-full rounded-xl overflow-hidden">
          <div className="relative w-full aspect-[4/3] max-lg:aspect-[16/9]">
            <Image
              src="/store.jpg"
              alt="Swift Food Catering"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Right side - Catering Form */}
        <aside className="flex-1 flex flex-col gap-4 items-center max-lg:mt-6">
          <InfoContainer heading="Book Catering" className="relative w-full h-full">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
              {/* Delivery Date Picker */}
              <div className="flex flex-col gap-2">
                <label htmlFor="deliveryDate" className="text-lg font-semibold text-gray-800">
                  Delivery Date
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors text-base"
                  required
                />
              </div>

              {/* Capacity Dropdown */}
              <div className="flex flex-col gap-2">
                <label htmlFor="capacity" className="text-lg font-semibold text-gray-800">
                  Event Capacity
                </label>
                <select
                  id="capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none transition-colors text-base bg-white"
                  required
                >
                  {capacityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-4">
                <button
                  type="submit"
                  className="btn btn-primary rounded-full px-8 py-3 text-white font-semibold text-lg hover:bg-primary/90 transition-colors w-full max-w-xs"
                >
                  Get Started
                </button>
              </div>
            </form>
          </InfoContainer>
        </aside>
      </section>

      {/* How Our Catering Works Section */}
      <section className="w-full py-12 max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 max-sm:text-3xl">
            How Our Catering Works
          </h2>
        </div>

        {/* Fixed-Size Overlapping Containers */}
        <div className="flex justify-center items-center relative max-w-6xl mx-auto mb-16 max-lg:flex-col max-lg:gap-8">
          
          {/* Container 1 - Plan Ahead */}
          <div className="relative z-30 border-4 border-primary rounded-3xl w-80 h-20 bg-transparent flex items-center px-6 max-lg:w-full max-lg:max-w-md">
            {/* Circle with number - leftmost */}
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            
            {/* Step text - middle */}
            <div className="flex-1 text-center">
              <h3 className="text-lg font-bold text-gray-800">
                Plan Ahead
              </h3>
            </div>
          </div>

          {/* Container 2 - Choose Restaurant */}
          <div className="relative z-20 border-4 border-primary rounded-3xl w-80 h-20 bg-transparent flex items-center px-6 -ml-20 max-lg:ml-0 max-lg:w-full max-lg:max-w-md">
            {/* Circle with number - leftmost */}
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">2</span>
            </div>
            
            {/* Step text - middle */}
            <div className="flex-1 text-center">
              <h3 className="text-lg font-bold text-gray-800">
                Choose Restaurant
              </h3>
            </div>
          </div>

          {/* Container 3 - Coordinate Delivery */}
          <div className="relative z-10 border-4 border-primary rounded-3xl w-80 h-20 bg-transparent flex items-center px-6 -ml-20 max-lg:ml-0 max-lg:w-full max-lg:max-w-md">
            {/* Circle with number - leftmost */}
            <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">3</span>
            </div>
            
            {/* Step text - middle */}
            <div className="flex-1 text-center">
              <h3 className="text-lg font-bold text-gray-800">
                Coordinate Delivery
              </h3>
            </div>
          </div>

        </div>

        {/* Process Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Step 1 Details */}
          <div className="text-center p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Timing Requirements</h4>
            <div className="space-y-2">
              <p className="text-gray-700"><strong>24 hours</strong> - 10+ People</p>
              <p className="text-gray-700"><strong>48-72 hours</strong> - 50+ People</p>
            </div>
            <p className="text-gray-600 mt-4 text-sm">
              Contact us in advance to ensure perfect preparation for your event.
            </p>
          </div>

          {/* Step 2 Details */}
          <div className="text-center p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Partner Network</h4>
            <p className="text-gray-700 mb-2">
              Select from our <span className="text-primary font-semibold">partner restaurants</span>
            </p>
            <p className="text-gray-600 text-sm">
              We coordinate with local vendors to prepare your large order with care and precision.
            </p>
          </div>

          {/* Step 3 Details */}
          <div className="text-center p-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-4">Fresh Delivery</h4>
            <p className="text-gray-700 mb-2">
              Timely delivery to your location
            </p>
            <p className="text-gray-600 text-sm">
              We ensure your food arrives fresh and ready to serve at your specified time.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
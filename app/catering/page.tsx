'use client'

import Image from "next/image";
import InfoContainer from "../components/containers/InfoContainer";
import { useState } from "react";
import StepperButtonGroup from "../components/buttons/StepperButtonGroup";
import { ImageTextContainer } from "../components/containers/CompactImageContainer";

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
  const stepperConfig = [
    {
      id: 1,
      step: "1",
      title: "Plan Ahead",
    },
    {
      id: 2,
      step: "2",
      title: "Choose Restaurant",
    },
    {
      id: 3,
      step: "3",
      title: "Coordinate Delivery",
    },
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
        <section className="flex-5 relative h-full rounded-xl overflow-hidden">
          <div className="relative w-full aspect-[4/3] max-lg:aspect-[16/9]">
            <Image
              src="/catering.jpg"
              alt="Swift Food Catering"
              fill
              className="object-cover"
            />
          </div>
        </section>

        {/* Right side - Catering Form */}
        <aside className="flex-2 flex flex-col gap-4 items-center max-lg:mt-6">
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
      <section className="w-full py-12 max-w-7xl mx-auto flex-center">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 mb-8 max-sm:text-3xl">
            How Our Catering Works
          </h2>
        </div>

        <div className="flex justify-center items-center w-full mb-12">
          <StepperButtonGroup steps={stepperConfig} activeItemIds={[]}></StepperButtonGroup>
        </div>
        

        {/* Process Details Cards */}
        <section className="columns-3">
          <ImageTextContainer imageSrc="/goodge.jpg" text="Contact us atleast 24 hours in advance for order of 10+ people. For larger events (50+) we recommend 48-72 hour notice" ></ImageTextContainer>
          <ImageTextContainer imageSrc="/goodge.jpg" text="Contact us atleast 24 hours in advance for order of 10+ people. For larger events (50+) we recommend 48-72 hour notice" ></ImageTextContainer>
          <ImageTextContainer imageSrc="/goodge.jpg" text="Contact us atleast 24 hours in advance for order of 10+ people. For larger events (50+) we recommend 48-72 hour notice" ></ImageTextContainer>
        </section>
      </section>
    </div>
  );
}
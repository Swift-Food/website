import React from "react";

export default function SwiftPartnerStandards() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Food Partner Standards
          </h1>
          <p className="text-gray-600 text-lg">
            Core requirements for restaurants, food stalls, and vendors on our platform
          </p>
          <p className="text-gray-500 mt-2">
            Effective date: August 20, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-8">

          {/* Introduction */}
          <section>
            <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed text-lg">
                At Swift Food, we're committed to delivering safe, fair, and high-quality service to our customers. To achieve this, every restaurant, food stall, or vendor ("Swift Partner") that joins our platform agrees to meet the following core standards:
              </p>
            </div>
          </section>

          {/* Food Safety & Hygiene */}
          <section>
            <div className="border-l-4 border-red-400 pl-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">🛡️</span>
                Food Safety & Hygiene
              </h2>
              <div className="bg-red-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  All Swift Partners must comply with UK food safety laws and maintain a valid Food Standards Agency (FSA) hygiene rating. Partners are responsible for ensuring food is prepared, stored, and delivered in line with these standards.
                </p>
              </div>
            </div>
          </section>

          {/* Menu & Pricing */}
          <section>
            <div className="border-l-4 border-green-400 pl-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">📋</span>
                Menu & Pricing
              </h2>
              <div className="bg-green-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  Partners must provide accurate menus and allergen information. While partners are free to set their own prices, Swift Food strongly recommends that menu prices on the app match those charged in-store or at the stall. This ensures fairness and builds trust with customers.
                </p>
              </div>
            </div>
          </section>

          {/* Order Fulfilment */}
          <section>
            <div className="border-l-4 border-blue-400 pl-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">⏱️</span>
                Order Fulfilment
              </h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  Orders must be prepared in a timely manner, ready for collection or delivery within the preparation times provided to us. Consistent late or missing orders may result in penalties or suspension from the platform.
                </p>
              </div>
            </div>
          </section>

          {/* Data Protection & Privacy */}
          <section>
            <div className="border-l-4 border-purple-400 pl-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">🔒</span>
                Data Protection & Privacy
              </h2>
              <div className="bg-purple-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  Partners are required to handle customer information responsibly and in line with UK GDPR requirements. Data shared with partners (such as delivery addresses and contact numbers) must only be used for fulfilling the specific order and not for marketing or unrelated purposes.
                </p>
              </div>
            </div>
          </section>

          {/* Fair Dealing */}
          <section>
            <div className="border-l-4 border-orange-400 pl-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-3 text-2xl">🤝</span>
                Fair Dealing
              </h2>
              <div className="bg-orange-50 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  Swift Partners are expected to act in good faith, cooperate with audits or checks if necessary, and uphold high standards of service.
                </p>
              </div>
            </div>
          </section>

          {/* Compliance Notice */}
          <section>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                <span className="mr-3 text-xl">⚠️</span>
                Compliance Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Swift Food takes these standards seriously. Failure to comply may result in corrective action, suspension, or termination of the partnership.
              </p>
            </div>
          </section>

          {/* Additional Information */}
          <section>
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Resources</h3>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-start">
                  <span className="mr-3 mt-1 text-primary">📖</span>
                  <span>Full Partner Terms are provided during the onboarding process</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-3 mt-1 text-primary">🔍</span>
                  <span>Regular audits may be conducted to ensure compliance with these standards</span>
                </p>
                <p className="flex items-start">
                  <span className="mr-3 mt-1 text-primary">📞</span>
                  <span>Partner support is available for questions about meeting these requirements</span>
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions or Support?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For more information about these standards or if you need support in meeting them, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Swift Food Services Limited</span></p>
              <p>251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a 
                  href="mailto:swiftfooduk@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  swiftfooduk@gmail.com
                </a>
              </p>
            </div>
            <div className="mt-4 p-4 bg-white rounded-lg border border-primary/20">
              <p className="text-gray-700 text-sm">
                <span className="font-medium text-primary">Note:</span> Full Partner Terms and Conditions are provided during the onboarding process and contain detailed requirements beyond these core standards.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
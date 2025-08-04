import React from "react";

export default function RestaurantPartnerPrivacyPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Food Restaurant Partner Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Learn how Swift Food protects and handles your business information
          </p>
          <p className="text-gray-500 mt-2">
            Effective date: August 3rd, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
          
          {/* Who we are */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Who we are</h2>
            <p className="text-gray-600 leading-relaxed">
              Swift Food Services Limited ("Swift Food", "we", "our", "us") operates the Swift Food platform for restaurants 
              ("Swift Partners"). This Privacy Policy explains how we collect, use, and protect your business and personal information.
            </p>
          </section>

          {/* What data we collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. What data we collect</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              When you sign up and use the platform, we may collect:
            </p>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Business details:</h3>
                <p className="text-gray-600">
                  Restaurant name, address, VAT/registration number, contact details
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Menu and operations info:</h3>
                <p className="text-gray-600">
                  Menus, prices, price changes, operating hours, estimated preparation times
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Certifications and compliance documents:</h3>
                <div className="text-gray-600 space-y-1">
                  <p>• Food Standards Agency (FSA) hygiene rating or certificate</p>
                  <p>• Allergen information</p>
                  <p>• Food business registration certificate</p>
                  <p>• Public liability insurance</p>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-xl font-medium text-gray-800 mb-3">Additional data:</h3>
                <div className="text-gray-600 space-y-1">
                  <p>• Bank and payment details</p>
                  <p>• Platform usage data</p>
                  <p>• Communications: emails, messages, and support queries</p>
                </div>
              </div>
            </div>
          </section>

          {/* How we use your data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How we use your data</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid gap-3 text-gray-600">
                <p>• Set up and manage your restaurant's account</p>
                <p>• Process payments and transfer payouts</p>
                <p>• Display your menu, prices, and branding on our app and website</p>
                <p>• Ensure food safety and regulatory compliance</p>
                <p>• Improve our platform and services</p>
                <p>• Send important updates about orders, platform changes, or legal obligations</p>
              </div>
            </div>
          </section>

          {/* Who we share your data with */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Who we share your data with</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Our payment processors:</h4>
                <p className="text-gray-600">(to process payouts)</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Our drivers/riders:</h4>
                <p className="text-gray-600">(limited to order fulfilment details)</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Regulators or law enforcement:</h4>
                <p className="text-gray-600">if legally required</p>
              </div>
            </div>
          </section>

          {/* How long we keep your data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. How long we keep your data</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your data as long as you are a partner and for up to 7 years after account closure 
              for tax and legal purposes.
            </p>
          </section>

          {/* Your rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have the right to request:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3 text-gray-600">
                <p>• A copy of the data we hold about you</p>
                <p>• Corrections to inaccurate data</p>
                <p>• Deletion of your data (where legally possible)</p>
              </div>
            </div>
          </section>

          {/* Data security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Data security</h2>
            <p className="text-gray-600 leading-relaxed">
              We use encryption and secure servers to protect your data. Access is restricted to authorised staff only.
            </p>
          </section>

          {/* Contact us */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions or wish to exercise your rights, contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Company:</span> Swift Food Services Limited</p>
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
          </section>

        </div>
      </div>
    </div>
  );
}
import React from "react";

export default function ContentRightsPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Food Services Limited – Content Rights Policy
          </h1>
          <p className="text-gray-600 text-lg">
            How we handle content, intellectual property rights, and infringement procedures
          </p>
          <p className="text-gray-500 mt-2">
            Effective date: August 20, 2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">

          {/* Purpose */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Purpose</h2>
            <p className="text-gray-600 leading-relaxed">
              This Content Rights Policy explains how Swift Food Services Limited ("we", "our", "us") handles content uploaded by restaurants and users, how intellectual property rights are respected, and the steps to take if you believe your rights have been infringed.
            </p>
          </section>

          {/* Who Can Upload Content */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Who Can Upload Content</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium">Restaurants</span> may upload menus, images, descriptions, logos, and branding materials to the Swift Food platform.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium">Customers</span> may submit star ratings as part of reviews.
                </p>
              </div>
            </div>
          </section>

          {/* Ownership and Permissions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Ownership and Permissions</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                Restaurants must ensure they own or have the appropriate rights to all content they upload, including photographs, logos, and branding.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By uploading content, restaurants grant Swift Food a worldwide, royalty-free, non-exclusive licence to use, display, reproduce, and promote this content on our platform, in marketing campaigns, and on partner channels.
              </p>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">Important:</span> If Swift Food provides photography or other creative services, the resulting images and materials remain the property of Swift Food. Restaurants are granted a limited licence to use those images only on the Swift Food platform, unless otherwise agreed in writing.
                </p>
              </div>
            </div>
          </section>

          {/* Swift Food Branding and Marketing Materials */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Swift Food Branding and Marketing Materials</h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                All Swift Food illustrations, images, logos, designs, and other marketing materials are protected by copyright and other intellectual property laws.
              </p>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">Restriction:</span> No restaurant, customer, or third party may use, copy, or distribute Swift Food's marketing materials without our prior written permission.
                </p>
              </div>
            </div>
          </section>

          {/* Prohibited Content */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Prohibited Content</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You must not upload or share:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3 text-gray-600">
                <p>• Content you do not own or have permission to use</p>
                <p>• Copyrighted photographs, images, or text taken from other businesses or websites without permission</p>
                <p>• Any content that infringes another party's trademarks or other intellectual property rights</p>
              </div>
            </div>
          </section>

          {/* Notice & Takedown Process */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Notice & Takedown Process</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              If you believe content on Swift Food infringes your intellectual property rights:
            </p>
            
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Step 1: Submit a Notice</h3>
                <p className="text-gray-600 mb-3">
                  Email us at{" "}
                  <a 
                    href="mailto:swiftfooduk@gmail.com" 
                    className="text-primary hover:underline font-medium"
                  >
                    swiftfooduk@gmail.com
                  </a>{" "}
                  with the following:
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2 text-gray-600">
                    <p>• Your contact details</p>
                    <p>• A description of the infringing content and where it appears</p>
                    <p>• Proof of ownership or rights</p>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Step 2: Our Review</h3>
                <p className="text-gray-600">
                  We will review the request, remove or disable the content where appropriate, and notify the uploader.
                </p>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Step 3: Appeal Process</h3>
                <p className="text-gray-600">
                  The uploader may submit an appeal with evidence showing they have the right to use the content.
                </p>
              </div>
            </div>
          </section>

          {/* Repeat Infringers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Repeat Infringers</h2>
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-medium">Account Suspension:</span> Any restaurant or user who is found to have repeatedly infringed intellectual property rights (3 violations) may have their account permanently suspended.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              This policy is governed by the laws of England and Wales.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions or Concerns?</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about this Content Rights Policy or need to report an infringement, please contact us:
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
          </section>

        </div>
      </div>
    </div>
  );
}
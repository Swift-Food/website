import React from "react";

export default function SwiftPartnerPolicies() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Partner Policies
          </h1>
          <p className="text-gray-600 text-lg">
            Legal requirements and operational standards for Swift Food platform partners
          </p>
          <p className="text-gray-500 mt-2">
            Effective date: August 15, 2025
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-8">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
            <p className="text-gray-700 leading-relaxed">
              These Partner Policies (the "Policies") govern the relationship between Swift Food Services Ltd ("Swift Food", "we", "us", or "our"), a company registered in England and Wales with company number 16457702 and registered office at 251 Grays Inn Rd, London WC1X 8QT, and each restaurant, food stall, or vendor ("Swift Partner", "you", or "your") that uses the Swift Food platform. These Policies are legally binding and apply in addition to the Partner Terms and Conditions. By signing up as a Swift Partner, you agree to comply fully with these Policies.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-10">

          {/* 1. General Obligations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">1. General Obligations of Swift Partners</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.1</span> You must at all times operate your business in compliance with all applicable laws, regulations, and Food Standards Agency (FSA) requirements.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.2</span> You must hold a valid Food Hygiene Rating Scheme (FHRS) rating of at least 3, and promptly notify Swift Food of any changes to this rating.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.3</span> You must ensure that food and beverages are prepared in accordance with all relevant health, hygiene, and safety standards, and that packaging used is suitable for transportation and delivery.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.4</span> You must provide Swift Food with accurate, up-to-date information about your menu, prices, opening hours, and any special requirements.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Menu, Pricing and Discounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">2. Menu, Pricing and Discounts</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.1</span> Partners may set their own prices for menu items on the Platform. Swift Food encourages pricing that is consistent with in-store prices, but does not require it. However, Partners must ensure that prices are clearly displayed, accurate, and not misleading to consumers.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.2</span> All discounts offered on the platform must be initiated by you as the Partner, although Swift Food may from time to time initiate promotional campaigns in collaboration with you.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.3</span> You are responsible for ensuring that menu items and prices are kept accurate and updated at all times.
                </p>
              </div>
            </div>
          </section>

          {/* 3. Order Acceptance and Fulfilment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">3. Order Acceptance and Fulfilment</h2>
            <div className="space-y-4">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">3.1</span> Orders placed through the Swift Food platform must be accepted or rejected within 30 seconds. Failure to accept within this timeframe may result in the order being automatically reassigned or cancelled.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.2</span> You are responsible for preparing orders accurately, in a timely manner, and in accordance with the order details submitted by the customer.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.3</span> Food must be packaged securely to avoid leakage, spillage, or contamination during delivery.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.4</span> If an item is unavailable, you must update the menu immediately and notify Swift Food so the item can be temporarily removed.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Food Safety and Hygiene */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">4. Food Safety and Hygiene</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">4.1</span> You must comply at all times with all relevant food safety and hygiene laws and maintain valid certifications.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">4.2</span> Swift Food reserves the right to suspend or remove any Partner from the platform if there are substantiated complaints relating to food safety, hygiene, or packaging quality.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Delivery and Riders */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">5. Delivery and Riders</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.1</span> Deliveries will generally be handled by Swift Food riders or third-party delivery partners. In certain cases, Swift Partners may use their own delivery staff subject to prior written approval.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.2</span> Riders will be provided with the customer's delivery address, order details, and phone number (where provided) strictly for the purposes of fulfilling the delivery.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Customer Complaints and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">6. Customer Complaints and Refunds</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.1</span> Swift Food will handle customer complaints in the first instance. Where a complaint is linked to the quality of food or preparation errors, Swift Food may liaise with you to investigate the issue.
                </p>
              </div>
              <div className="bg-orange-50 border-l-4 border-orange-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">6.2</span> Refunds or credits may be issued to customers on a case-by-case basis. Where refunds are issued due to Partner error (e.g., missing items, incorrect preparation), the refunded amount may be deducted from your next settlement.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.3</span> Refunds are not guaranteed and remain at the sole discretion of Swift Food.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Intellectual Property and Marketing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">7. Intellectual Property and Marketing</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.1</span> You grant Swift Food a non-exclusive, royalty-free licence to use your business name, logo, menu items, photographs, and other content provided by you for the purposes of displaying your business on the platform and promoting it to customers.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.2</span> Swift Food may also create its own photographs, descriptions, or marketing content for your business. Such content will remain the property of Swift Food.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Termination and Suspension */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">8. Termination and Suspension</h2>
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">8.1</span> Swift Food may suspend or terminate your participation on the platform with immediate effect if you breach these Policies, fail to maintain required standards, or act in a way that may damage Swift Food's reputation.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.2</span> You may terminate your participation by giving Swift Food 30 days' written notice.
                </p>
              </div>
            </div>
          </section>

          {/* 9. Payments and Settlement */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">9. Payments and Settlement</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.1</span> Swift Food will collect all payments from customers on your behalf.
                </p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.2</span> Settlements will be made to your nominated bank account on a monthly basis, subject to deductions for refunds, chargebacks, commissions, and service fees.
                </p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.3</span> A detailed statement will be provided with each settlement, showing completed orders, deductions, and net amounts payable.
                </p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.4</span> You are responsible for providing accurate bank details and notifying Swift Food of any changes.
                </p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.5</span> Swift Food is PCI DSS compliant and uses secure payment processors to manage customer payments.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Governing Law and Jurisdiction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">10. Governing Law and Jurisdiction</h2>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                These Policies shall be governed by and construed in accordance with the laws of England and Wales. The courts of England and Wales shall have exclusive jurisdiction to resolve any disputes arising under or in connection with these Policies.
              </p>
            </div>
          </section>

          {/* 11. Insurance Obligations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">11. Insurance Obligations</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Swift Partners must maintain adequate public liability insurance and product liability insurance covering the preparation and sale of food and beverages to customers. Proof of insurance must be provided to Swift Food upon request, and coverage must remain valid throughout the duration of the partnership. Failure to maintain valid insurance may result in immediate suspension or termination of the partnership.
              </p>
            </div>
          </section>

          {/* 12. Allergen & Ingredient Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">12. Allergen & Ingredient Information</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Swift Partners must clearly and accurately provide all allergen and ingredient information in compliance with applicable UK legislation, including the Food Information Regulations 2014 and Natasha's Law. This information must be kept up to date and provided through the Swift Food system. Misrepresentation or failure to provide accurate allergen information may result in suspension or termination of the partnership.
              </p>
            </div>
          </section>

          {/* 13. Data Protection & GDPR */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">13. Data Protection & GDPR</h2>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Swift Partners are required to handle all customer personal data in compliance with the UK General Data Protection Regulation (GDPR). Partners may only use customer data for the purpose of fulfilling Swift Food orders and are prohibited from using this information for independent marketing or any other purpose. Partners must ensure that customer data is kept secure and confidential at all times.
              </p>
            </div>
          </section>

          {/* 14. Audit & Inspections */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">14. Audit & Inspections</h2>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Swift Food reserves the right to conduct audits and inspections of Swift Partners, including but not limited to reviewing menu data, allergen and ingredient information, hygiene compliance, and order preparation practices. These audits may be carried out directly or through authorised third parties. Failure to comply with audit requirements may result in penalties, suspension, or termination.
              </p>
            </div>
          </section>

          {/* 15. Service Level Standards */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">15. Service Level Standards</h2>
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Swift Partners must ensure that all orders are prepared within 5 minutes of the predicted preparation time provided through the Swift Food system. Repeated delays, failures, or service quality issues may result in financial penalties, reduced visibility on the platform, suspension, or termination of the partnership.
              </p>
            </div>
          </section>

          {/* 16. Force Majeure */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">16. Force Majeure</h2>
            <div className="bg-slate-50 border-l-4 border-slate-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                Neither Swift Food nor Swift Partners shall be held liable for any failure or delay in performance caused by events beyond their reasonable control, including but not limited to natural disasters, pandemics, strikes, government restrictions, power outages, or other unforeseen events. In such cases, the affected party must notify the other as soon as reasonably possible and take steps to mitigate the impact.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Questions or Support</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have questions about these Partner Policies or need support, please contact us:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Swift Food Services Limited</span></p>
              <p>Company Number: 16457702</p>
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
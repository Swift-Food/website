import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Consumer Terms and Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            Legal terms governing your use of the Swift Food platform as a customer
          </p>
          <p className="text-gray-500 mt-2">
            Last Updated: 15/08/2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-10">

          {/* 1. Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">1. Definitions</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              In these Terms, the following words have the meanings set out below:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Swift Food," "we," "our," or "us"</span> means Swift Food Services Limited, registered in England and Wales with company number 16457702 and registered office at 251 Grays Inn Rd, London WC1X 8QT, United Kingdom.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Platform"</span> means our website at swiftfood.uk, our mobile applications, and any other technology, tools, or services provided by Swift Food that allow you to browse, order, and arrange delivery of food or beverages from Swift Partners.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Swift Partner"</span> means any independent restaurant, food stall, market vendor, or other food or beverage business that has agreed to list and sell their products through the Platform.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Rider"</span> means any individual who delivers Items ordered through the Platform, whether as a Reserve Driver directly engaged by Swift Food or an independent contractor connected to the Platform.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Items"</span> means the food, drinks, or other goods made available for order through the Platform by a Swift Partner.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Order"</span> means a request placed by you through the Platform for Items from a Swift Partner, whether for delivery or collection.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Service Fee"</span> means the additional charge applied to each Order for the provision of our Platform and related services, as displayed at checkout.
                </p>
              </div>
              <div className="border-l-4 border-teal-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Swift Food Credits"</span> means non-refundable credits issued by Swift Food, redeemable only on the Platform and subject to expiry.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">"Force Majeure Event"</span> means any event or circumstance beyond our reasonable control, including but not limited to severe weather, acts of God, strikes, riots, acts of terrorism, accidents, pandemics, or disruptions to transport or communication networks.
                </p>
              </div>
            </div>
          </section>

          {/* 2. About These Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">2. About These Terms</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">2.1 Purpose of These Terms</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              These Terms govern your access to and use of the Platform and form a legally binding agreement between you and Swift Food. They set out your rights and responsibilities when placing Orders and using our services, as well as our obligations to you.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">2.2 Supplementary Policies</h3>
            <p className="text-gray-600 leading-relaxed mb-4">These Terms should be read alongside our:</p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <ul className="space-y-2 text-gray-700">
                <li>• Privacy Policy, which explains how we collect, use, and protect your personal information;</li>
                <li>• Cookies Policy, which explains how we use cookies and similar technologies on the Platform;</li>
                <li>• Swift Partner Terms, which apply to Swift Partners listing their Items on our Platform; and</li>
                <li>• Any other policy we publish that relates to the use of our Platform.</li>
              </ul>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              If there is any inconsistency between these Terms and the supplementary policies, these Terms will take precedence, unless the supplementary policy states otherwise.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">2.3 Acceptance of Terms</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              By creating an account, placing an Order, or otherwise using the Platform, you confirm that you:
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                (a) accept and agree to be bound by these Terms; and<br/>
                (b) have the legal capacity to enter into a binding agreement under the laws of England and Wales.
              </p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              If you do not agree to these Terms, you must not use the Platform.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">2.4 Changes to These Terms</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may amend these Terms from time to time to reflect changes in our business practices, services, applicable laws, or for other valid reasons. Significant changes will be notified via the Platform, by email, or by in-app message.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              The latest version of these Terms will always be available on the Platform. Your continued use of the Platform after updated Terms are posted constitutes your acceptance of those changes. If you do not agree to the updated Terms, you must stop using the Platform immediately.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">2.5 Governing Law</h3>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by the laws of England and Wales, and any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </div>
          </section>

          {/* 3. Our Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">3. Our Services</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">3.1 What We Do</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Swift Food provides a Platform that allows you to browse, order, and arrange delivery of Items from Swift Partners. We facilitate the processing of your Order, coordinate delivery through Riders, and provide customer support in certain cases.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.2 Who Prepares Your Order</h3>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                All Items available on the Platform are prepared and supplied by Swift Partners. We do not manufacture, prepare, or package any food or drink ourselves unless otherwise stated. The contract for the supply of the Items is between you and the relevant Swift Partner. Swift Food is not responsible for the quality, safety, or compliance of the Items provided, except to the extent required by law.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.3 Our Role in Delivery</h3>
            <p className="text-gray-600 leading-relaxed mb-4">Where delivery is offered, it may be fulfilled by:</p>
            <div className="space-y-4 mb-6">
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600">(a) a Reserve Driver directly engaged by Swift Food; or</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600">(b) an Independent Rider, which includes self-employed couriers who sign up to the Platform directly or are provided to the Platform through approved courier partners.</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              All Riders are responsible for collecting the Items from the Swift Partner and delivering them to the address provided in your Order. We act as an agent on behalf of the Swift Partner for the purpose of arranging delivery.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.4 Allergy, Dietary, and Ingredient Information</h3>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                Swift Partners are responsible for providing accurate information about the Items they offer, including allergy and dietary information. While we encourage Partners to supply full details, we cannot guarantee the accuracy or completeness of such information. If you have specific dietary or allergy concerns, you must contact the Swift Partner directly before placing your Order.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.5 Availability of the Platform</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We aim to ensure the Platform is available 24/7, but we do not guarantee uninterrupted access. Access may be suspended temporarily without notice for maintenance, upgrades, or technical issues.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.6 Changes to Our Services</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We may update, modify, or discontinue any part of the Platform or services at any time without liability, provided that such changes do not materially affect any Orders already placed.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">3.7 Limits of Liability</h3>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4">
              <div className="text-gray-700 leading-relaxed space-y-2">
                <p>To the fullest extent permitted by law:</p>
                <p>• We are not responsible for any indirect, incidental, or consequential losses arising from your use of the Platform;</p>
                <p>• Our total liability to you in connection with any Order will be limited to the total price paid for that Order; and</p>
                <p>• Nothing in these Terms limits your statutory rights as a consumer under UK law.</p>
                <p>• Swift Food requires all Swift Partners to maintain appropriate insurance in relation to the preparation and sale of food. However, Swift Food is not responsible for verifying the scope of such insurance or for any claims arising directly from the food provided by Swift Partners.</p>
              </div>
            </div>
          </section>

          {/* 4. Orders & Payment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">4. Orders & Payment</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">4.1 Placing an Order</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You may place an Order through the Platform by selecting Items from a Swift Partner's menu, adding them to your basket, and proceeding through the checkout process. Before confirming your Order, you will be shown a summary of the Items, prices, service fees, delivery charges, and any applicable taxes. You must review this summary carefully before placing your Order.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.2 When an Order is Confirmed</h3>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                Once you place an Order, we will send you an acknowledgement by email, SMS, or in-app notification. This acknowledgement confirms we have received your Order, not that it has been accepted. Your Order is only accepted when the relevant Swift Partner confirms preparation has started. At that point, a contract for the supply of the Items exists between you and the Swift Partner.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.3 Cancellations by You</h3>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 leading-relaxed">• You may cancel an Order at any time before the Swift Partner begins preparing the Items.</p>
              <p className="text-gray-600 leading-relaxed">• Once preparation has started, you cannot cancel the Order, and you will be charged in full.</p>
              <p className="text-gray-600 leading-relaxed">• If you believe your Order should be cancelled due to an error or other exceptional circumstances, you must contact us immediately. Refunds in such cases will be assessed on a case-by-case basis.</p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.4 Cancellations by Us or the Swift Partner</h3>
            <p className="text-gray-600 leading-relaxed mb-4">An Order may be cancelled if:</p>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">• The Swift Partner is unable to prepare the Items;</p>
              <p className="text-gray-600">• We cannot allocate a Rider to deliver the Items; or</p>
              <p className="text-gray-600">• There is an error in the pricing, availability, or description of the Items.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">If your Order is cancelled after payment, you will receive a full refund.</p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.5 Pricing and Payment</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              All prices shown on the Platform are inclusive of applicable taxes unless stated otherwise. Additional fees, such as service fees or delivery charges, will be clearly displayed before checkout.
            </p>
            <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed">
                • We accept payment via major debit and credit cards, Apple Pay, and other methods shown at checkout.<br/>
                • Payments are handled securely by our payment partners, who are fully compliant with the Payment Card Industry Data Security Standard (PCI DSS). Swift Food does not directly store or process your card details.
              </p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.6 Refunds and Credits</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If there is an issue with your Order (e.g., missing or incorrect Items, poor quality, or late delivery), you must report it promptly through our customer support form or email.
            </p>
            <div className="space-y-4 mb-6">
              <p className="text-gray-600 leading-relaxed">• Refunds are not automatic and are assessed individually based on the circumstances and any supporting evidence (e.g., photographs, order logs).</p>
              <p className="text-gray-600 leading-relaxed">• We may offer a cash refund or Swift Food Credits at our sole discretion. Credits are non-refundable, can only be used on the Platform, and may expire after a stated period.</p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.7 Missing or Incorrect Items</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              If Items are missing from your Order or are incorrect, we will investigate the matter and, where appropriate, provide a refund, replacement, or credit.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.8 Tips</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You may choose to add a tip for the Rider at checkout. 100% of the tip amount, after payment processing fees, is passed to the Rider. Tips are voluntary and non-refundable.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">4.9 Failed Deliveries</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You are responsible for providing an accurate delivery address and ensuring someone is available to receive the Order.
            </p>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                • If the Rider cannot deliver due to an incorrect address, inability to contact you, or an unsafe delivery environment, the Order will be marked as completed and you may be charged in full.<br/>
                • We will make reasonable efforts to contact you before a delivery is marked as failed.
              </p>
            </div>
          </section>

          {/* 5. Your Account */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">5. Your Account</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">5.1 Creating an Account</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              To place Orders through the Platform, you must create a Swift Food account by providing accurate and complete information, including your name, email address, delivery address, and phone number. You must be at least 18 years old to create an account and place an Order.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">5.2 Account Security</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You are responsible for maintaining the confidentiality of your login credentials and for all activities carried out under your account. You must notify us immediately if you suspect unauthorised access to your account.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">5.3 Account Accuracy</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You agree to keep your account details accurate and up to date, including your delivery address and payment details. Failure to do so may result in failed deliveries or suspension of your account.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">5.4 Account Suspension or Termination by Us</h3>
            <p className="text-gray-600 leading-relaxed mb-4">We may suspend or terminate your account if:</p>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">• You breach these Terms;</p>
              <p className="text-gray-600">• We suspect fraud, misuse, or unauthorised activity; or</p>
              <p className="text-gray-600">• We are required to do so by law or a regulatory authority.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              We will usually notify you before suspending or terminating your account unless doing so would compromise an investigation or violate legal requirements.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">5.5 Deleting Your Account</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may request the deletion of your account at any time. Once your account is deleted, you will no longer have access to order history, stored payment methods, or any remaining Swift Food Credits.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="text-gray-700 leading-relaxed">
                <p className="font-medium mb-2">How to Request Account Deletion:</p>
                <p className="mb-2">Send an email to swiftfooduk@gmail.com with the subject line:</p>
                <p className="font-mono bg-white p-2 rounded border mb-3">Account Deletion Request – [Your Full Name]</p>
                <p className="mb-2">Include in your message:</p>
                <ul className="space-y-1 ml-4">
                  <li>• Your full name</li>
                  <li>• Your registered email address</li>
                  <li>• Your phone number (if linked to the account)</li>
                  <li>• A brief confirmation that you want your account permanently deleted</li>
                </ul>
                <p className="mt-3">We may require additional verification to confirm your identity before processing your request.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">5.6 Our Retention of Data After Deletion</h3>
            <p className="text-gray-600 leading-relaxed">
              Even after your account is deleted, we may retain certain information as required by law (e.g., for tax, fraud prevention, or dispute resolution purposes). This retained information will be handled in accordance with our Privacy Policy.
            </p>
          </section>

          {/* 6. Your Use of the Platform */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">6. Your Use of the Platform</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">6.1 Acceptable Use</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You may use the Platform only for lawful purposes and in accordance with these Terms. You agree not to:
            </p>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="text-gray-700 leading-relaxed space-y-1">
                <p>• Use the Platform in any way that violates applicable law or regulation;</p>
                <p>• Place fake or fraudulent Orders;</p>
                <p>• Interfere with or disrupt the operation of the Platform, its security features, or its servers;</p>
                <p>• Attempt to gain unauthorised access to any part of the Platform, accounts, or systems;</p>
                <p>• Use automated tools or scripts to interact with the Platform (including scraping or data mining);</p>
                <p>• Misrepresent your identity or provide false information;</p>
                <p>• Engage in any behaviour that could harm the reputation of Swift Food, our Swift Partners, or our Riders.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">6.2 User Content</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you submit content to the Platform (such as reviews, ratings, or photos), you grant Swift Food a non-exclusive, royalty-free, transferable licence to use, reproduce, modify, and display that content in connection with the Platform and our services. You are responsible for ensuring your content:
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">• Is accurate and not misleading;</p>
              <p className="text-gray-600">• Does not infringe any third-party rights;</p>
              <p className="text-gray-600">• Is not defamatory, obscene, offensive, or otherwise unlawful.</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              We reserve the right to remove or edit any content you submit if we believe it violates these Terms or applicable law.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">6.3 Intellectual Property</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              All content, trademarks, logos, software, and other materials on the Platform are owned by or licensed to Swift Food. You may use them only as necessary to use the Platform in accordance with these Terms. You may not copy, reproduce, distribute, or create derivative works without our prior written consent.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">6.4 Breach of This Section</h3>
            <p className="text-gray-600 leading-relaxed mb-4">If we reasonably believe you have breached this section, we may:</p>
            <div className="space-y-2">
              <p className="text-gray-600">• Suspend or terminate your account;</p>
              <p className="text-gray-600">• Cancel any Orders in progress;</p>
              <p className="text-gray-600">• Take legal action against you; and/or</p>
              <p className="text-gray-600">• Report you to relevant authorities.</p>
            </div>
          </section>

          {/* 7. Customer Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">7. Customer Responsibilities</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">7.1 Providing Accurate Information</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You must ensure that all information you provide to Swift Food — including your delivery address, contact details, and payment information — is accurate, complete, and kept up to date.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">7.2 Being Available for Delivery</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You must ensure that someone is available at the delivery address during the estimated delivery time to receive your Order. Riders may contact you via the phone number linked to your account if needed.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">7.3 Access to the Delivery Location</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              You must ensure the Rider can access the delivery address safely and without obstruction. If the Rider is unable to deliver due to:
            </p>
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">• Incorrect address details;</p>
              <p className="text-gray-600">• No one available to receive the Order;</p>
              <p className="text-gray-600">• An unsafe delivery environment;</p>
            </div>
            <p className="text-gray-600 leading-relaxed mb-6">
              the Order may be marked as completed and you may be charged in full.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">7.4 Age-Restricted Items</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              If your Order contains age-restricted items (such as alcohol), you may be asked to provide valid photo identification at the point of delivery. Riders reserve the right to refuse delivery if you cannot provide acceptable proof of age.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">7.5 Compliance with Laws</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You must comply with all applicable laws and regulations when using the Platform, including those relating to food safety, alcohol, and public health.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">7.6 Prohibited Behaviour</h3>
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-gray-700 leading-relaxed mb-2">You must not:</p>
              <div className="space-y-1">
                <p className="text-gray-700">• Verbally or physically abuse Riders, Swift Partners, or Swift Food staff;</p>
                <p className="text-gray-700">• Attempt to interfere with or influence the preparation of Orders at a Swift Partner's premises;</p>
                <p className="text-gray-700">• Engage in discriminatory, harassing, or illegal conduct.</p>
              </div>
            </div>
          </section>

          {/* 8. Our Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">8. Our Responsibilities</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">8.1 Service Provision</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We provide the Platform that connects customers, Swift Partners, and Riders. While we facilitate Orders and deliveries, the preparation and quality of the Items are the responsibility of the Swift Partner.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">8.2 Quality of Items</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Swift Partners are solely responsible for the quality, safety, and compliance of the Items they supply. We do not independently verify ingredient lists or allergen information unless explicitly stated.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">8.3 Service Availability</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We will use reasonable efforts to keep the Platform available and operational but do not guarantee uninterrupted access. We may suspend, withdraw, or modify the Platform without notice for maintenance, updates, or other reasons.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">8.4 Limitation of Liability</h3>
            <div className="bg-gray-50 border-l-4 border-gray-400 p-4 mb-6">
              <p className="text-gray-700 leading-relaxed mb-2">To the fullest extent permitted by law:</p>
              <div className="space-y-1">
                <p className="text-gray-700">• We are not liable for any indirect, incidental, or consequential losses;</p>
                <p className="text-gray-700">• Our total liability for any Order is limited to the price you paid for that Order;</p>
                <p className="text-gray-700">• We are not liable for delays or failures caused by events beyond our reasonable control, including severe weather, accidents, road closures, or strikes.</p>
              </div>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">8.5 Statutory Rights</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              Nothing in these Terms affects your statutory rights under UK consumer law, including your right to receive Items that are as described, of satisfactory quality, and fit for purpose.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">8.6 Issues with Orders</h3>
            <p className="text-gray-600 leading-relaxed">
              If something goes wrong with your Order (e.g., missing Items, poor quality, late delivery), you must report it promptly through our customer support form or email. We will investigate and, where appropriate, offer a refund, replacement, or credit in line with Section 4.6.
            </p>
          </section>

          {/* 9. Changes to These Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">9. Changes to These Terms</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">9.1 Right to Update</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              We may update or amend these Terms from time to time to reflect changes in our business operations, legal obligations, or customer needs.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">9.2 How We Notify You</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              If we make significant changes, we will give you notice by one or more of the following methods:
            </p>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">• Posting the updated Terms on the Platform;</p>
              <p className="text-gray-600">• Sending an email to the address registered to your account;</p>
              <p className="text-gray-600">• Displaying a prominent in-app or website notification.</p>
            </div>

            <h3 className="text-xl font-medium text-gray-800 mb-4">9.3 Continued Use</h3>
            <p className="text-gray-600 leading-relaxed">
              If you continue to use the Platform after the updated Terms come into effect, you will be deemed to have accepted the changes. If you do not agree with the new Terms, you must stop using the Platform and request the deletion of your account in accordance with Section 5.5.
            </p>
          </section>

          {/* 10. Governing Law & Jurisdiction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">10. Governing Law & Jurisdiction</h2>
            
            <h3 className="text-xl font-medium text-gray-800 mb-4">10.1 Applicable Law</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              These Terms and any disputes arising from or in connection with them (including non-contractual disputes or claims) are governed by the laws of England and Wales.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">10.2 Jurisdiction</h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              You agree that the courts of England and Wales will have exclusive jurisdiction over any disputes relating to these Terms, your use of the Platform, or any Orders placed through it.
            </p>

            <h3 className="text-xl font-medium text-gray-800 mb-4">10.3 Consumer Rights</h3>
            <p className="text-gray-600 leading-relaxed">
              If you are a consumer resident in the UK, you may also be entitled to bring proceedings in your local courts. Nothing in this section limits your statutory rights.
            </p>
          </section>

          {/* 11. Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions, feedback, or complaints about these Terms or the Platform, you can contact us using the details below:
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Swift Food Services Limited</span></p>
              <p>Registered in England and Wales (Company No. 16457702)</p>
              <p>Registered Address: 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a 
                  href="mailto:swiftfooduk@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  swiftfooduk@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium">Website Contact Form:</span>{" "}
                <a 
                  href="https://swiftfood.uk/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  https://swiftfood.uk/contact
                </a>
              </p>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              We aim to respond to all enquiries within 5 business days, but response times may vary depending on the nature of your request.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
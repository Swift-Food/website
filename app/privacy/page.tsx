import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Food Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-gray-500 mt-2">
            Last updated: 15/08/2025
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-8">

          {/* 1. Contact Details */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Contact Details</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Swift Food Services Limited ("Swift Food", "we", "our", "us") is the controller of your personal information for the purposes of UK data protection laws, including the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy, the way we handle your personal information, or if you wish to exercise your legal rights (as described in Section 9), you can contact us through the following methods:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <div className="space-y-2 text-gray-700">
                <p><span className="font-medium">Email:</span> swiftfooduk@gmail.com</p>
                <p><span className="font-medium">Online Contact Form:</span> <a href="https://swiftfood.uk/contact" className="text-primary hover:underline">https://swiftfood.uk/contact</a></p>
                <p><span className="font-medium">Post:</span> Data Protection Officer, Swift Food Services Limited, 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are unhappy with our response or believe we are not processing your personal information in accordance with the law, you also have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection authority:
              </p>
              <div className="space-y-1 text-gray-700">
                <p><span className="font-medium">Website:</span> <a href="https://ico.org.uk" className="text-primary hover:underline">https://ico.org.uk</a></p>
                <p><span className="font-medium">Telephone:</span> 0303 123 1113</p>
              </div>
              <p className="text-gray-700 leading-relaxed mt-4">
                We would, however, appreciate the opportunity to address your concerns directly before you approach the ICO, so please contact us in the first instance.
              </p>
            </div>
          </section>

          {/* 2. Information We Collect About You */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information We Collect About You</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We collect and process personal information to operate our Platform, provide services, comply with legal obligations, and protect our legitimate interests. This information may include:
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3 text-gray-600">
                <p>• Name, address, email address, and phone number</p>
                <p>• Account and login information</p>
                <p>• Order details including items purchased, delivery instructions, and payment data (processed securely by third-party providers)</p>
                <p>• Location data to facilitate delivery</p>
                <p>• Transaction history and customer service interactions</p>
                <p>• Technical information such as IP address, device type, operating system, and browsing activity on our Platform</p>
              </div>
            </div>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We process your personal information to operate our Platform, deliver services, improve user experience, protect our business, and comply with legal obligations.
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-4">We use your personal information for the following purposes:</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">• To create and manage your Swift Food account</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600">• To process your orders and arrange delivery</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600">• To manage payments, issue refunds or credits</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600">• To communicate with you about your orders or account</p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600">• To provide customer support and resolve service issues</p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600">• To maintain and improve the functionality, security, and performance of our Platform</p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600">• To personalise your experience</p>
              </div>
              <div className="border-l-4 border-teal-400 pl-4">
                <p className="text-gray-600">• To send you important service information</p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600">• To protect our business, users, and partners from fraud, misuse, or unlawful activities</p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600">• To comply with applicable legal obligations</p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-6 mt-6">
              <p className="text-gray-700 leading-relaxed">
                <span className="font-medium">Payment Security:</span> All payments made through the Swift Food platform are processed by trusted third-party providers (such as Worldpay and Zettle). These providers are certified as compliant with the Payment Card Industry Data Security Standard (PCI DSS). Swift Food does not store or process full payment card details on its own servers.
              </p>
            </div>
          </section>

          {/* 4. How We Share Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How We Share Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We only share your personal information where it is necessary to operate our services, fulfil your orders, comply with our legal obligations, or protect our rights and the rights of others.
            </p>
            
            <p className="text-gray-600 leading-relaxed mb-4">We may share your personal information with:</p>
            
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Swift Partners</h4>
                <p className="text-gray-600">restaurants, food stalls, and vendors to prepare your order</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <h4 className="font-semibold text-gray-800">Riders</h4>
                <p className="text-gray-600">delivery personnel with necessary delivery details</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <h4 className="font-semibold text-gray-800">Service providers</h4>
                <p className="text-gray-600">including payment processors, IT and hosting providers</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <h4 className="font-semibold text-gray-800">Professional advisers</h4>
                <p className="text-gray-600">such as legal and accounting professionals</p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <h4 className="font-semibold text-gray-800">Authorities and regulators</h4>
                <p className="text-gray-600">where legally required</p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <h4 className="font-semibold text-gray-800">Potential buyers or investors</h4>
                <p className="text-gray-600">in the event of a sale or restructuring</p>
              </div>
            </div>
          </section>

          {/* 5. Marketing and Promotional Communications */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Marketing and Promotional Communications</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We may use your personal information to send you marketing and promotional communications about our services, Swift Partners, special offers, and other content we believe may be of interest to you. These may be sent via email, SMS, push notification, or in-app message.
            </p>
            
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6">
              <p className="text-gray-700 leading-relaxed">
                We will only send marketing communications where permitted by law, and you may opt out at any time by updating your account preferences, clicking unsubscribe in our emails, or contacting us.
              </p>
            </div>
          </section>

          {/* 6. Cookies and Tracking Technologies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies and Tracking Technologies</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Our Platform uses cookies and similar technologies to recognise you, remember preferences, analyse trends, and deliver relevant advertising. For more information and to manage your preferences, please refer to our separate Cookies Policy.
            </p>
            
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6">
              <p className="text-gray-700 leading-relaxed">
                You can control cookies in your browser/device settings, but disabling them may affect your experience. See our Cookies Policy [link to be inserted] for more details.
              </p>
            </div>
          </section>

          {/* 7. How We Protect Your Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. How We Protect Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We use technical and organisational measures to safeguard your personal information, including encryption, access controls, secure storage, regular audits, and vetting of third-party providers. While we take security seriously, no system is entirely secure, and we encourage you to protect your account credentials.
            </p>
            
            <p className="text-gray-600 leading-relaxed">
              We retain personal information only for as long as necessary to fulfil the purposes for which it was collected, or to comply with legal obligations. Data no longer needed will be securely deleted or anonymised.
            </p>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Under UK GDPR, you have rights including access, rectification, erasure, restriction, objection, portability, and withdrawal of consent. To exercise these rights, contact us using the details in Section 1. You also have the right to lodge a complaint with the ICO.
            </p>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
              <div className="space-y-3 text-gray-700">
                <p><span className="font-medium">Access:</span> Request a copy of your personal data</p>
                <p><span className="font-medium">Rectification:</span> Correct inaccurate or incomplete information</p>
                <p><span className="font-medium">Erasure:</span> Request deletion of your personal data</p>
                <p><span className="font-medium">Restriction:</span> Limit how we process your data</p>
                <p><span className="font-medium">Objection:</span> Object to certain types of processing</p>
                <p><span className="font-medium">Portability:</span> Receive your data in a portable format</p>
                <p><span className="font-medium">Withdrawal:</span> Withdraw consent where applicable</p>
              </div>
            </div>
          </section>

          {/* 9. Changes to This Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to This Privacy Policy</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this Privacy Policy from time to time. The date of the most recent revision will be displayed at the bottom of this page. Updates will be posted on our website and, where appropriate, notified to you by email or in-app notification. Continued use of our Platform after updates constitutes acceptance of the revised policy.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Swift Food Services Limited</span></p>
              <p>251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p><span className="font-medium">Company Registration Number:</span> 16457702</p>
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
                <span className="font-medium">Contact form:</span>{" "}
                <a 
                  href="https://swiftfood.uk/contact" 
                  className="text-primary hover:underline font-medium"
                >
                  https://swiftfood.uk/contact
                </a>
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
import React from "react";
import Link from "next/link";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Terms & Conditions</h1>
          <p className="text-gray-600 text-lg">
            Important information about using Swift Food's services
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
          
          {/* Who We Are */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Who we are</h2>
            <p className="text-gray-600 leading-relaxed">
              Swift Food Services Ltd ("we", "our", "us" or "Swift Food") provides an online platform for ordering street food 
              and restaurant meals for delivery. You can place orders through our mobile app, and for large catering or corporate 
              events, through our website. Registered address: 251 Grays Inn Rd, London WC1X 8QT, United Kingdom.
            </p>
          </section>

          {/* How Ordering Works */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How ordering works</h2>
            <p className="text-gray-600 leading-relaxed">
              You can browse, select and order food and drinks using our app or, for large catering orders, through our website. 
              By placing an order, you agree to pay the total price displayed, including any delivery fees and other charges. 
              Once you place an order, we'll send you an order confirmation. Your order becomes binding once the restaurant or 
              food stall ("Swift Partner") accepts it.
            </p>
          </section>

          {/* Prices and Payment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Prices and payment</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All prices shown are final and include any applicable taxes or fees. We accept payment by debit or credit card 
              (Visa, Mastercard, Amex) and online payment methods like Apple Pay. Payments are processed securely by our payment partners.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 font-medium">⚠️ We do not accept cash payments.</p>
            </div>
          </section>

          {/* Delivery and Fulfilment */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Delivery and fulfilment</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Your order will be prepared by the Swift Partner and delivered by one of our independent drivers ("Riders"). 
              We aim to deliver within the estimated time, but can't guarantee exact times due to traffic or other factors 
              beyond our control.
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-gray-700">
                <span className="font-medium text-primary">Important:</span> You must ensure someone is available at the 
                delivery address to receive the order.
              </p>
            </div>
          </section>

          {/* Cancellations and Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Cancellations and refunds</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Standard orders:</h3>
                <p className="text-gray-600 leading-relaxed">
                  You cannot cancel an order once the Swift Partner has started preparing the food. If you need to change or 
                  cancel an order, please contact us immediately — we'll try to help if preparation hasn't started yet.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Corporate catering:</h3>
                <p className="text-gray-600 leading-relaxed">
                  For large catering or corporate orders, you must cancel at least 48 hours before the scheduled delivery time. 
                  Late cancellations may still be charged in full.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Missing items:</h3>
                <p className="text-gray-600 leading-relaxed">
                  If anything is missing from your delivery, please tell us promptly. We may offer a replacement, credit or 
                  refund for the missing items.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">Food quality complaints:</h3>
                <p className="text-gray-600 leading-relaxed">
                  If you're not happy with the quality, please submit a complaint using our form. We'll review it according to 
                  our internal policies and may offer a credit or refund at our discretion.
                </p>
              </div>
            </div>
          </section>

          {/* Your Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Your responsibilities</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="space-y-3 text-gray-600">
                <p>• Provide accurate delivery details and be reachable during delivery</p>
                <p>• If a Rider can't reach you or deliver safely, you may still be charged</p>
                <p>• Don't misuse our app or website, or try to interfere with our systems</p>
              </div>
            </div>
          </section>

          {/* Our Responsibilities */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Our responsibilities</h2>
            <p className="text-gray-600 leading-relaxed">
              We run the ordering and delivery service and coordinate with Swift Partners and Riders. We aren't responsible 
              for delays or problems caused by events outside our control.
            </p>
          </section>

          {/* Limits of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Limits of liability</h2>
            <p className="text-gray-600 leading-relaxed">
              We aren't liable for losses or damages not directly caused by us or that we couldn't reasonably predict. 
              This doesn't affect your statutory rights.
            </p>
          </section>

          {/* Our Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Our rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">We may, at our discretion:</p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Refuse or cancel any order</span> if we believe there's an error, fraud, or misuse.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Suspend or terminate your account</span> if you breach these terms or misuse our services.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Remove or edit any content</span> you submit (like reviews) if it breaks the law or our policies.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-800">Make changes to our services,</span> menu options, delivery areas or partners at any time.
                </p>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. Changes to these terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We may update these Terms & Conditions from time to time. If we make significant changes, we'll let you know — 
              for example, by updating the date here, by email, or via an in-app message.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. Governing law</h2>
            <p className="text-gray-600 leading-relaxed">
              These terms are governed by the laws of England and Wales. Any disputes will be handled by the courts of 
              England and Wales.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. Contact us</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these terms, please contact us through the contact form on our website.
            </p>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Company:</span> Swift Food Services Ltd</p>
              <p><span className="font-medium">Address:</span> 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  Via website contact form
                </Link>
              </p>
            </div>
          </section>

        </div>

        
      </div>
    </div>
  );
}
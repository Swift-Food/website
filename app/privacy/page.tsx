import React from "react";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg">
            Learn how Swift Food protects and handles your personal information
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              You know us as Swift Food, but our legal name is Swift Food Services Ltd ("we", "our", "us", "Swift" or "Swift Food"). 
              We are committed to protecting the privacy of everyone who uses our website swiftfood.uk, mobile apps and social media pages 
              (together, the "Services"). This Privacy Policy explains how we collect, use and protect your personal information — meaning 
              any details that can identify you. Unless we tell you otherwise, Swift Food is the "controller" of the personal information we handle.
            </p>
          </section>

          {/* Contact Details */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Contact details</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions or requests about this Privacy Policy, or about how we handle your personal information, 
              please get in touch by using our{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                contact form at swiftfood.uk/contact
              </Link>.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Information we collect about you</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              We collect information to help us run our services and deliver your orders smoothly. This includes:
            </p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">a) Information you give us directly</h3>
                <div className="text-gray-600 leading-relaxed space-y-3">
                  <p>
                    When you create an account or update it, you provide details like your name, email address and delivery address. 
                    You may also choose to give us your phone number, which helps us reach you if there's a problem with your delivery. 
                    If you order age-restricted items, we may ask for your date of birth to verify your age.
                  </p>
                  <p>
                    When you place an order, we collect details of what you've ordered, any delivery notes you add, vouchers or 
                    discounts you use, and payment details (which are handled securely by our payment providers).
                  </p>
                  <p>
                    When you contact us (for example, by using our contact form or sending us an email), we collect the information 
                    you share with us so we can respond to you and improve our service.
                  </p>
                  <p>
                    If you leave a review, rating or feedback, we collect your comments and any details you include.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">b) Information we receive from other sources</h3>
                <div className="text-gray-600 leading-relaxed space-y-3">
                  <p>
                    We may get information about you from our Swift Partners (restaurants and food stalls) to help us fulfil your orders.
                  </p>
                  <p>
                    We may also receive feedback about you from riders (for example, to help resolve delivery issues or complaints).
                  </p>
                  <p>
                    If you use social media to log in or interact with us, we may receive your public profile info according to your settings.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-medium text-gray-800 mb-3">c) Information we collect automatically</h3>
                <div className="text-gray-600 leading-relaxed space-y-3">
                  <p>
                    When you use our website or app, we collect information about how you use it, like your order history, 
                    pages viewed and how you interact with our features.
                  </p>
                  <p>
                    We collect details about your device, like IP address, type, operating system, and sometimes your location 
                    (if you allow it) to help with deliveries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. How we use your information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect for a few main reasons — always with a valid legal basis. This includes:
            </p>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid gap-3 text-gray-600">
                <p>• To create and manage your Swift Food account.</p>
                <p>• To process your orders, arrange deliveries and handle payments and refunds.</p>
                <p>• To contact you if we need to confirm details, update you about your order or solve any issues.</p>
                <p>• To provide customer support and respond to your requests or complaints.</p>
                <p>• To maintain, protect and improve our services, website and app, including understanding how customers use them and making sure everything works smoothly.</p>
                <p>• To personalise your experience — for example, showing you food options or offers we think you'll like.</p>
                <p>• To send you important service information, like updates to our terms or changes to our services.</p>
                <p>• To keep our systems secure and protect against fraud or misuse of our services.</p>
                <p>• To comply with our legal obligations and enforce our rights if needed.</p>
              </div>
            </div>
          </section>

          {/* How We Share Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. How we share your information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We only share your personal information when it's needed to run our services, deliver your orders, or comply with the law. 
              This includes sharing with:
            </p>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Swift Partners:</h4>
                <p className="text-gray-600">restaurants, food stalls and other approved partners who prepare your food or help with catering.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Riders:</h4>
                <p className="text-gray-600">independent riders who collect and deliver your orders. They receive the information they need to complete the delivery — such as your delivery address, any instructions you've added, and your phone number if you've provided one, so they can contact you if needed.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Service providers:</h4>
                <p className="text-gray-600">companies who help us run Swift Food — for example, payment processors, IT providers, customer support tools and fraud prevention services.</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <h4 className="font-semibold text-gray-800">Authorities or regulators:</h4>
                <p className="text-gray-600">if the law requires us to share information or to protect our rights or the rights of others.</p>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mt-4">
              If Swift Food ever merges with, sells or transfers part of our business, we may share your information with the buyer or new owner, 
              but only as needed to keep providing our services.
            </p>
          </section>

          {/* Marketing and Advertising */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Marketing and advertising</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may use your information to let you know about Swift Food offers, new restaurants, food stalls, or services we think you'll like. 
              We might send you these updates by email, SMS, app notifications or other channels — but only if the law allows it or you have agreed to receive them.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">You can change your marketing preferences or unsubscribe at any time. For example:</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-gray-600">• By updating your settings in your account.</p>
              <p className="text-gray-600">• By contacting us using our contact form.</p>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Even if you opt out of marketing messages, we'll still send you important service updates — like order confirmations, 
              changes to your account, or information about your deliveries.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. How long we keep your information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We keep your personal information only as long as we need it for the purposes described in this policy, 
              including to meet our legal and tax obligations, resolve disputes, and enforce our agreements.
            </p>
            <p className="text-gray-600 leading-relaxed">
              When we no longer need your information, we securely delete or anonymise it.
            </p>
          </section>

          {/* Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. How we protect your information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use technical and organisational measures to keep your personal information safe and secure. For example, 
              we use secure systems, limit who can access your information, and regularly check our security practices.
            </p>
            <p className="text-gray-600 leading-relaxed">
              However, please remember that the internet is never completely secure. We encourage you to use a strong, 
              unique password for your Swift Food account and keep it confidential.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Your rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You have certain rights over your personal information under data protection laws. These include the right to:
            </p>
            <div className="grid gap-4 mb-6">
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Access:</span>
                <span className="text-gray-600">You can ask for a copy of the personal information we hold about you.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Correction:</span>
                <span className="text-gray-600">You can ask us to correct any inaccurate or incomplete information.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Deletion:</span>
                <span className="text-gray-600">You can ask us to delete your account or certain information if there's no good reason for us to keep it.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Restriction:</span>
                <span className="text-gray-600">You can ask us to temporarily stop using your information in certain situations.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Objection:</span>
                <span className="text-gray-600">You can object to us using your information if you think we don't have a valid reason.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Portability:</span>
                <span className="text-gray-600">You can ask us to give you your information in a structured, machine-readable format, or to transfer it to someone else.</span>
              </div>
              <div className="flex gap-4">
                <span className="font-semibold text-primary min-w-fit">Withdraw consent:</span>
                <span className="text-gray-600">If we rely on your consent to use your information, you can withdraw it at any time.</span>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed mb-4">
              To exercise any of these rights, please contact us through our contact form. We may ask you to confirm your identity before we respond.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you're not happy with how we handle your information, you can complain to the UK's Information Commissioner's Office (ICO). 
              We'd appreciate the chance to resolve your concerns first, so please contact us if you have any questions.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. Changes to this policy</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may update this Privacy Policy from time to time. If we make important changes, we will let you know — 
              for example, by showing a notice on our website or sending you an update if needed.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We encourage you to check this page regularly to stay up to date.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <div className="space-y-2 text-gray-600">
              <p><span className="font-medium">Company:</span> Swift Food Services Ltd</p>
              <p><span className="font-medium">Address:</span> 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p>
                <span className="font-medium">Contact:</span>{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  swiftfood.uk/contact
                </Link>
              </p>
            </div>
          </section>

        </div>

   
      </div>
    </div>
  );
}
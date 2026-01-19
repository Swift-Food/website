import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Swift Food Consumer Terms and Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            Welcome to Swift Food! We are a food delivery platform that connects you with food vendors, delivering affordable, high-quality meals straight to your door.
          </p>
          <p className="text-gray-500 mt-2">
            Last updated: 9 December 2025
          </p>
        </div>

        {/* Contact Details */}
        <div className="bg-primary/5 rounded-lg p-6 mb-10">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Contact Details</h2>
          <div className="space-y-2 text-gray-600">
            <p><span className="font-medium">Swift Food Services Ltd</span>, a company registered in England and Wales.</p>
            <p><span className="font-medium">Company Registration Number:</span> 16457702</p>
            <p><span className="font-medium">Address:</span> 251 Gray&apos;s Inn Road, London, WC1X 8QT, England</p>
            <p><span className="font-medium">Phone:</span> 07437912217</p>
            <p>
              <span className="font-medium">Email:</span>{" "}
              <a href="mailto:swiftfooduk@gmail.com" className="text-primary hover:underline">
                swiftfooduk@gmail.com
              </a>
            </p>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            Please review our terms and conditions (Terms) before using our platform. If you have any questions in relation to these Terms, please contact us using the contact details above.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-10">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">1. Introduction</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.1</span> We provide a platform where restaurants and other food vendors (<span className="font-medium">Swift Partner</span>) and customers looking to place orders for food, including catering (<span className="font-medium">Swift Customers</span>) can connect and transact through our website and mobile application (<span className="font-medium">Platform</span>).
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.2</span> These Terms contain the terms and conditions on which we supply the Platform and the Swift Food Services to you.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.3</span> These Terms are entered into between us and you, together the <span className="font-medium">Parties</span> and each a <span className="font-medium">Party</span>. In these Terms, <span className="font-medium">you</span> or <span className="font-medium">your</span> means (as applicable) the Swift Customer placing an order through the Platform.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.4</span> If you are using the Platform on behalf of your employer or a business entity, you, in your individual capacity, represent and warrant that you are authorised to act on behalf of your employer or the business entity and to bind the entity and the entity&apos;s personnel to these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Acceptance and Platform Licence */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">2. Acceptance and Platform Licence</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.1</span> You accept these Terms by accepting these Terms on the Platform or by placing an Order Request, whichever is earlier.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.2</span> We may amend these Terms at any time, by providing written notice to you (including via the Platform). By clicking &quot;I accept&quot;, or similar, or continuing to use the Platform, you accept the amendment. If you do not agree to the amendment and it adversely affects your rights, you may cancel these Terms with effect from the date of the change in these Terms by providing written notice to us within 7 days of us notifying you of the change. If you cancel these Terms, (a) you will no longer be able to use the Platform on and from the date of cancellation, and (b) if you have paid any fees upfront you will be issued a pro-rata refund having regard to the date of termination and the period for which you have paid.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.3</span> If you access or download our mobile application from (1) the Apple App Store, you agree to any Usage Rules set forth in the App Store Terms of Service or (2) the Google Play Store, you agree to the Android, Google Inc. Terms and Conditions including the Google Apps Terms of Service.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.4</span> We may use Stripe (payment processing), Twilio (SMS notifications), Firebase and Expo (push notifications), AWS S3 (file storage), and third party email delivery services. Your use of the Platform may be subject to the terms and conditions of these third-party providers.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.5</span> Subject to your compliance with these Terms, we grant you a personal, non-exclusive, royalty-free, revocable, worldwide, non-transferable licence to download and use our Platform in accordance with these Terms. All other uses are prohibited without our prior written consent.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">2.6</span> When using the Platform, you must not do or attempt to do anything that is unlawful or inappropriate, including:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) anything that would constitute a breach of an individual&apos;s privacy or any other legal rights (including uploading private information or Personal Data without an individual&apos;s consent);</p>
                  <p>(b) using the Platform to defame, harass, threaten, menace or offend any person;</p>
                  <p>(c) using the Platform for unlawful purposes;</p>
                  <p>(d) interfering with any user of the Platform;</p>
                  <p>(e) tampering with or modifying the Platform (including by transmitting viruses and using trojan horses);</p>
                  <p>(f) using the Platform to send unsolicited electronic messages;</p>
                  <p>(g) using data mining, robots, screen scraping or similar data gathering and extraction tools on the Platform; and</p>
                  <p>(h) facilitating or assisting a third party to do any of the above acts.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Platform summary */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">3. Platform Summary</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.1</span> The Platform is a marketplace where you can connect with Swift Partners for food and catering services. We provide the Platform (including hosting and maintaining the Platform) to users, process payments between you and Swift Partners, enable Swift Partners to receive orders, and arrange and provide collection and delivery services (together the <span className="font-medium">Swift Food Services</span>). We will provide the Swift Food Services in accordance with these Terms and all applicable laws, and we warrant to you that the Swift Food Services will be provided using reasonable care and skill.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.2</span> You understand and agree that we only make available the Swift Food Services. We are not party to any agreement entered into between a Swift Customer and a Swift Partner, and we have no control over the conduct of Swift Partners or any other users of the Platform.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.3</span> A Swift Partner will create a listing with the description of the services they can provide, including the fees for the relevant menu items (<span className="font-medium">Listing Fees</span>), dishes, allergen information, ingredients, portion sizes, minimum order requirements (if any) and minimum notice required for orders (<span className="font-medium">Swift Partner Listing</span>). Allergen information displayed on the Platform is provided by Swift Partners. Swift Customers with allergies or dietary requirements must contact the Swift Partner directly to verify allergen information before placing an Order Request.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.4</span> You can use the Platform to view and browse Swift Partner Listings.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.5</span> You may request to purchase the provision of food services described in a Swift Partner Listing by submitting an order through the Platform. The order is an offer from you to the Swift Partner to order the food described in the Swift Partner Listing (<span className="font-medium">Order Request</span>). To place an Order Request on the Platform, you must provide your name, delivery address, telephone number and email address.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.6</span> You agree to provide accurate and up to date information when placing an Order Request. You are responsible for ensuring that the delivery address and contact details you provide are correct. We will use your contact details to communicate with you about your order and for delivery purposes. You agree to immediately notify us if you become aware of any unauthorised use of your contact details in connection with any Order Request.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.7</span> Once you submit an Order Request, we may review it before forwarding it to the Swift Partner. We may decline any Order Request that contains errors or invalid promotions. If we decline your Order Request, we will notify you and no payment link will be sent.
                </p>
              </div>
              <div className="border-l-4 border-teal-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.8</span> If the Swift Partner accepts your Order Request through the Platform and you pay via the payment link sent, it becomes a <span className="font-medium">Confirmed Order</span>. We will send a confirmation email, a notification via our Platform, or a text message to confirm that the Order Request is a Confirmed Order, to both you and the Swift Partner. Once you have a Confirmed Order, you will receive a tracking link to monitor your order status.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.9</span> Swift Customers and Swift Partners may enter into written agreements in relation to the provision of food and/or catering services. To the extent there is inconsistency between any additional terms and conditions and these Terms, these Terms will prevail.
                </p>
              </div>
              <div className="border-l-4 border-pink-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.10</span> By sending an Order Request, you are accepting the additional terms and conditions of the relevant Swift Partners.
                </p>
              </div>
            </div>
          </section>

          {/* 4. Minimum Notice Requirements and Changes to Order Requests */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">4. Minimum Notice Requirements and Changes to Order Requests</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">4.1</span> You must place your Order Request in accordance with the minimum notice period specified by the relevant Swift Partner in the Swift Partner Listing.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">4.2 Catering and large Order Requests:</span> For catering services and large volume orders placed through the Platform, once payment has been made, no changes to the order date, time, quantity or menu items are permitted within 5 business days of the scheduled delivery date. The standard 14-day cooling-off period under The Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 does not apply to catering services and large volume orders, as these involve perishable goods and services to be performed on a specific date.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">4.3 Individual Order Requests:</span> Changes to Order Requests may be accommodated at the Swift Partner&apos;s sole discretion and must be requested as soon as possible, after the Order Request is made.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">4.4</span> If you fail to provide sufficient notice as required by the Swift Partner, your Order Request may be declined. If you cancel your Order Request after the Swift Partner has begun preparation, you may not be entitled to a refund and may be liable for costs incurred by the Swift Partner.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Communication */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">5. Communication</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.1</span> We may contact you via the Platform, or via off-Platform communication channels, such as text message or email, using the details you provided to us when placing an Order Request.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.2</span> You can communicate privately with Swift Partners using our private messaging service or offline using the listed contact details before a Confirmed Order is made, regarding allergen and dietary information, or any special requests for the proposed order.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">5.3</span> You and Swift Partners must not use the contact details to organise the provision of the services off the Platform, or otherwise to attempt to circumvent the payment of any service fees to us.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">6. Payments</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.1</span> You agree to pay (and your chosen payment method will be charged) the Listing Fees at the time you make an Order Request.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.2</span> In consideration for the delivery services we provide, we charge delivery fees (<span className="font-medium">Delivery Fees</span>). The Delivery Fees will be set out on the Platform at the time of you placing an Order Request. The Delivery Fee is payable by you and is retained by us before paying the Listing Fees (minus our service fees) to the Swift Partner.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.3</span> We may pre-authorise or charge your payment method for a nominal amount to verify the payment method.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">6.4</span> All payments are processed in Great British Pounds.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.5</span> The payment methods we offer are set out on the Platform. We may offer payment through a third-party provider for example, Stripe. You acknowledge and agree that we have no control over the actions of the third-party provider, and your use of the third-party payment method may be subject to additional terms and conditions. For the avoidance of doubt, we do not hold any funds ourselves. All funds are held and are processed via our third-party provider.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.6</span> You must not pay, or attempt to pay, any amount in connection with these Terms by fraudulent or unlawful means. If you make a payment by debit card or credit card, you warrant that you are authorised to use the debit card or credit card to make the payment. If payment is made by direct debit, by providing your bank account details and accepting these Terms, you authorise our nominated third party payment processor to debit your account in accordance with these Terms and you certify that you are either an account holder or an authorised signatory on the account for which you provide details.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Refunds and Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">7. Refunds and Cancellation Policy</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.1</span> The cancellation, variation, or refund of any food and catering services ordered on this Platform is a matter between you and the Swift Partner.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">7.2</span> You must claim refunds within 3 to 5 days of delivery for catering and large orders, or as otherwise specified by the Swift Partner in a Swift Partner Listing. For the avoidance of doubt, this policy does not create a contractual relationship between us and you.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.3</span> For disputes between you and Swift Partners, we encourage Parties to attempt to resolve disputes (including claims for returns or refunds) with the other Party directly and in good faith, either on the Platform or through external communication methods. Where a refund is disputed, Stripe may hold the Listing Fees minus our service fees pending resolution. In the event that a dispute cannot be resolved through these means, the Parties may choose to resolve the dispute in any manner agreed between the Parties or otherwise in accordance with applicable laws.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.4</span> This clause will survive the termination or expiry of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">8. Intellectual Property</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.1</span> All intellectual property (including copyright) developed, adapted, modified or created by us or our personnel (including in connection with the Terms, the Platform itself and any content on the Platform (except User Content)) (<span className="font-medium">Our Intellectual Property</span>) will at all times vest, or remain vested, in us.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.2</span> We authorise you to use Our Intellectual Property solely for the purposes for which it was intended to be used.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">8.3</span> You must not, without our prior written consent:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) copy, in whole or in part, any of Our Intellectual Property;</p>
                  <p>(b) reproduce, retransmit, distribute, disseminate, sell, publish, broadcast or circulate any of Our Intellectual Property to any third party; or</p>
                  <p>(c) breach any Intellectual Property rights connected with the Platform, including (without limitation) altering or modifying any of Our Intellectual Property; causing any of Our Intellectual Property to be framed or embedded in another website; or creating derivative works from any of Our Intellectual Property.</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">8.4</span> Nothing in the above clause restricts your ability to publish, post or repost Our Intellectual Property on your social media page or blog, provided that:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) you do not assert that you are the owner of Our Intellectual Property;</p>
                  <p>(b) unless explicitly agreed by us in writing, you do not assert that you are endorsed or approved by us;</p>
                  <p>(c) you do not damage or take advantage of our reputation, including in a manner that is illegal, unfair, misleading or deceptive; and</p>
                  <p>(d) you comply with all other provisions of these Terms.</p>
                </div>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.5</span> This clause will survive the termination or expiry of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 9. Content you upload */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">9. Content You Upload</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.1</span> You may be permitted to post, upload, publish, submit or transmit relevant information and content including reviews (<span className="font-medium">User Content</span>) on the Platform. We may run campaigns via the Platform and via social media that encourage you to post User Content on social media using specific hashtags (#) (<span className="font-medium">Tag</span>).
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.2</span> If you make any User Content available on or through the Platform, including on social media using a Tag, you grant to us a worldwide, irrevocable, perpetual, non-exclusive, transferable, royalty-free licence to use the User Content, with the right to use, view, copy, adapt, modify, distribute, license, transfer, communicate, publicly display, publicly perform, transmit, stream, broadcast, access, or otherwise exploit such User Content on, through or by means of the Platform and our social media platforms. We agree to only modify User Content to the extent reasonably required by us. You may request that any of your User Content is removed from the Platform or social media by sending us an email. We will endeavour to action any removal requests within a reasonable time. This does not limit any rights you may have under any applicable privacy laws.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">9.3</span> You agree that you are solely responsible for all User Content that you make available on or through the Platform, including on social media using a Tag. You represent and warrant that:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) you are either the sole and exclusive owner of all User Content or you have all rights, licences, consents and releases that are necessary to grant to us the rights in such User Content (as contemplated by these Terms); and</p>
                  <p>(b) neither the User Content nor the posting, uploading, publication, submission or transmission of the User Content or our use of the User Content on, through or by means of our Platform (including on social media) will infringe, misappropriate or violate a third party&apos;s Intellectual Property rights, or rights of publicity or privacy, or result in the violation of any applicable law or regulation.</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.4</span> We do not endorse or approve, and are not responsible for, any User Content. We may, at any time (at our sole discretion), remove any User Content.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.5</span> If you believe that any User Content on the Platform is an infringement of your Intellectual Property rights, please contact us using the contact details set out at the top of these Terms, and we may investigate.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.6</span> This clause will survive the termination or expiry of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Warranties */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">10. Warranties</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">10.1</span> You represent, warrant and agree that:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) you will not use our Platform, including Our Intellectual Property, in any way that competes with our business;</p>
                  <p>(b) there are no legal restrictions preventing you from entering into these Terms; and</p>
                  <p>(c) all information and documentation that you provide to us in connection with these Terms is true, correct and complete.</p>
                </div>
              </div>
            </div>
          </section>

          {/* 11. Data Protection */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">11. Data Protection</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">11.1</span> We understand that protecting your Personal Data is important. We set out how we handle your Personal Data in our Privacy Policy, available on our website.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">11.2</span> We process your Personal Data, and Swift Partners process your Personal Data, as separate and independent controllers. This means that we and Swift Partners are responsible for the Personal Data we each process.
                </p>
              </div>
            </div>
          </section>

          {/* 12. Limitations on liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">12. Limitations on Liability</h2>
            <div className="space-y-4">
              <div className="bg-gray-50 border-l-4 border-gray-500 p-4">
                <p className="text-gray-700 leading-relaxed mb-3">
                  <span className="font-medium">12.1</span> Nothing in these Terms limits any Liability which cannot legally be limited, including Liability for:
                </p>
                <div className="ml-4 space-y-2 text-gray-700">
                  <p>(a) death or personal injury caused by negligence;</p>
                  <p>(b) fraud or fraudulent misrepresentation;</p>
                  <p>(c) breach of the terms implied by section 2 of the Supply of Goods and Services Act 1982 (title and quiet possession); and</p>
                  <p>(d) defective products under the Consumer Protection Act 1987.</p>
                </div>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.2</span> This clause 12.2 applies if you are a &apos;consumer&apos; as defined in the Consumer Rights Act 2015 and to the extent that the Platform is considered digital content. If the Platform is defective and it damages a device or digital content belonging to you and this is caused by our failure to use reasonable care and skill, we will either repair the damage or pay you compensation. However, we will not be liable for damage which you could have avoided by following our advice to apply an update offered to you free of charge or for damage which was caused by you failing to correctly follow installation instructions or to have in place the minimum system requirements advised by us.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">12.3</span> To the maximum extent permitted by law, we will not be liable for, and you waive and release us from and against, any Liability caused or contributed to by, arising from or connected with:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) any third party services, or any unavailability of the Platform due to a failure of the third party services; and</p>
                  <p>(b) any aspect of your interactions with the Swift Partner including the services offered by the Swift Partner, the description of the services requested or offered, any advice provided, the performance of services (including catering services) or supply of food by the Swift Partner, or the accuracy of allergen information provided by the Swift Partner.</p>
                </div>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed mb-3">
                  <span className="font-medium">12.4</span> Subject to clause 12.2 (damage caused by defective content) and clause 12.1 (liability which cannot legally be limited), but despite anything to the contrary, to the maximum extent permitted by law:
                </p>
                <div className="ml-4 space-y-2 text-gray-700">
                  <p>(a) you agree to indemnify us for any Liability we incur due to (i) any claim (including from any tax authority) for any VAT for which you are responsible that you did not correctly declare or remit to the relevant tax authority, (ii) your breach of the Acceptance and Platform Licence clause (clause 2), and (iii) your breach of the Intellectual Property clause (clause 8) of these Terms;</p>
                  <p>(b) we will have no liability to you for any loss of profit, loss of business, loss of data, business interruption, or loss of business opportunity;</p>
                  <p>(c) a Party&apos;s liability for any liability under these Terms will be reduced proportionately to the extent the relevant liability was caused or contributed to by the negligent or unlawful acts or omissions of, or breach of this Agreement, by the other Party; and</p>
                  <p>(d) our aggregate liability for any and all Liability arising from or in connection with these Terms will be limited to 100% of the relevant Listing Fee (or if none are payable, £100).</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.5</span> We have given commitments as to the compliance of the Platform with these Terms and applicable laws in clause 3.1. In view of these commitments, the terms implied by sections 3, 4 and 5 of the Supply of Goods and Services Act 1982 are, to the maximum extent permitted by law, excluded from these Terms.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.6</span> This clause 12 will survive the termination or expiry of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 13. Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">13. Termination</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.1</span> As a Swift Customer, you may cease using the Platform at any time.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.2</span> We may terminate these Terms at our discretion, effective immediately, including if we no longer intend to operate the Platform (<span className="font-medium">Termination for Convenience</span>).
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">13.3</span> These Terms may be terminated upon written notice by a Party (<span className="font-medium">Non-Defaulting Party</span>) if:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) the other Party (<span className="font-medium">Defaulting Party</span>) breaches a material term of these Terms and that breach has not been remedied within 10 business days of the Defaulting Party being notified of the breach by the Non-Defaulting Party; or</p>
                  <p>(b) the Defaulting Party is bankrupt, goes into liquidation, administration, or receivership, or otherwise suffers a similar insolvency event in any jurisdiction in the world.</p>
                </div>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.4</span> Should we suspect that you are in breach of these Terms, we may refuse to process any Order Requests from you while we investigate the suspected breach, or we may refuse to provide the Swift Food Services to you (acting reasonably).
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed mb-3">
                  <span className="font-medium">13.5</span> Upon expiry or termination of these Terms:
                </p>
                <div className="ml-4 space-y-2 text-gray-600">
                  <p>(a) we will remove your access to the Platform;</p>
                  <p>(b) we will immediately cease providing the Swift Food Services;</p>
                  <p>(c) we will cancel any existing Confirmed Orders and you will lose any Listing Fees and other amounts paid other than where termination is due to our Termination for Convenience, in which case the Listing Fees minus the Delivery Fee will be refunded to you;</p>
                  <p>(d) subject to our obligations to retain certain Personal Data for legal, regulatory, tax or accounting purposes, we will delete your Personal Data on termination of these Terms; and</p>
                  <p>(e) where we terminate the Terms as a result of your unrectified default, you also agree to pay us our reasonable additional costs directly arising from such termination, including recovery fees.</p>
                </div>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.6</span> Where termination is due to our breach of these Terms or due to our Termination for Convenience, we agree to refund you for any prepaid unused Listing Fees on a pro-rata basis.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.7</span> Termination of these Terms will not affect any rights or liabilities that a Party has accrued under it.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.8</span> This clause will survive the termination or expiry of these Terms.
                </p>
              </div>
            </div>
          </section>

          {/* 14. General */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">14. General</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.1 Assignment:</span> Subject to the below clause 14.2, a Party must not assign or deal with the whole or any part of its rights or obligations under these Terms without the prior written consent of the other Party (such consent is not to be unreasonably withheld).
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.2 Assignment of Debt:</span> You agree that we may assign or transfer any debt owed by you to us, arising under or in connection with these Terms, to a debt collector, debt collection agency, or other third party.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.3 Contracts (Rights of Third Parties) Act 1999:</span> Notwithstanding any other provision of these Terms, nothing in these Terms confers or is intended to confer any right to enforce any of its terms on any person who is not a party to it.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">14.4 Disputes:</span> Alternative dispute resolution is a process where an independent body considers the facts of a dispute and seeks to resolve it, without you having to go to court. If you are not happy with how we have handled any complaint, you may want to contact the alternative dispute resolution provider we use. You can submit a complaint to The Centre for Effective Dispute Resolution via their website at{" "}
                  <a href="https://www.cedr.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    https://www.cedr.com/
                  </a>
                  . The Centre for Effective Dispute Resolution will not charge you for making a complaint and if you are not satisfied with the outcome you can still bring legal proceedings.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.5 Entire Terms:</span> Subject to your consumer law rights, these Terms contains the entire understanding between the Parties and the Parties agree that no representation or statement has been made to, or relied upon by, either of the Parties, except as expressly stipulated in these Terms, and these Terms supersedes all previous discussions, communications, negotiations, understandings, representations, warranties, commitments and agreements, in respect of its subject matter.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.6 Force Majeure:</span> Neither Party will be liable for any delay or failure to perform their respective obligations under these Terms if such delay or failure is caused or contributed to by a Force Majeure Event, provided the Party seeking to rely on the benefit of this clause, as soon as reasonably practical, notifies the other party in writing about the Force Majeure Event and the extent to which it is unable to perform its obligations, and uses reasonable endeavours to minimise the duration and adverse consequences of the Force Majeure Event.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.7 Further assurance:</span> Each Party must promptly do all things and execute all further instruments necessary to give full force and effect to these Terms and their obligations under it.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.8 Governing law:</span> These Terms are governed by the laws of England and Wales. Each Party irrevocably and unconditionally submits to the exclusive jurisdiction of the courts operating in England and Wales and any courts entitled to hear appeals from those courts and waives any right to object to proceedings being brought in those courts.
                </p>
              </div>
              <div className="border-l-4 border-teal-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.9 Notices:</span> Any notice given under these Terms must be in writing addressed to us at the details set out at the beginning of these Terms or to you at the contact details you provided when placing your Order Request. Any notice may be sent by standard post or email, and will be deemed to have been served on the expiry of 48 hours in the case of post, or at the time of transmission in the case of transmission by email.
                </p>
              </div>
              <div className="border-l-4 border-pink-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.10 Publicity:</span> You agree that we may advertise or publicise the broad nature of our supply of the Swift Food Services to you, including on our website or in our promotional material.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.11 Relationship of Parties:</span> These Terms are not intended to create a partnership, joint venture, employment or agency relationship between the Parties.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.12 Severance:</span> If a provision of these Terms is held to be void, invalid, illegal or unenforceable, that provision is to be read down as narrowly as necessary to allow it to be valid or enforceable, failing which, that provision (or that part of that provision) will be severed from these Terms without affecting the validity or enforceability of the remainder of that provision or the other provisions in these Terms.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.13 Third party sites:</span> The Platform may contain links to websites operated by third parties. Unless we tell you otherwise, we do not control, endorse or approve, and are not responsible for, the content on those websites. We recommend that you make your own investigations with respect to the suitability of those websites. If you purchase goods or services from a third party website linked from the Platform, such third party provides the goods and services to you, not us. We may receive a benefit (which may include a referral fee or a commission) should you visit certain third-party websites via a link on the Platform (<span className="font-medium">Affiliate Link</span>) or for featuring certain products or services on the Platform. We will make it clear by notice to you which (if any) products or services we receive a benefit to feature on the Platform, or which (if any) third party links are Affiliate Links.
                </p>
              </div>
            </div>
          </section>

          {/* 15. Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">15. Definitions</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">15.1 Force Majeure Event</span> means any event or circumstance which is beyond a Party&apos;s reasonable control.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">15.2 Intellectual Property</span> means any copyright, registered or unregistered designs, patents or trade marks, business names, get-up, goodwill, domain names, know-how, inventions, processes, trade secrets or Confidential Information, circuit layouts, software, computer programs, databases or source codes, including any application, or right to apply, for registration of, and any improvements, enhancements or modifications of, the foregoing.
                </p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">15.3 Liability</span> means any expense, cost, liability, loss, damage, claim, notice, entitlement, investigation, demand, proceeding or judgment (whether under statute, contract, equity, tort (including negligence), misrepresentation, restitution, indemnity or otherwise), howsoever arising, whether direct or indirect and/or whether present, unascertained, future or contingent and whether involving a third party or a Party to these Terms or otherwise.
                </p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">15.4 Personal Data</span> has the meaning given in the Data Protection Act 2018.
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-6 border-t text-center text-gray-500 text-sm">
            <p>© LegalVision Law UK Ltd</p>
          </div>

        </div>
      </div>
    </div>
  );
}

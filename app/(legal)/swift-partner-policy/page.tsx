import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Partner Terms and Conditions | Swift Food",
  description: "Terms and conditions for Swift Food restaurant partners.",
  alternates: { canonical: "https://swiftfood.uk/swift-partner-policy" },
  robots: { index: false },
};

export default function SwiftPartnerTerms() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Partner Terms and Conditions
          </h1>
          <p className="text-gray-600 text-lg">
            Legal terms governing your partnership with Swift Food as a restaurant partner
          </p>
          <p className="text-gray-500 mt-2">
            Last updated: 10 June 2026
          </p>
        </div>

        {/* Preamble */}
        <div className="bg-white rounded-xl border p-8 mb-8">
          <p className="text-gray-600 leading-relaxed mb-4">
            In this Agreement, when we say <strong>you</strong> or <strong>your</strong>, we mean both you and any entity you are authorised to represent (such as your employer). When we say <strong>we</strong>, <strong>us</strong> or <strong>our</strong>, we mean Swift Food Services Ltd, a company registered in England and Wales with company number 16457702. We and you are each a <strong>Party</strong> to the terms of this Agreement, and together, the <strong>Parties</strong>.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-10">

          {/* 1. Acceptance and Term */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">1. Acceptance and Term</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.1</span> You accept the terms of this Agreement by the earlier of:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>creating an Account on the Platform;</li>
                  <li>accessing the Platform;</li>
                  <li>clicking &lsquo;I accept&rsquo; or any similar checkbox on the Platform or otherwise indicating your acceptance of this Agreement;</li>
                  <li>acknowledging receipt of an Order in writing to us or the Customer; or</li>
                  <li>accepting your first Order through the Platform or via any other communication methods (including WhatsApp, email, telephone or SMS).</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.2</span> This Agreement will commence on the Commencement Date and will continue until terminated in accordance with its terms (<strong>Term</strong>).
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">1.3</span> We may amend this Agreement at any time by providing written notice to you via email to the email address registered to your Account or via the Platform. By clicking &ldquo;I accept&rdquo;, continuing to use the Platform, or accepting Orders after the notice or 30 days after notification (whichever date is earlier), you agree to the amended terms. If you do not agree to the amendment, you may terminate this Agreement in accordance with clause 17.2.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">2. Services</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">2.1</span> In consideration of your payment of Our Commission, we will provide the following services in accordance with this Agreement and all applicable Laws, whether through ourselves or through our Personnel:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>providing you with access to our Platform;</li>
                  <li>marketing and promotion of your food catering services to potential customers through our Platform;</li>
                  <li>processing Orders placed through the Platform by Customers, including collecting payment from the Customers via Stripe and transferring Your Fees to your Stripe account;</li>
                  <li>coordination and provision of delivery services for each Order placed through the Platform by a Customer; and</li>
                  <li>displaying your Listing on our Platform,</li>
                </ul>
                <p className="mt-2 text-gray-600">(together, <strong>Our Services</strong>).</p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">2.2</span> In consideration of our payment of Your Fees, you agree to provide the following services in accordance with this Agreement and all applicable Laws, whether through yourselves or through your Personnel:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>preparing and packaging food for each Order in a professional manner and in accordance with all applicable laws and regulations, including food safety and hygiene requirements;</li>
                  <li>ensuring Orders are ready for collection or delivery at the agreed time, properly sealed, and packaged to maintain quality and safety during transport;</li>
                  <li>providing and maintaining accurate and up-to-date information on your Listing on the Platform, including menu items, allergens, pricing, availability, operating hours, and temporary closures;</li>
                  <li>responding promptly to Customer or Platform queries and cooperating in the resolution of Customer issues, refunds, and complaints;</li>
                  <li>maintaining sufficient stock and staffing to fulfill accepted Orders within the agreed preparation and collection times;</li>
                  <li>notifying us via your Account through the Platform at least 7 days in advance of any planned closures or reductions in capacity, and promptly updating your status on the Platform in the event of an unplanned closure; and</li>
                  <li>remaining reachable via phone or preferred contact method during your published operating hours for order-related communications,</li>
                </ul>
                <p className="mt-2 text-gray-600">(together, <strong>Your Services</strong>).</p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.3</span> <strong>Additional Services:</strong> We may introduce additional paid services on the Platform or otherwise, from time to time (including premium listings, featured placements, or advertising). If you require additional services from us, we may, in our sole discretion, provide such additional services (to be scoped and priced in a separate contract provided by us).
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">2.4</span> <strong>Disclaimer:</strong> The Platform may include additional functionality or integrations over time (including direct delivery, promotional tools, analytics dashboards, or third-party logistics integrations). Access to such features may be subject to separate fees and additional terms, which we will notify you of in advance.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">2.5</span> We act as a limited payment collection agent solely for the purposes of facilitating the sale of food by you to Customers through the Platform. For the avoidance of doubt:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>you are the principal and legal seller of all food supplied to the relevant Customer under each Order;</li>
                  <li>you are responsible for setting your own prices for food items on your Listing(s);</li>
                  <li>you are the legal seller of the food to Customers and are solely responsible for all obligations arising from that sale, including but not limited to food safety and hygiene, allergen compliance and VAT compliance on food sales;</li>
                  <li>we do not purchase or resell food and we are not a party to the legally binding contract of sale for the food between you and the Customer; and</li>
                  <li>we collect payment from your Customers on your behalf as your limited payment collection agent, through Stripe.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Delay Fees */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">3. Delay Fees</h2>
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">3.1</span> If an Order is not ready for collection by our delivery partner at the agreed collection time window notified to you at the time of Order acceptance, and such delay is caused by your acts or omissions, we may deduct the following amounts from Your Fees in accordance with the following scale:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-700">
                  <li>between 0 to 15 minutes &mdash; 0%;</li>
                  <li>between 15 to 30 minutes &mdash; 15% of Gross Revenue for that Order;</li>
                  <li>between 30 to 45 minutes &mdash; 30% of Gross Revenue for that Order;</li>
                  <li>between 45 to 60 minutes &mdash; 45% of Gross Revenue for that Order;</li>
                  <li>over 60 minutes &mdash; 50% of Gross Revenue for that Order,</li>
                </ul>
                <p className="mt-2 text-gray-700">(together, the <strong>Delay Fees</strong>).</p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.2</span> You acknowledge and accept that the Delay Fees represent a genuine pre-estimate of our likely losses incurred as a result of your preparation delays, including but not limited to reputational damage with our Customers, costs of processing refunds and handling complaints, loss of future business opportunities and operational disruption to our delivery services.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.3</span> For the avoidance of doubt, delays will be measured from the agreed collection window time shown to you at Order acceptance and will be evidenced by timestamped photographic evidence taken by our delivery partner at the point of collection.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.4</span> The maximum Delay Fees under this clause 3 for any single Order shall not exceed 50% of the Gross Revenue for that Order.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">3.5</span> No deduction for Delay Fees will be made under this clause where the delay is caused by:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>a Force Majeure Event;</li>
                  <li>circumstances beyond your reasonable control, provided you notify us as soon as reasonably practicable and provide supporting evidence;</li>
                  <li>acts or omissions of our delivery partner or Personnel; or</li>
                  <li>any failure or error in the Platform.</li>
                </ul>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.6</span> Before making any deductions for Delay Fees under this clause, we will provide you with written notice (via email or the Platform) within 5 Business Days of the delayed Order, including details of the delay period and the proposed amount of the Delay Fees. We will also provide you with access to the timestamped photographic evidence, and allow you 5 Business Days from the date of our notice to dispute the Delay Fees by providing evidence that the delay was not caused by your acts or omissions.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.7</span> If you dispute the Delay Fees in accordance with clause 3.6, we will review the evidence you provide to us in good faith and notify you of our decision within 5 Business Days. If the dispute cannot be resolved, either Party may refer the matter to dispute resolution in accordance with clause 18.4.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">3.8</span> The Delay Fees are in addition to, and do not limit, any other rights or remedies we may have under this Agreement or at law.
                </p>
              </div>
            </div>
          </section>

          {/* 4. No Performance Guarantees */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">4. No Performance Guarantees</h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
              <p className="text-gray-700 leading-relaxed">
                We do not guarantee any minimum number of Orders, level of marketing exposure, sales performance, or revenue from your use of the Platform. Your success on the Platform depends on various factors including your food quality, pricing, availability, and customer demand.
              </p>
            </div>
          </section>

          {/* 5. Accounts & Platform */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">5. Accounts &amp; Platform</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.1</span> While you have an Account, we grant you a right to use our Platform. This right cannot be passed on or transferred to any other person.
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.2</span> We will set up an account for you on the Platform (<strong>Account</strong>) to access and use our Platform. While you have an Account with us, you agree to keep your information and Listing up-to-date (and ensure it remains true, accurate and complete).
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">5.3</span> You must not:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>access or use our Platform in any way that is improper or breaches any laws, infringes any person&rsquo;s rights (for example, intellectual property rights and privacy rights), or gives rise to any civil or criminal liability;</li>
                  <li>interfere with or interrupt the supply of our Platform, or any other person&rsquo;s access to or use of our Platform;</li>
                  <li>introduce any viruses or other malicious software code into our Platform;</li>
                  <li>use any unauthorised or modified version of our Platform, including but not limited to for the purpose of building similar or competitive software or for the purpose of obtaining unauthorised access to our Platform;</li>
                  <li>attempt to access any data or log into any server or account that you are not expressly authorised to access;</li>
                  <li>use our Platform in any way that involves service bureau use, outsourcing, renting, reselling, sublicensing, concurrent use of a single user login, or time-sharing;</li>
                  <li>circumvent user authentication or security of any of our networks, accounts or hosts or those of any third party; or</li>
                  <li>access or use our Platform to transmit, publish or communicate material that is, defamatory, offensive, abusive, indecent, menacing, harassing or unwanted.</li>
                </ul>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">5.4</span> We may suspend, restrict, or remove your Account or Listing immediately if we reasonably believe that you have breached this Agreement, failed to maintain food safety standards, or engaged in conduct that may harm our reputation or the Customer experience.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Orders */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">6. Orders</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.1</span> Each Order will be deemed to be notified to you one hour after the notification is sent from us via the Platform.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.2</span> You acknowledge and agree that we may communicate with you regarding Orders via the Platform, email, WhatsApp, SMS, telephone or any other reasonable method. By responding to, acknowledging, or acting upon any Order notification (regardless of communication method), you are deemed to have accepted that Order and all communications regarding Orders are subject to the terms of this Agreement.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.3</span> You may set a maximum Order limit through your Account. Orders within this limit will be automatically accepted and are binding under clause 6.4. You must keep your Account settings up to date and update them immediately if your capacity changes. You acknowledge and accept that you remain responsible for fulfilling all automatically accepted Orders.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">6.4</span> Once you have accepted an Order and payment has been received from the Customer, the Order cannot be modified or cancelled if the scheduled event date is within 5 Business Days, except with our prior written consent or due to circumstances beyond your reasonable control. For the avoidance of doubt, once you accept an Order, you must not cancel it except in circumstances beyond your reasonable control or with our prior written consent.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">6.5</span> Nothing in this Agreement creates an exclusive relationship between the Parties, and either Party may during the Term enter into a similar arrangement with any other third party.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Your Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">7. Your Services</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.1</span> You acknowledge and agree that you will be responsible for entering into a direct contractual relationship with Customers that place an Order for catering via our Platform and that we will not enter into any contractual relationship with the Customers on your behalf. You are solely responsible for all obligations to Customers once they place an Order with you. We are not a party to any legally binding agreement between you and a Customer. You represent and warrant that it is your sole responsibility to enter into any written or verbal agreements for any Order with the relevant Customer.
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">7.2</span> <strong>Required Insurances:</strong> At a minimum, you are required to effect and maintain the following insurances for the Term (and for a reasonable period thereafter) with a reputable insurance provider:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>a public liability insurance policy, or equivalent, in the amount of no less than £10 million for any one claim;</li>
                  <li>a professional indemnity insurance policy, or equivalent, in the amount of no less than £10 million for any one claim;</li>
                  <li>an employer&rsquo;s liability insurance policy, or equivalent, as required by law; and</li>
                  <li>all other insurances required by Law in order for you to provide us with the Services,</li>
                </ul>
                <p className="mt-2 text-gray-600">(together, the <strong>Required Insurances</strong>).</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">7.3</span> You must, on request, provide us with evidence sufficient to enable us to confirm you hold the Required Insurances.
                </p>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">7.4</span> You acknowledge and accept that any attempt to circumvent our Platform or avoid payment of Our Commission in respect of the Orders placed through our Platform shall constitute a material breach of this Agreement. Without prejudice to any other rights or remedies we may have, where you circumvent the Platform in respect of a specific Order, you shall pay us a sum equal to the commission that would have been payable to us had that Order been placed through the Platform in the usual way (<strong>Circumvention Fee</strong>). You acknowledge and accept that the Circumvention Fee represents a genuine pre-estimate of our likely losses that we may suffer or incur as a result of such circumvention, being the lost commission revenue.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Payments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">8. Payments</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.1</span> In consideration for us providing Our Services, you agree to pay Our Commission by authorising us to calculate and deduct Our Commission from the Gross Revenue and transfer Your Fees to your Stripe account.
                </p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.2</span> We will transfer Your Fees to your Stripe account on a fortnightly basis at no additional cost to you. You may request early withdrawal of Your Fees from your Account to your Stripe account at any time, subject to an administrative fee per withdrawal (as set out on the Platform or as otherwise communicated by us to you). You acknowledge and accept that the minimum withdrawal amount is £10.00 and there is a limit of one early withdrawal over a 7 day period.
                </p>
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">8.3</span> You agree to create and maintain an active Stripe account in good standing for the purposes of receiving Your Fees under this Agreement. You acknowledge and accept that:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>Stripe charges a processing fee when Customers pay for Orders, which we absorb;</li>
                  <li>Stripe charges a payout fee when you withdraw Your Fees from your Stripe account to your bank account, which is your sole responsibility to pay;</li>
                  <li>these additional fees are set by Stripe and may change from time to time;</li>
                  <li>the timeframes for receiving Your Fees is subject to Stripe&rsquo;s processing times and any refund dispute periods as set out in clause 9; and</li>
                  <li>your use of Stripe is subject to Stripe&rsquo;s terms and conditions, which you must comply with at all times.</li>
                </ul>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.4</span> You agree that we may set-off or deduct from any monies payable to you under this Agreement, any amounts which are payable by you to us under this Agreement.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">8.5</span> <strong>VAT compliance:</strong> As the legal seller of food to the Customers, you are solely responsible for your VAT obligations in respect of food sales made through the Platform, including:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>registering for VAT where required and maintaining a valid VAT registration for the Term;</li>
                  <li>declaring and accounting for output VAT on all food sales made through the Platform;</li>
                  <li>issuing valid VAT invoices to Customers where required; and</li>
                  <li>maintaining accurate records of all food sales in accordance with HMRC&rsquo;s requirements.</li>
                </ul>
                <p className="mt-2 text-gray-600">You must notify us in writing within 5 Business Days if your VAT registration status changes in any way, including registration, cancellation or suspension.</p>
              </div>
              <div className="border-l-4 border-emerald-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">8.6</span> We will provide you with a monthly commission summary showing total Gross Revenue, commission deducted, and net amount transferred to your Stripe account. This is provided for your records only. We do not issue individual sales invoices or operate a self-billing arrangement on your behalf.
                </p>
              </div>
            </div>
          </section>

          {/* 9. Refunds */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">9. Refunds</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.1</span> You acknowledge that it is your responsibility to provide Customers with your refunds policy on your Listing. Where you do not display your own refund policy on your Listing, you acknowledge and agree that you will comply with, and apply the default refund policy with Customers. Our refund policy can be found here: swiftfood.uk/refund-terms.
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">9.2</span> Refunds will only be considered in exceptional circumstances including significant missing items, incorrect quantities, food safety concerns, or serious quality issues affecting the Order. Refund requests by the Customer must be made within 24 hours of delivery of the food to the relevant Customer, and supported by evidence. Orders cannot be cancelled or refunded by the Customer if the event is within 5 Business Days.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.3</span> If a Customer requests a refund within 24 hours of delivery, we will notify you and you must respond within 48 hours indicating whether you will grant the refund. The decision to grant a refund is at your sole discretion. Where you agree to grant a refund, we will process the refund through Stripe and deduct the refund amount from Your Fees.
                </p>
              </div>
              <div className="border-l-4 border-orange-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">9.4</span> Where a refund is disputed, Stripe may hold Your Fees pending resolution. If a Customer initiates a chargeback through Stripe, you are responsible for any amounts reversed and we may deduct these from Your Fees.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Warranties and Representations */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">10. Warranties and Representations</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">10.1</span> Each Party represents and warrants that:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>it has full legal capacity, right, authority and power to enter into this Agreement, to perform its obligations under this Agreement, and to carry on its business;</li>
                  <li>this Agreement constitutes a legal, valid and binding agreement, enforceable in accordance with its terms;</li>
                  <li>all information and documentation that it provides to the other Party in connection with this Agreement is true, correct and complete; and</li>
                  <li>no insolvency events (including bankruptcy, receivership, administration, liquidation or creditors&rsquo; schemes of arrangement) affecting it or its property are occurring or are likely to occur.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 11. Your Warranties */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">11. Your Warranties</h2>
            <div className="space-y-4">
              <div className="bg-green-50 border-l-4 border-green-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">11.1</span> You further represent and warrant that:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>you are registered with your local authority as a food business and hold a food hygiene rating of at least 3 stars;</li>
                  <li>you hold all necessary licenses, permits, registrations, and certifications required to operate your food business, and all such licenses, permits, registrations, and certifications are current and valid;</li>
                  <li>you comply with all food safety laws and regulations;</li>
                  <li>all allergen information you provide is accurate and complete, and you maintain written records of ingredients and allergens for all menu items in accordance with the Food Information Regulations 2014 (as amended) and all requirements introduced by &lsquo;Natasha&rsquo;s Law&rsquo;. You acknowledge that Swift Food does not collect or verify allergen information on your behalf and that compliance with allergen labelling and disclosure requirements is solely your responsibility;</li>
                  <li>all menu information, descriptions, pricing, and availability information you provide in your Listing is accurate and not misleading; and</li>
                  <li>you will notify us immediately if any licence, permit, registration, certification, or insurance is suspended, revoked, cancelled, or expires, or if your food hygiene rating falls below 3 stars.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 12. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">12. Intellectual Property</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.1</span> As between the Parties:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>we own all Intellectual Property Rights in Our Materials;</li>
                  <li>you own all Intellectual Property Rights in Your Materials; and</li>
                  <li>nothing in this Agreement constitutes a transfer or assignment of any Intellectual Property Rights in Our Materials or Your Materials.</li>
                </ul>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.2</span> You grant us a non-exclusive, revocable, royalty-free, worldwide, non-sublicensable and non-transferable right and licence, for the Term, to use Your Materials that you provide to us, solely for our use to refer Orders to you, as contemplated by this Agreement.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.3</span> If you (if you are an individual) or any of your Personnel have any Moral Rights in any material provided, used or prepared in connection with this Agreement, you agree to (and will procure that your Personnel) consent to our use or infringement of those Moral Rights.
                </p>
              </div>
              <div className="border-l-4 border-indigo-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">12.4</span> This clause 12 will survive termination or expiry of this Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* 13. Data and Analytics */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">13. Data and Analytics</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.1</span> You own all data, information, personal data or content you upload into the Platform (<strong>Your Data</strong>).
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.2</span> You grant us a limited licence to copy, transmit, store, backup and/or otherwise access or use Your Data to:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>communicate with you;</li>
                  <li>supply the Platform to you and our Services to you under this Agreement;</li>
                  <li>diagnose problems with the Platform, and enhance or otherwise modify the Platform;</li>
                  <li>perform analytics (<strong>Analytics</strong>);</li>
                  <li>develop other services, provided we de-identify Your Data; and</li>
                  <li>as reasonably required to perform our obligations under this Agreement.</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.3</span> You represent and warrant that:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>you own or have all necessary rights to Your Data; and</li>
                  <li>Your Data does not infringe any third party rights or breach any laws.</li>
                </ul>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.4</span> We may create Analytics based on aggregated and anonymised use of the Platform. We own all rights in the Analytics and may use them for our business purposes, provided they contain no identifying information about you.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.5</span> You are solely responsible for the accuracy, completeness, and integrity of Your Data. The Platform&rsquo;s performance depends on the quality of Your Data you provide. We are not responsible for Your Data or any loss or corruption of Your Data.
                </p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">13.6</span> This clause will survive termination or expiry of this Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* 14. Confidential Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">14. Confidential Information</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.1</span> Subject to clause 14.2, each Party must (and must ensure that its Personnel do) keep confidential, and not use or permit any unauthorised use of, confidential information provided by the other Party.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.2</span> Clause 14.1 does not apply where the disclosure is required by Law or the disclosure is to a professional adviser in order to obtain advice in relation to matters arising in connection with this Agreement and provided that the disclosing Party ensures the adviser complies with the terms of clause 14.1.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">14.3</span> This clause 14 will survive the termination of this Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* 15. Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">15. Privacy</h2>
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">15.1</span> You must only use Customer personal data obtained through the Platform to fulfil Orders and comply with legal obligations. You must not use Customer personal data for marketing or to solicit business outside the Platform.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">15.2</span> You warrant and represent that you will only hold Customer personal data as long as necessary or as required by law, and must comply with all applicable data protection laws.
                </p>
              </div>
            </div>
          </section>

          {/* 16. Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">16. Liability</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">16.1</span> Nothing in this Agreement limits any Liability which cannot legally be limited, including Liability for:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>death or personal injury caused by negligence; and</li>
                  <li>fraud or fraudulent misrepresentation.</li>
                </ul>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">16.2</span> Subject to clause 16.1, but despite anything to the contrary, to the maximum extent permitted by law:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>neither Party will be liable for Consequential Loss;</li>
                  <li>a Party&rsquo;s liability for any Liability under this Agreement will be reduced proportionately to the extent the relevant Liability was caused or contributed to by the acts or omissions of the other Party (or any of its Personnel), including any failure by that other Party to mitigate its loss; and</li>
                  <li>our aggregate liability for any Liability arising from or in connection with this Agreement will be limited to the amount of Our Commission paid to us in the 12 months preceding the last Liability.</li>
                </ul>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">16.3</span> To the maximum extent permitted by Law, you indemnify us from and against any Liability that we may suffer, incur or otherwise become liable for, arising from or in connection with any third party claims relating to any Order, or your provision of the catering services to the Customer, including but not limited to claims arising from food safety failures, allergen or contamination incidents, or your failure to comply with applicable food safety laws and regulations, or your failure to comply with your VAT obligations in respect of food sales made through the Platform.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">16.4</span> This clause 16 will survive the termination or expiry of this Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* 17. Term and Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">17. Term and Termination</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">17.1</span> This Agreement will operate for the Term.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">17.2</span> Either Party may terminate this Agreement at any time by giving 30 days&rsquo; notice in writing to the other Party.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">17.3</span> This Agreement will terminate immediately upon written notice by a Party (<strong>Non-Defaulting Party</strong>) if:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>the other Party (<strong>Defaulting Party</strong>) breaches a material term of this Agreement and that breach has not been remedied within 10 Business Days of the Defaulting Party being notified of the breach by the Non-Defaulting Party; or</li>
                  <li>any step is taken to enter into any arrangement between the Defaulting Party and its creditors, any step is taken to appoint a receiver, a receiver and manager, a liquidator, a provisional liquidator or like person of the whole or any part of the Defaulting Party&rsquo;s assets or business, the Defaulting Party is bankrupt, or the Defaulting Party is unable to pay its debts as they fall due.</li>
                </ul>
              </div>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium">17.4</span> Upon expiry or termination of this Agreement:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>we will cease providing Orders to you;</li>
                  <li>any payments made by you to us are not refundable to you;</li>
                  <li>you are to pay for all Orders placed prior to expiry or termination of this Agreement;</li>
                  <li>by us pursuant to clause 17.3, you also agree to pay us our additional costs, reasonably incurred, and which arise directly from such termination (including recovery fees); and</li>
                  <li>we may retain your documents and information (including copies) to the extent required by Law or pursuant to any information technology back-up procedure, provided that we handle your information in accordance with clause 14.</li>
                </ul>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">17.5</span> Termination of this Agreement will not affect any rights or liabilities that a Party has accrued under it.
                </p>
              </div>
              <div className="border-l-4 border-red-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">17.6</span> This clause 17 will survive the termination or expiry of this Agreement.
                </p>
              </div>
            </div>
          </section>

          {/* 18. General */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">18. General</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.1</span> <strong>Assignment:</strong> A Party must not assign, novate or deal with the whole or any part of its rights or obligations under this Agreement without the prior written consent of the other Party (such consent is not to be unreasonably withheld).
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.2</span> <strong>Contracts (Rights of Third Parties) Act 1999:</strong> Notwithstanding any other provision of this Agreement, nothing in this Agreement confers or is intended to confer any right to enforce any of its terms on any person who is not a party to it.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.3</span> <strong>Counterparts:</strong> This Agreement may be executed in any number of counterparts that together will form one instrument.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.4</span> <strong>Disputes:</strong> A Party may not commence court proceedings relating to any dispute, controversy or claim arising from, or in connection with, this Agreement (including any question regarding its existence, validity or termination) (<strong>Dispute</strong>) without first meeting with a senior representative of the other Party to seek (in good faith) to resolve the Dispute. If the Parties cannot agree how to resolve the Dispute at that initial meeting, then:
                </p>
                <ul className="mt-2 ml-6 list-disc space-y-1 text-gray-600">
                  <li>where you are incorporated or a resident in England in Wales, then either Party may refer the matter to a mediator. If the Parties cannot agree on who the mediator should be, either Party may ask the Centre for Effective Dispute Resolution to appoint a mediator. The mediator will decide the time, place and rules for mediation. The Parties agree to attend the mediation in good faith, to seek to resolve the Dispute. The costs of the mediation will be shared equally between the Parties; or</li>
                  <li>where you are not incorporated or a resident in England in Wales, then either Party may refer the matter to arbitration administered by the London Court of International Arbitration (LCIA) with such arbitration to be conducted in London, England, in English and in accordance with the LCIA Rules. The costs of the arbitration will be shared equally between the Parties and the determination of the arbitrator will be final and binding on the parties.</li>
                </ul>
                <p className="mt-2 text-gray-600">Nothing in this clause will operate to prevent a Party from seeking urgent injunctive or equitable relief from a court of appropriate jurisdiction. This clause will survive termination or expiry of this Agreement.</p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.5</span> <strong>Electronic Execution:</strong> This Agreement may be executed using an Electronic Signature. The Parties acknowledge and agree that if a Party executes this Agreement using an Electronic Signature, then the Party is taken to have entered into this Agreement in electronic form and the Electronic Signature is deemed to be an original execution of the Agreement by the Party. &ldquo;Electronic Signature&rdquo; means an electronic method of signing that identifies the person and indicates their intention to sign this Agreement, which may include software programs such as DocuSign.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.6</span> <strong>Entire Agreement:</strong> This Agreement contains the entire understanding between the Parties and the Parties agree that no representation or statement has been made to, or relied upon by, either of the Parties, except as expressly stipulated in this Agreement, and this Agreement supersedes all previous discussions, communications, negotiations, understandings, representations, warranties, commitments and agreements, in respect of its subject matter.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.7</span> <strong>Force Majeure:</strong> Neither Party will be liable for any delay or failure to perform their respective obligations under this Agreement if such delay or failure is caused or contributed to by a Force Majeure Event, provided that the Party seeking to rely on the benefit of this clause: (a) as soon as reasonably practical, notifies the other Party in writing details of the Force Majeure Event, and the extent to which it is unable to perform its obligations; and (b) uses reasonable endeavours to minimise the duration and adverse consequences of the Force Majeure Event. Where the Force Majeure Event prevents a Party from performing a material obligation under this Agreement for a period in excess of 60 days, then the other Party may by notice terminate this Agreement, which will be effective immediately, unless otherwise stated in the notice. This clause will not apply to a Party&rsquo;s obligation to pay any amount that is due and payable to the other Party under this Agreement.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.8</span> <strong>Further Assurance:</strong> Each Party must promptly do all things and execute all further instruments necessary to give full force and effect to this Agreement and their obligations under it.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.9</span> <strong>Governing Law:</strong> This Agreement is governed by the laws of England and Wales. Each Party irrevocably and unconditionally submits to the exclusive jurisdiction of the courts operating in England and Wales and any courts entitled to hear appeals from those courts and waives any right to object to proceedings being brought in those courts.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.10</span> <strong>Notices:</strong> Any notice given under this Agreement must be in writing addressed to the addresses set out in this Agreement, or the relevant address last notified by the recipient to the Parties in accordance with this clause. Any notice may be sent by standard post or email, and will be deemed to have been served on the expiry of 48 hours in the case of post, or at the time of transmission in the case of transmission by email.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.11</span> <strong>Privacy:</strong> Each Party agrees to comply with the Data Protection Act 2018 and any other applicable legislation or privacy guidelines in respect of any Customer personal data. Each Party shall be considered as an independent controller (for the purposes of the Data Protection Act 2018) when dealing with Customer personal data.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.12</span> <strong>Publicity:</strong> Despite clause 14, each Party may advertise or publicise the existence and broad nature of the referral relationship between the Parties. However, a Party must not reveal the amount of Our Commission generated under this Agreement unless required by Law.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.13</span> <strong>Relationship of Parties:</strong> This Agreement is not intended to create a partnership, joint venture, employment or agency relationship between the Parties.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.14</span> <strong>Severance:</strong> If a provision of this Agreement is held to be void, invalid, illegal or unenforceable, that provision is to be read down as narrowly as necessary to allow it to be valid or enforceable, failing which, that provision (or that part of that provision) will be severed from this Agreement without affecting the validity or enforceability of the remainder of that provision or the other provisions in this Agreement.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.15</span> <strong>Subcontracting:</strong> We may subcontract any part of the Order Process or Our Services without your prior written consent. We agree that any subcontracting does not discharge us from any liability under this Agreement and that we are liable for the acts and omissions of our subcontractor.
                </p>
              </div>
              <div className="border-l-4 border-gray-400 pl-4">
                <p className="text-gray-600 leading-relaxed">
                  <span className="font-medium">18.16</span> <strong>Waiver:</strong> Any failure or delay by a Party in exercising a power or right (either wholly or partially) in relation to this Agreement does not operate as a waiver or prevent that Party from exercising that power or right or any other power or right. A waiver must be in writing and will be effective only to the extent specifically stated.
                </p>
              </div>
            </div>
          </section>

          {/* 19. Definitions */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">19. Definitions</h2>
            <p className="text-gray-600 leading-relaxed mb-4">In this Agreement, unless the context otherwise requires, capitalised terms have the following meanings (or where indicated, the meaning given on the Platform):</p>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Agreement</strong> means these terms and conditions and any documents attached to, or referred to in, each of them.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Business Day</strong> means a day on which banks are open for general banking business in England, excluding Saturdays, Sundays and bank holidays.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Commencement Date</strong> means the date this Agreement is accepted by you in accordance with clause 1.1.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Consequential Loss</strong> includes any consequential loss, special or indirect loss, real or anticipated loss of profit, loss of benefit, loss of revenue, loss of business, loss of goodwill, loss of opportunity, loss of savings, loss of reputation, loss of use and/or loss or corruption of data, whether under statute, contract, equity, tort (including negligence), indemnity or otherwise.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Customer</strong> means an individual or entity placing an order through our Platform for the provision of your catering services.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Force Majeure Event</strong> means any event or circumstance which is beyond a Party&rsquo;s reasonable control including acts of God including fire, hurricane, typhoon, earthquake, landslide, tsunami, mudslide or other catastrophic natural disaster, civil riot, civil rebellion, revolution, terrorism, insurrection, militarily usurped power, act of sabotage, act of a public enemy, war (whether declared or not) or other like hostilities, ionising radiation, contamination by radioactivity, nuclear, chemical or biological contamination, any widespread illness, quarantine or government sanctioned ordinance or shutdown, pandemic (including COVID-19 and any variations or mutations to this disease or illness) or epidemic.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Gross Revenue</strong> means the total value paid by the Customer under each Order (excluding VAT), less any delivery fees and service charges paid by the Customer.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Intellectual Property Rights</strong> or <strong>Intellectual Property</strong> means any and all existing and future rights throughout the world conferred by statute, common law, equity or any corresponding law in relation to any copyright, designs, patents or trade marks, domain names, know-how, inventions, processes, trade secrets or confidential information, circuit layouts, software, computer programs, databases or source codes, including any application, or right to apply, for registration of, and any improvements, enhancements or modifications of, the foregoing, whether or not registered or registrable.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Law</strong> means all applicable laws, regulations, codes, guidelines, policies, protocols, consents, approvals, permits and licences, and any requirements or directions given by any government or similar authority with the power to bind or impose obligations on the relevant Party in connection with this Agreement.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Liability</strong> means any expense, cost, liability, loss, damage, claim, notice, entitlement, investigation, demand, proceeding or judgment (whether under statute, contract, equity, tort (including negligence), indemnity or otherwise), howsoever arising, whether direct or indirect and/or whether present, unascertained, future or contingent and whether involving a third party or a Party to this Agreement or otherwise.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Listing</strong> means the listing of your restaurant on the Platform, including display of your menu, pricing and restaurant information.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Moral Rights</strong> means any moral rights, including those conferred by Chapter IV of the Copyright, Designs and Patents Act 1988.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Order</strong> means a request for the supply of your catering services placed by a Customer through the Platform and accepted by you.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Order Process</strong> means the order process set out at clause 6.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Our Commission</strong> means the amount of commission due and payable to us, calculated as a percentage of the Gross Revenue derived from each Order placed by a Customer, as set out in the Platform.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Our Materials</strong> means all Intellectual Property which is owned by or licensed to us and any improvements, modifications or enhancements of such Intellectual Property, but excludes Your Materials.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Payment Terms</strong> means the payment terms set out in clause 8.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Personnel</strong> means, in respect of a Party, any of its employees, consultants, suppliers, subcontractors or agents, but does not include the other Party.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Platform</strong> means our online ordering platform and management system (provided to you via our website).</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Your Fees</strong> means the Gross Revenue less Our Commission, as set out on the Platform.</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600 leading-relaxed"><strong>Your Materials</strong> means all Intellectual Property owned or licensed by you or your Personnel before the Commencement Date (which is not connected to this Agreement) and/or developed by or on behalf of you or your Personnel independently of this Agreement and any improvements, modifications or enhancements of such Intellectual Property, but excludes Our Materials.</p>
              </div>
            </div>
          </section>

          {/* 20. Interpretation */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">20. Interpretation</h2>
            <p className="text-gray-600 leading-relaxed mb-4">In this Agreement, unless the context otherwise requires:</p>
            <div className="space-y-2 text-gray-600">
              <p>(a) a reference to this Agreement or any other document includes the document, all schedules and all annexures as novated, amended, supplemented, varied or replaced from time to time;</p>
              <p>(b) a reference to any legislation or law includes subordinate legislation or law and all amendments, consolidations, replacements or re-enactments from time to time;</p>
              <p>(c) a reference to a person includes a natural person, body corporate, partnership, joint venture, association, government or statutory body;</p>
              <p>(d) a reference to a party (including a Party) to a document includes that party&rsquo;s executors, administrators, successors, permitted assigns;</p>
              <p>(e) a reference to a covenant, obligation or agreement of two or more persons binds or benefits them jointly and severally;</p>
              <p>(f) words like &ldquo;including&rdquo; and &ldquo;for example&rdquo; are not words of limitation;</p>
              <p>(g) a reference to time is to local time in England; and</p>
              <p>(h) a reference to £ or pounds refers to the currency of the United Kingdom from time to time.</p>
            </div>
          </section>

          {/* Footer */}
          <section className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500 text-sm">
              © LegalVision Law UK Ltd
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}

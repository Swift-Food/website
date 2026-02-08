import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Swift Food",
  description: "Swift Food Services Ltd privacy policy. Learn how we collect, use, and protect your personal data.",
  alternates: { canonical: "https://swiftfood.uk/privacy" },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            SWIFT FOOD SERVICES LTD – PRIVACY POLICY
          </h1>
          <p className="text-gray-600 text-lg">
            How we collect, use, and protect your personal information
          </p>
          <p className="text-gray-500 mt-2">Last update: 29 October 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border p-8 space-y-8">
          {/* Introduction */}
          <section>
            <p className="text-gray-600 leading-relaxed">
              This privacy policy applies to Swift Food Services Ltd (
              <strong>we</strong>, <strong>us</strong> or <strong>our</strong>).
              We are committed to protecting your privacy. This policy explains
              how we collect, use and share your personal data. It applies to
              all personal data we handle, whether we collect it through our
              website, in person, or through other means.
            </p>
          </section>

          {/* Information we collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Information we collect
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">Identity and contact details</h3>
                <p className="text-gray-600">Name, residential address, email address and phone number, professional details</p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-800">Service related information</h3>
                <p className="text-gray-600">Transaction details, service preferences, marketing preferences, loyalty programme information, feedback, complaints and survey responses</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">Financial and payment information</h3>
                <p className="text-gray-600">Payment details, credit reference information, banking or payment card information</p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-semibold text-gray-800">Digital information</h3>
                <p className="text-gray-600">IP address, location information, search and browsing behaviour, website usage patterns, cookie preferences</p>
              </div>

              <div className="border-l-4 border-orange-400 pl-4">
                <h3 className="font-semibold text-gray-800">Recordings</h3>
                <p className="text-gray-600">Call recordings, records of meetings and decisions</p>
              </div>

              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-gray-800">Professional information (for job applicants)</h3>
                <p className="text-gray-600">Employment history, professional experience, authorisations and licences, professional registrations, right to work information</p>
              </div>
            </div>
          </section>

          {/* How we collect personal data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How we collect personal data
            </h2>
            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600"><strong>Directly from you:</strong> when you interact with us, contact us, fill out forms</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600"><strong>Automatically:</strong> when you visit our website, use our technologies, interact with our online services</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600"><strong>From third parties:</strong> service providers, business partners, previous employers, government organisations</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600"><strong>From publicly available sources:</strong> Companies House, professional networking sites like LinkedIn</p>
              </div>
            </div>
          </section>

          {/* How we use your information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How we use your information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Data protection law requires us to have proper legal reasons for using your personal data. We can only use your information when we have one or more of these legal bases:
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <div className="space-y-3 text-gray-700">
                <p><strong>Consent:</strong> You have clearly agreed to us using your personal data for a specific purpose</p>
                <p><strong>Performance of a contract:</strong> We need to use your information to fulfil a contract with you</p>
                <p><strong>Legal duty:</strong> We must use your information to comply with the law</p>
                <p><strong>Vital interests:</strong> We need to use your information to protect someone&apos;s life</p>
                <p><strong>Public interest:</strong> We need to use your information to perform a task in the public interest</p>
                <p><strong>Legitimate interests:</strong> We have a genuine business reason to use your information</p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6">
              <p className="text-gray-700 leading-relaxed">
                Where we rely on <strong>legitimate interests</strong>, we have conducted balancing tests considering: the nature of our legitimate interest, the impact on you, safeguards we can implement, your reasonable expectations, and the broader context of our relationship.
              </p>
            </div>
          </section>

          {/* Managing your account */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              How we use your information in detail
            </h2>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Managing your account and providing our services</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Enable you to access and use our website and app</p>
                  <p>• Process orders, dispatch and delivery of products</p>
                  <p>• Contact you about our services and respond to support requests</p>
                  <p>• Internal record keeping, invoicing and billing</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500"><strong>Legal basis:</strong> Performance of Contract, Legal Duty, Legitimate interests</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Client onboarding and verification</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Assess whether to take you on as a new client</p>
                  <p>• Perform anti-money laundering, anti-terrorism, sanction screening, fraud and background checks</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500"><strong>Legal basis:</strong> Performance of Contract, Legal Duty, Public Interest, Legitimate interests</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Business improvement and development</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Analytics on our website</p>
                  <p>• Market research and business development</p>
                  <p>• Operate and improve our services and platforms</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500"><strong>Legal basis:</strong> Legitimate interests</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Marketing and communications</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Send promotional information about our events and experiences</p>
                  <p>• Run promotions, competitions and offer additional benefits</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500"><strong>Legal basis:</strong> Legitimate interests</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Recruitment and employment</h3>
                <div className="space-y-2 text-gray-600">
                  <p>• Consider your application and keep you updated on progress</p>
                  <p>• Make reasonable adjustments for disabilities</p>
                  <p>• Monitor equality and diversity composition</p>
                  <p>• Ensure compliance with right to work requirements</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500"><strong>Legal basis:</strong> Legitimate interests, Legal Duty, Consent, Performance of Contract</p>
                </div>
              </div>
            </div>
          </section>

          {/* Disclosures to third parties */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our disclosures of personal data to third parties
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may disclose personal data to:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">Service providers</h3>
                <div className="text-gray-600 space-y-1 mt-2">
                  <p>• IT service providers including Heroku</p>
                  <p>• Data storage providers including AWS S3</p>
                  <p>• Web hosting providers including Netlify, GoDaddy, WhatsApp and Notion</p>
                  <p>• Payment processors including Stripe</p>
                  <p>• Communication and notification providers including Firebase, Expo and Twilio</p>
                  <p>• Marketing, advertising and analytics providers</p>
                </div>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-800">Professional advisers</h3>
                <p className="text-gray-600">Bankers, auditors, insurers and insurance brokers, legal advisers</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">Business partners</h3>
                <p className="text-gray-600">Our existing or potential agents, business partners or contractors</p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-semibold text-gray-800">Corporate transactions</h3>
                <p className="text-gray-600">If we merge with or are acquired by another company, your information may be disclosed to advisers and included in transferred assets</p>
              </div>

              <div className="border-l-4 border-orange-400 pl-4">
                <h3 className="font-semibold text-gray-800">Legal and regulatory bodies</h3>
                <p className="text-gray-600">Courts and tribunals, regulatory authorities, law enforcement officers</p>
              </div>

              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-gray-800">Other parties</h3>
                <p className="text-gray-600">Third parties you have authorised, emergency services, any other parties as required by law</p>
              </div>
            </div>
          </section>

          {/* Overseas transfers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Overseas transfers
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Where we store your information</h3>
              <p className="text-gray-700 leading-relaxed">
                We store your personal data in the United Kingdom. However, your information may be transferred outside the UK when our service providers are located overseas, when we work with overseas business partners, when using cloud-based services, or when required by law.
              </p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-400 p-6">
              <h3 className="font-semibold text-gray-800 mb-2">How we protect overseas transfers</h3>
              <p className="text-gray-700 leading-relaxed mb-3">
                When we transfer your personal data outside the UK, we ensure appropriate protection by:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Only transferring to countries with adequate data protection</li>
                <li>Putting contracts in place requiring UK-standard protection</li>
                <li>Transferring to organisations with specific cross-border agreements</li>
              </ul>
            </div>
          </section>

          {/* Children's Personal Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Children&apos;s Personal Data
            </h2>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not knowingly collect personal data from children under 13 without parental consent. If you are under 13, please do not provide personal data without asking your parent or guardian.
              </p>
              <p className="text-gray-700 leading-relaxed">
                <strong>Parents and guardians</strong> have the right to: review personal data we hold about their child, request correction or deletion, refuse or withdraw consent, and contact us with any concerns.
              </p>
            </div>
          </section>

          {/* Data retention */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Data retention
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">How long we keep your information</h3>
                <p className="text-gray-600">We only keep your data as long as needed to provide services, meet legal obligations, and handle complaints or legal issues.</p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-800">How we decide retention periods</h3>
                <p className="text-gray-600">We consider: how much and how sensitive the information is, risk of unauthorised access, alternative ways to achieve our purposes, legal requirements, and the nature of our relationship.</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">When we no longer need your information</h3>
                <p className="text-gray-600">Once no longer needed, we will securely delete or destroy it in accordance with our policies and legal requirements.</p>
              </div>
            </div>
          </section>

          {/* Location services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Use of location services data
            </h2>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-6">
              <p className="text-gray-700 leading-relaxed mb-3">
                We collect your location via our mobile application to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Enable delivery drivers to deliver your order</li>
                <li>Enable you to track delivery drivers</li>
                <li>Generate and improve routes</li>
                <li>For security and safety</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                You can turn off location services in your account settings or mobile phone settings. Note this may affect our ability to provide services.
              </p>
            </div>
          </section>

          {/* Privacy rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Your privacy rights and choices
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">Right of Access</h3>
                <p className="text-gray-600 text-sm">Ask us for copies of your personal data</p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Rectification</h3>
                <p className="text-gray-600 text-sm">Ask us to correct inaccurate or incomplete data</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Erasure</h3>
                <p className="text-gray-600 text-sm">Request deletion of your personal data</p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Restrict Processing</h3>
                <p className="text-gray-600 text-sm">Ask us to suspend processing in certain cases</p>
              </div>

              <div className="border-l-4 border-orange-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Data Portability</h3>
                <p className="text-gray-600 text-sm">Receive your data in a structured format</p>
              </div>

              <div className="border-l-4 border-red-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Object</h3>
                <p className="text-gray-600 text-sm">Object to processing based on legitimate interests</p>
              </div>

              <div className="border-l-4 border-indigo-400 pl-4">
                <h3 className="font-semibold text-gray-800">Right to Withdraw Consent</h3>
                <p className="text-gray-600 text-sm">Withdraw consent at any time</p>
              </div>

              <div className="border-l-4 border-teal-400 pl-4">
                <h3 className="font-semibold text-gray-800">Marketing Opt-out</h3>
                <p className="text-gray-600 text-sm">Opt-out of marketing communications at any time</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">How to Exercise Your Rights</h3>
              <p className="text-gray-600">
                Contact us using the details below. We may ask for proof of identity and will respond within one month (extendable to three months for complex requests).
              </p>
            </div>
          </section>

          {/* Making a complaint */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Making a complaint
            </h2>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Contact us first</h3>
              <p className="text-gray-700 leading-relaxed">
                If you&apos;re unhappy with how we&apos;ve used your personal data, please get in touch with us first. Give us full details about your complaint, we&apos;ll investigate promptly, and respond in writing explaining what we found and what we&apos;ll do.
              </p>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-400 p-6">
              <h3 className="font-semibold text-gray-800 mb-2">Your right to complain to the ICO</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can also complain directly to the Information Commissioner&apos;s Office (ICO), the UK&apos;s data protection regulator:
              </p>
              <div className="text-gray-700 space-y-1">
                <p><strong>Address:</strong> Information Commissioner&apos;s Office, Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF</p>
                <p><strong>Helpline:</strong> 0303 123 1113</p>
                <p><strong>Website:</strong> <a href="https://www.ico.org.uk/make-a-complaint" className="text-primary hover:underline">https://www.ico.org.uk/make-a-complaint</a></p>
              </div>
            </div>
          </section>

          {/* Protecting your information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Protecting your information
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use multiple layers of security to protect your information:
            </p>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">Technical safeguards</h3>
                <p className="text-gray-600">Enterprise-grade encryption, regular security testing, automated threat detection</p>
              </div>

              <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-semibold text-gray-800">Operational security</h3>
                <p className="text-gray-600">Staff training, strict access controls, regular security audits</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">Physical security</h3>
                <p className="text-gray-600">Secure premises, secure document disposal, equipment security protocols</p>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mt-6">
              <p className="text-gray-700">
                <strong>Public information:</strong> Any information you share publicly on online platforms (such as comments or reviews) can be accessed by others. We cannot control or protect publicly available information.
              </p>
            </div>
          </section>

          {/* Cookies and analytics */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Cookies and analytics
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              We use cookies and similar tracking technologies to enhance your browsing experience. Cookies are small text files stored on your device that help us remember your preferences.
            </p>

            <div className="space-y-3">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-gray-600"><strong>Essential cookies:</strong> Necessary for the website to function</p>
              </div>
              <div className="border-l-4 border-blue-400 pl-4">
                <p className="text-gray-600"><strong>Performance cookies:</strong> Help us understand how visitors interact with our website</p>
              </div>
              <div className="border-l-4 border-green-400 pl-4">
                <p className="text-gray-600"><strong>Functionality cookies:</strong> Remember your preferences and settings</p>
              </div>
              <div className="border-l-4 border-purple-400 pl-4">
                <p className="text-gray-600"><strong>Marketing cookies:</strong> Deliver relevant advertisements and track campaign effectiveness</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mt-6">
              <p className="text-gray-600">
                You can manage cookie preferences through our cookie preference centre, your browser settings, or our cookie policy. Note that disabling certain cookies may affect website functionality.
              </p>
            </div>
          </section>

          {/* Single sign-on */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              When you sign in with another account (like Google)
            </h2>
            <div className="bg-indigo-50 border-l-4 border-indigo-400 p-6">
              <p className="text-gray-700 leading-relaxed mb-3">
                When you use single sign-on, we receive personal data from that provider based on your privacy settings (name, username, profile picture, etc.). We use this to create your profile and give you access to our services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you connected through Facebook, you can ask us to delete that data by emailing us.
              </p>
            </div>
          </section>

          {/* AI Technologies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Artificial Intelligence (AI) Technologies
            </h2>

            <p className="text-gray-600 leading-relaxed mb-4">
              We use AI and machine learning technologies in our business operations, including tools from third parties. We only use these when legally permitted and necessary.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">How we use AI</h3>
              <div className="text-gray-700 space-y-1">
                <p>• Conduct analysis and data processing</p>
                <p>• Generate and modify content and coding</p>
                <p>• Improve and optimise our services</p>
                <p>• Automate routine tasks and communications</p>
                <p>• Personalise your experience</p>
                <p>• Support quality assurance and customer support</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-semibold text-gray-800">Transparency and control</h3>
                <p className="text-gray-600">We inform you when AI makes significant decisions, maintain human oversight, train staff on AI limitations, and verify AI outputs</p>
              </div>

              <div className="border-l-4 border-green-400 pl-4">
                <h3 className="font-semibold text-gray-800">Security</h3>
                <p className="text-gray-600">We use appropriate technical measures and regularly test AI outputs for accuracy and reliability</p>
              </div>

              <div className="border-l-4 border-purple-400 pl-4">
                <h3 className="font-semibold text-gray-800">Risk mitigation</h3>
                <p className="text-gray-600">We regularly assess and document AI risks, implement appropriate measures, and continuously monitor performance</p>
              </div>
            </div>
          </section>

          {/* Amendments */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Amendments
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We may update this policy at any time by posting the revised version on our website. We recommend that you review our website regularly to stay current with any policy changes.
            </p>
          </section>

          {/* Contact details */}
          <section className="bg-primary/5 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Our contact details
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Privacy contact email:</span>{" "}
                <a
                  href="mailto:swiftfooduk@gmail.com"
                  className="text-primary hover:underline font-medium"
                >
                  swiftfooduk@gmail.com
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500">Last update: 29 October 2025</p>
            <p className="text-sm text-gray-500 mt-1">
              &copy; LegalVision Law UK Ltd
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

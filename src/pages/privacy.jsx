import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section with gradient background */}
      <div className="appsection">
        <div className="text_section">
          <h1>Privacy Policy</h1>
          <p>Swift Food Services - How we protect your personal information</p>
        </div>
        
      </div>

      {/* Main Privacy Content */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '40px 20px',
        lineHeight: '1.6'
      }}>
        
        {/* Last Updated */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ 
            fontSize: '1.1rem', 
            color: '#666',
            margin: 0
          }}>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Introduction */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '30px', 
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{ 
            color: '#ff0088', 
            fontSize: '1.8rem', 
            marginBottom: '15px'
          }}>
            Introduction
          </h2>
          <p style={{ fontSize: '1rem', color: '#333', lineHeight: '1.6', margin: '0' }}>
            You know us as Swift Food, but our legal name is Swift Food Services Ltd ("we", "our", "us", "Swift" or "Swift Food"). We are committed to protecting the privacy of everyone who uses our website swiftfood.uk, mobile apps and social media pages (together, the "Services"). This Privacy Policy explains how we collect, use and protect your personal information — meaning any details that can identify you. Unless we tell you otherwise, Swift Food is the "controller" of the personal information we handle.
          </p>
        </div>

        {/* Privacy Policy Sections */}
        <div style={{ display: 'grid', gap: '30px' }}>
          
          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              1. Contact details
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              If you have any questions or requests about this Privacy Policy, or about how we handle your personal information, please get in touch by using our contact form at swiftfood.uk/contact.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              2. Information we collect about you
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '20px' }}>
              We collect information to help us run our services and deliver your orders smoothly. This includes:
            </p>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ff0088', fontSize: '1.3rem', marginBottom: '10px' }}>
                a) Information you give us directly
              </h3>
              <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
                <li>When you create an account or update it, you provide details like your name, email address and delivery address. You may also choose to give us your phone number, which helps us reach you if there's a problem with your delivery. If you order age-restricted items, we may ask for your date of birth to verify your age.</li>
                <li>When you place an order, we collect details of what you've ordered, any delivery notes you add, vouchers or discounts you use, and payment details (which are handled securely by our payment providers).</li>
                <li>When you contact us (for example, by using our contact form or sending us an email), we collect the information you share with us so we can respond to you and improve our service.</li>
                <li>If you leave a review, rating or feedback, we collect your comments and any details you include.</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ff0088', fontSize: '1.3rem', marginBottom: '10px' }}>
                b) Information we receive from other sources
              </h3>
              <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
                <li>We may get information about you from our Swift Partners (restaurants and food stalls) to help us fulfil your orders.</li>
                <li>We may also receive feedback about you from riders (for example, to help resolve delivery issues or complaints).</li>
                <li>If you use social media to log in or interact with us, we may receive your public profile info according to your settings.</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#ff0088', fontSize: '1.3rem', marginBottom: '10px' }}>
                c) Information we collect automatically
              </h3>
              <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
                <li>When you use our website or app, we collect information about how you use it, like your order history, pages viewed and how you interact with our features.</li>
                <li>We collect details about your device, like IP address, type, operating system, and sometimes your location (if you allow it) to help with deliveries.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              3. How we use your information
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We use the information we collect for a few main reasons — always with a valid legal basis. This includes:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
              <li>To create and manage your Swift Food account.</li>
              <li>To process your orders, arrange deliveries and handle payments and refunds.</li>
              <li>To contact you if we need to confirm details, update you about your order or solve any issues.</li>
              <li>To provide customer support and respond to your requests or complaints.</li>
              <li>To maintain, protect and improve our services, website and app, including understanding how customers use them and making sure everything works smoothly.</li>
              <li>To personalise your experience — for example, showing you food options or offers we think you'll like.</li>
              <li>To send you important service information, like updates to our terms or changes to our services.</li>
              <li>To keep our systems secure and protect against fraud or misuse of our services.</li>
              <li>To comply with our legal obligations and enforce our rights if needed.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              4. How we share your information
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We only share your personal information when it's needed to run our services, deliver your orders, or comply with the law. This includes sharing with:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
              <li><strong>Swift Partners:</strong> restaurants, food stalls and other approved partners who prepare your food or help with catering.</li>
              <li><strong>Riders:</strong> independent riders who collect and deliver your orders. They receive the information they need to complete the delivery — such as your delivery address, any instructions you've added, and your phone number if you've provided one, so they can contact you if needed.</li>
              <li><strong>Service providers:</strong> companies who help us run Swift Food — for example, payment processors, IT providers, customer support tools and fraud prevention services.</li>
              <li><strong>Authorities or regulators:</strong> if the law requires us to share information or to protect our rights or the rights of others.</li>
            </ul>
            <p style={{ fontSize: '1rem', color: 'white', marginTop: '15px' }}>
              If Swift Food ever merges with, sells or transfers part of our business, we may share your information with the buyer or new owner, but only as needed to keep providing our services.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              5. Marketing and advertising
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We may use your information to let you know about Swift Food offers, new restaurants, food stalls, or services we think you'll like. We might send you these updates by email, SMS, app notifications or other channels — but only if the law allows it or you have agreed to receive them.
            </p>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              You can change your marketing preferences or unsubscribe at any time. For example:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
              <li>By updating your settings in your account.</li>
              <li>By contacting us using our contact form.</li>
            </ul>
            <p style={{ fontSize: '1rem', color: 'white', marginTop: '15px' }}>
              Even if you opt out of marketing messages, we'll still send you important service updates — like order confirmations, changes to your account, or information about your deliveries.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              6. How long we keep your information
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We keep your personal information only as long as we need it for the purposes described in this policy, including to meet our legal and tax obligations, resolve disputes, and enforce our agreements.
            </p>
            <p style={{ fontSize: '1rem', color: 'white' }}>
              When we no longer need your information, we securely delete or anonymise it.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              7. How we protect your information
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We use technical and organisational measures to keep your personal information safe and secure. For example, we use secure systems, limit who can access your information, and regularly check our security practices.
            </p>
            <p style={{ fontSize: '1rem', color: 'white' }}>
              However, please remember that the internet is never completely secure. We encourage you to use a strong, unique password for your Swift Food account and keep it confidential.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              8. Your rights
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              You have certain rights over your personal information under data protection laws. These include the right to:
            </p>
            <ul style={{ paddingLeft: '20px', color: 'white', fontSize: '1rem' }}>
              <li><strong>Access:</strong> You can ask for a copy of the personal information we hold about you.</li>
              <li><strong>Correction:</strong> You can ask us to correct any inaccurate or incomplete information.</li>
              <li><strong>Deletion:</strong> You can ask us to delete your account or certain information if there's no good reason for us to keep it.</li>
              <li><strong>Restriction:</strong> You can ask us to temporarily stop using your information in certain situations.</li>
              <li><strong>Objection:</strong> You can object to us using your information if you think we don't have a valid reason.</li>
              <li><strong>Portability:</strong> You can ask us to give you your information in a structured, machine-readable format, or to transfer it to someone else.</li>
              <li><strong>Withdraw consent:</strong> If we rely on your consent to use your information, you can withdraw it at any time.</li>
            </ul>
            <p style={{ fontSize: '1rem', color: 'white', marginTop: '15px' }}>
              To exercise any of these rights, please contact us through our contact form. We may ask you to confirm your identity before we respond.
            </p>
            <p style={{ fontSize: '1rem', color: 'white', marginTop: '15px' }}>
              If you're not happy with how we handle your information, you can complain to the UK's Information Commissioner's Office (ICO). We'd appreciate the chance to resolve your concerns first, so please contact us if you have any questions.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              9. Changes to this policy
            </h2>
            <p style={{ fontSize: '1rem', color: 'white', marginBottom: '15px' }}>
              We may update this Privacy Policy from time to time. If we make important changes, we will let you know — for example, by showing a notice on our website or sending you an update if needed.
            </p>
            <p style={{ fontSize: '1rem', color: 'white' }}>
              We encourage you to check this page regularly to stay up to date.
            </p>
          </section>

          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              Contact Information
            </h2>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Company:</strong> Swift Food Services Ltd</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Address:</strong> 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Contact:</strong> swiftfood.uk/contact</p>
            </div>
          </section>
        </div>

        {/* Footer with gradient button */}
        
      </div>

      <style jsx>{`
        .appsection {
          background-image: linear-gradient(#ff0088, #FFC3E3);
          display: flex;
          justify-content: space-evenly;
          align-items: center;
          flex-wrap: wrap;
          padding: 50px;
        }

        .text_section {
          text-decoration: none;
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
        }

        .text_section h1 {
          color: #fff;
          font-size: 4rem;
          margin: 0;
        }

        .text_section p {
          color: #fff;
          font-size: 1rem;
          font-style: italic;
          margin: 10px 0;
        }

        .app_image {
          width: 250px;
          transition: transform 0.4s ease-in-out;
        }

        .app_image:hover {
          transform: scale(1.05) translateY(-3px);
        }

        .app_image img {
          max-width: 100%;
          height: auto;
          border-radius: 10px;
        }

        @media (max-width: 768px) {
          .appsection {
            flex-direction: column;
          }

          .text_section {
            font-size: 1.2rem;
          }

          .text_section h1 {
            font-size: 2.5rem;
          }

          .app_image {
            margin-top: 20px;
            width: 200px;
          }
        }

        @media (max-width: 480px) {
          .appsection {
            padding: 30px 20px;
          }

          .text_section h1 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;
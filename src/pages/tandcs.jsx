import React from 'react';

const TermsAndConditions = () => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Section with gradient background */}
      <div className="appsection">
        <div className="text_section">
          <h1>Terms & Conditions</h1>
          <p>Swift Food Services - Street Food & Restaurant Delivery</p>
        </div>
        
      </div>

      {/* Main Terms Content */}
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
          backgroundColor: 'white',
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

        {/* Terms Sections */}
        <div style={{ display: 'grid', gap: '30px' }}>
          
          <section>
            <h2 style={{ 
              color: '#ff0088', 
              fontSize: '2rem', 
              marginBottom: '15px',
              borderBottom: '2px solid #FFC3E3',
              paddingBottom: '10px'
            }}>
              1. Who we are
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              Swift Food Services Ltd ("we", "our", "us" or "Swift Food") provides an online platform for ordering street food and restaurant meals for delivery. You can place orders through our mobile app, and for large catering or corporate events, through our website. Registered address: 251 Grays Inn Rd, London WC1X 8QT, United Kingdom.
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
              2. How ordering works
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              You can browse, select and order food and drinks using our app or, for large catering orders, through our website. By placing an order, you agree to pay the total price displayed, including any delivery fees and other charges. Once you place an order, we'll send you an order confirmation. Your order becomes binding once the restaurant or food stall ("Swift Partner") accepts it.
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
              3. Prices and payment
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              All prices shown are final and include any applicable taxes or fees. We accept payment by debit or credit card (Visa, Mastercard, Amex) and online payment methods like Apple Pay. Payments are processed securely by our payment partners. We do not accept cash payments.
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
              4. Delivery and fulfilment
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              Your order will be prepared by the Swift Partner and delivered by one of our independent drivers ("Riders"). We aim to deliver within the estimated time, but can't guarantee exact times due to traffic or other factors beyond our control. You must ensure someone is available at the delivery address to receive the order.
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
              5. Cancellations and refunds
            </h2>
            <div style={{ fontSize: '1rem', color: '#333' }}>
              <p style={{ marginBottom: '15px' }}>
                <strong>Standard orders:</strong> You cannot cancel an order once the Swift Partner has started preparing the food. If you need to change or cancel an order, please contact us immediately — we'll try to help if preparation hasn't started yet.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>Corporate catering:</strong> For large catering or corporate orders, you must cancel at least 48 hours before the scheduled delivery time. Late cancellations may still be charged in full.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>Missing items:</strong> If anything is missing from your delivery, please tell us promptly. We may offer a replacement, credit or refund for the missing items.
              </p>
              <p style={{ marginBottom: '15px' }}>
                <strong>Food quality complaints:</strong> If you're not happy with the quality, please submit a complaint using our form. We'll review it according to our internal policies and may offer a credit or refund at our discretion.
              </p>
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
              6. Your responsibilities
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              Provide accurate delivery details and be reachable during delivery. If a Rider can't reach you or deliver safely, you may still be charged. Don't misuse our app or website, or try to interfere with our systems.
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
              7. Our responsibilities
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              We run the ordering and delivery service and coordinate with Swift Partners and Riders. We aren't responsible for delays or problems caused by events outside our control.
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
              8. Limits of liability
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              We aren't liable for losses or damages not directly caused by us or that we couldn't reasonably predict. This doesn't affect your statutory rights.
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
              9. Our rights
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              We may, at our discretion:
            </p>
            <ul style={{ paddingLeft: '20px', color: '#333', fontSize: '1rem' }}>
              <li>Refuse or cancel any order if we believe there's an error, fraud, or misuse.</li>
              <li>Suspend or terminate your account if you breach these terms or misuse our services.</li>
              <li>Remove or edit any content you submit (like reviews) if it breaks the law or our policies.</li>
              <li>Make changes to our services, menu options, delivery areas or partners at any time.</li>
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
              10. Changes to these terms
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              We may update these Terms & Conditions from time to time. If we make significant changes, we'll let you know — for example, by updating the date here, by email, or via an in-app message.
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
              11. Governing law
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              These terms are governed by the laws of England and Wales. Any disputes will be handled by the courts of England and Wales.
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
              12. Contact us
            </h2>
            <p style={{ fontSize: '1rem', color: '#333', marginBottom: '15px' }}>
              If you have any questions about these terms, please contact us through the contact form on our website.
            </p>
            <div style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Company:</strong> Swift Food Services Ltd</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Address:</strong> 251 Grays Inn Rd, London WC1X 8QT, United Kingdom</p>
              <p style={{ margin: '5px 0', color: '#333' }}><strong>Contact:</strong> Via website contact form</p>
            </div>
          </section>
        </div>
      </div>

    </div>
  );
};

export default TermsAndConditions;
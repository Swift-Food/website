import './catering.css'

function Catering() {
    return (
        <div className='catering-page'>
            {/* Hero Section */}
            <div className='catering-hero'>
                <div className='hero-content'>
                    <h1>Catering Services</h1>
                    <p className='hero-subtitle'>Feeding large groups made simple</p>
                    <p className='hero-description'>
                        From corporate meetings to special celebrations, Swift Food delivers 
                        delicious meals from your favorite local restaurants to feed any crowd.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='catering-content'>
                
                {/* How It Works Section */}
                <section className='how-it-works'>
                    <h2>How Our Catering Works</h2>
                    <div className='steps-container'>
                        <div className='step'>
                            <div className='step-number'>1</div>
                            <h3>Plan Ahead</h3>
                            <p>Contact us at least 24 hours in advance for orders of 10+ people. For larger events (50+ people), we recommend 48-72 hours notice.</p>
                        </div>
                        <div className='step'>
                            <div className='step-number'>2</div>
                            <h3>Choose Your Restaurant</h3>
                            <p>Select from our network of partner restaurants. We'll work with them to prepare your large order with care and precision.</p>
                        </div>
                        <div className='step'>
                            <div className='step-number'>3</div>
                            <h3>Coordinate Delivery</h3>
                            <p>We'll arrange delivery at your specified time and location, ensuring your food arrives fresh and ready to serve.</p>
                        </div>
                    </div>
                </section>

                {/* App Launch Section */}
                <section className='app-launch'>
                    <div className='app-content'>
                        <div className='app-text'>
                            <h2>Swift Food App Coming Soon!</h2>
                            <p>
                                Our mobile app is launching soon, making catering orders even easier! 
                                Through the app, you'll be able to:
                            </p>
                            <ul className='app-features'>
                                <li>Browse catering menus from all partner restaurants</li>
                                <li>Schedule orders weeks in advance</li>
                                <li>Track your order in real-time</li>
                                <li>Save favorite catering combinations</li>
                                <li>Manage multiple delivery locations</li>
                                <li>Get instant quotes for large orders</li>
                            </ul>
                            <div className='notify-section'>
                                <p><strong>Be the first to know when we launch!</strong></p>
                                <div className='insta'>
                                    <a href='https://www.instagram.com/swiftfood_uk/'
                                    target='_blank'>
                                        <img src='/swift_eats/images/instagram.png' alt='Image of insta' width={50} height={50}></img>
                
                                    </a>
                                    <p>Swift Food UK</p>
                                </div>
                            </div>
                        </div>
                        <div className='app-image'>
                            <div className='phone-mockup'>
                                <div className='phone-screen'>
                                    <div className='app-preview'>
                                        <h4>Swift Food</h4>
                                        <p>Catering Made Simple</p>
                                        <div className='preview-elements'>
                                            <div className='preview-item'>🍕 Order for 50+ people</div>
                                            <div className='preview-item'>📅 Schedule in advance</div>
                                            <div className='preview-item'>🚚 Track delivery</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Order Sizes Section */}
                <section className='order-sizes'>
                    <h2>Perfect for Any Event Size</h2>
                    <div className='size-cards'>
                        <div className='size-card'>
                            <h3>Small Groups</h3>
                            <div className='people-count'>10-25 People</div>
                            <ul>
                                <li>Team meetings</li>
                                <li>Small office lunches</li>
                                <li>Study groups</li>
                                <li>Family gatherings</li>
                            </ul>
                            <div className='notice-time'>24 hours notice</div>
                        </div>
                        <div className='size-card'>
                            <h3>Medium Events</h3>
                            <div className='people-count'>25-75 People</div>
                            <ul>
                                <li>Corporate events</li>
                                <li>Birthday parties</li>
                                <li>Workshop lunches</li>
                                <li>Training sessions</li>
                            </ul>
                            <div className='notice-time'>48 hours notice</div>
                        </div>
                        <div className='size-card'>
                            <h3>Large Events</h3>
                            <div className='people-count'>75+ People</div>
                            <ul>
                                <li>Conferences</li>
                                <li>Wedding receptions</li>
                                <li>Company parties</li>
                                <li>Festivals</li>
                            </ul>
                            <div className='notice-time'>72+ hours notice</div>
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section className='benefits'>
                    <h2>Why Choose Swift Food Catering?</h2>
                    <div className='benefits-grid'>
                        <div className='benefit'>
                            <div className='benefit-icon'>🍽️</div>
                            <h3>Variety of Cuisines</h3>
                            <p>Choose from dozens of local restaurants offering everything from Italian to Thai, ensuring there's something for everyone.</p>
                        </div>
                        <div className='benefit'>
                            <div className='benefit-icon'>⏰</div>
                            <h3>Reliable Timing</h3>
                            <p>We coordinate with restaurants to ensure your food is prepared fresh and delivered exactly when you need it.</p>
                        </div>
                        <div className='benefit'>
                            <div className='benefit-icon'>💰</div>
                            <h3>Competitive Pricing</h3>
                            <p>No hidden fees or excessive markups. You pay restaurant prices plus our standard delivery fee.</p>
                        </div>
                        <div className='benefit'>
                            <div className='benefit-icon'>🚚</div>
                            <h3>Professional Service</h3>
                            <p>Our experienced drivers handle large orders with care, including setup assistance when needed.</p>
                        </div>
                        <div className='benefit'>
                            <div className='benefit-icon'>📱</div>
                            <h3>Easy Ordering</h3>
                            <p>Simple online ordering process, with our upcoming app making it even more convenient.</p>
                        </div>
                        <div className='benefit'>
                            <div className='benefit-icon'>✅</div>
                            <h3>Quality Guaranteed</h3>
                            <p>We work only with trusted restaurant partners who maintain high food quality and safety standards.</p>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                {/* <section className='cta-section'>
                    <div className='cta-content'>
                        <h2>Ready to Order Catering?</h2>
                        <p>Contact us today to discuss your catering needs. Our team will help you plan the perfect meal for your event.</p>
                        <div className='cta-buttons'>
                            <button className='cta-primary'>Get Catering Quote</button>
                            <button className='cta-secondary'>View Restaurant Partners</button>
                        </div>
                        <div className='contact-info'>
                            <p>For immediate assistance, call us at <strong>(555) 123-FOOD</strong></p>
                            <p>Or email us at <strong>catering@swiftfood.com</strong></p>
                        </div>
                    </div>
                </section> */}

            </div>
        </div>
    )
}

export default Catering
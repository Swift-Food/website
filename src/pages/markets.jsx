import './markets.css'

function Markets() {
    return (
        <div className='markets-page'>
            {/* Hero Section */}
            <div className='markets-hero'>
                <div className='hero-content'>
                    <h1>Markets We Serve</h1>
                    <p className='hero-subtitle'>Bringing delicious food to vibrant communities</p>
                    <p className='hero-description'>
                        Swift Food is proud to serve some of London's most dynamic markets and neighborhoods, 
                        connecting local restaurants with food lovers across the city.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className='markets-content'>
                
                {/* Current Markets Section */}
                <section className='current-markets'>
                    <h2>Currently Serving</h2>
                    <p className='section-description'>
                        We're already delivering to these fantastic markets, bringing you the best local cuisine right to your location.
                    </p>
                    
                    <div className='markets-grid'>
                        {/* Tottenham Court Road Market */}
                        <div className='market-card featured'>
                            <div className='market-image'>
                                <div className='image-placeholder'>
                                    <span className='market-icon'>🏢</span>
                                </div>
                            </div>
                            <div className='market-info'>
                                <h3>Tottenham Court Road Market</h3>
                                <div className='market-location'>📍 Tottenham Court Road, London W1</div>
                                <p className='market-description'>
                                    Located in the heart of London's West End, this bustling area is home to countless 
                                    offices, shops, and entertainment venues. We deliver to businesses, offices, and 
                                    residential areas throughout this vibrant district.
                                </p>
                                <div className='market-features'>
                                    <div className='feature'>🍕 10+ Restaurant Partners</div>
                                    <div className='feature'>⏰ Peak Hours: 11AM - 3PM, 5PM - 9PM</div>
                                    <div className='feature'>🚚 Average Delivery: 15-20 minutes</div>
                                </div>
                                <div className='market-status active'>
                                    <span className='status-dot'></span>
                                    Active & Delivering
                                </div>
                            </div>
                        </div>

                        {/* Goodge Street Market */}
                        <div className='market-card featured'>
                            <div className='market-image'>
                                <div className='image-placeholder'>
                                    <span className='market-icon'>🏬</span>
                                </div>
                            </div>
                            <div className='market-info'>
                                <h3>Goodge Street Market</h3>
                                <div className='market-location'>📍 Goodge Street, London W1</div>
                                <p className='market-description'>
                                    A charming area near University College London, filled with students, professionals, 
                                    and local residents. This market area offers a perfect blend of academic energy and 
                                    London charm, with diverse dining options for every taste.
                                </p>
                                <div className='market-features'>
                                    <div className='feature'>🍜 10+ Restaurant Partners</div>
                                    <div className='feature'>⏰ Peak Hours: 12PM - 2PM, 6PM - 8PM</div>
                                    <div className='feature'>🚚 Average Delivery: 15-20 minutes</div>
                                </div>
                                <div className='market-status active'>
                                    <span className='status-dot'></span>
                                    Active & Delivering
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Service Areas Info */}
                <section className='service-info'>
                    <div className='info-grid'>
                        <div className='info-card'>
                            <div className='info-icon'>🎯</div>
                            <h3>Targeted Service</h3>
                            <p>We focus on specific markets to ensure the best delivery times and restaurant quality in each area.</p>
                        </div>
                        <div className='info-card'>
                            <div className='info-icon'>🤝</div>
                            <h3>Local Partnerships</h3>
                            <p>We work closely with local restaurants to bring you authentic flavors from each neighborhood.</p>
                        </div>
                        <div className='info-card'>
                            <div className='info-icon'>⚡</div>
                            <h3>Fast Delivery</h3>
                            <p>By concentrating on specific areas, we can guarantee faster delivery times and fresher food.</p>
                        </div>
                    </div>
                </section>

                {/* Coming Soon Section */}
                {/* <section className='coming-soon'>
                    <h2>Expanding Soon</h2>
                    <p className='section-description'>
                        We're constantly growing! Here are some of the exciting new markets we'll be serving in the coming months.
                    </p>
                    
                    <div className='expansion-grid'>
                        <div className='expansion-card'>
                            <div className='expansion-icon'>🏙️</div>
                            <h3>King's Cross</h3>
                            <p>The bustling transport hub and business district</p>
                            <div className='coming-status'>Coming Q3 2025</div>
                        </div>

                        <div className='expansion-card'>
                            <div className='expansion-icon'>🎭</div>
                            <h3>Covent Garden</h3>
                            <p>Historic market area and entertainment district</p>
                            <div className='coming-status'>Coming Q3 2025</div>
                        </div>

                        <div className='expansion-card'>
                            <div className='expansion-icon'>🏛️</div>
                            <h3>Russell Square</h3>
                            <p>Academic area near the British Museum</p>
                            <div className='coming-status'>Coming Q4 2025</div>
                        </div>

                        <div className='expansion-card'>
                            <div className='expansion-icon'>🛍️</div>
                            <h3>Oxford Street</h3>
                            <p>London's premier shopping destination</p>
                            <div className='coming-status'>Coming Q4 2025</div>
                        </div>

                        <div className='expansion-card'>
                            <div className='expansion-icon'>🏢</div>
                            <h3>Canary Wharf</h3>
                            <p>Major business and financial district</p>
                            <div className='coming-status'>Coming 2026</div>
                        </div>

                        <div className='expansion-card'>
                            <div className='expansion-icon'>🌉</div>
                            <h3>London Bridge</h3>
                            <p>Historic area with modern developments</p>
                            <div className='coming-status'>Coming 2026</div>
                        </div>
                    </div>

                    <div className='expansion-note'>
                        <h3>Want Swift Food in Your Area?</h3>
                        <p>
                            Don't see your neighborhood listed? Let us know where you'd like to see Swift Food next! 
                            We prioritize expansion based on customer demand and local restaurant partnerships.
                        </p>
                        <button className='request-btn'>Request Your Area</button>
                    </div>
                </section> */}

                {/* Coverage Stats */}
                {/* <section className='coverage-stats'>
                    <div className='stats-container'>
                        <div className='stat'>
                            <div className='stat-number'>2</div>
                            <div className='stat-label'>Markets Currently Serving</div>
                        </div>
                        <div className='stat'>
                            <div className='stat-number'>85+</div>
                            <div className='stat-label'>Restaurant Partners</div>
                        </div>
                        <div className='stat'>
                            <div className='stat-number'>6</div>
                            <div className='stat-label'>New Markets Coming Soon</div>
                        </div>
                        <div className='stat'>
                            <div className='stat-number'>30</div>
                            <div className='stat-label'>Average Delivery Time (minutes)</div>
                        </div>
                    </div>
                </section> */}

                {/* CTA Section */}
                {/* <section className='market-cta'>
                    <div className='cta-content'>
                        <h2>Order From Your Local Market</h2>
                        <p>Discover amazing restaurants in your area and get delicious food delivered fast.</p>
                        <div className='cta-buttons'>
                            <button className='cta-primary'>Browse Restaurants</button>
                            <button className='cta-secondary'>Download Our App</button>
                        </div>
                    </div>
                </section> */}

            </div>
        </div>
    )
}

export default Markets
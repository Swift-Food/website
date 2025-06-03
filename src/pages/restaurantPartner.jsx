import './restaurantPartner.css'

function RestaurantPartner() {
    return (
        <div className='restaurant-partner'>
            <div className='partner-header'>
                <h1>Partner With Swift Food</h1>
                <p>Grow your restaurant business with our delivery platform</p>
                <p>Join thousands of restaurants already serving customers through Swift Food.</p>
            </div>

            <form className='partner-form' name="restaurant-partner" method="POST" netlify>
                <input type="hidden" name="form-name" value="restaurant-partner" />
                
                {/* Restaurant Information */}
                <div className='form-section'>
                    <h3>Restaurant Information</h3>
                    <input type="text" name='restaurant_name' placeholder='Restaurant Name' required/>
                    
                    <div className='business-row'>
                        <select name='cuisine_type' required>
                            <option value="">Primary Cuisine Type</option>
                            <option value="american">American</option>
                            <option value="italian">Italian</option>
                            <option value="chinese">Chinese</option>
                            <option value="indian">Indian</option>
                            <option value="mexican">Mexican</option>
                            <option value="japanese">Japanese</option>
                            <option value="thai">Thai</option>
                            <option value="mediterranean">Mediterranean</option>
                            <option value="fast-food">Fast Food</option>
                            <option value="pizza">Pizza</option>
                            <option value="healthy">Healthy/Organic</option>
                            <option value="desserts">Desserts</option>
                            <option value="other">Other</option>
                        </select>
                        
                        <select name='restaurant_type' required>
                            <option value="">Restaurant Type</option>
                            <option value="fast-casual">Fast Casual</option>
                            <option value="fine-dining">Fine Dining</option>
                            <option value="cafe">Cafe</option>
                            <option value="bakery">Bakery</option>
                            <option value="food-truck">Food Truck</option>
                            <option value="chain">Chain Restaurant</option>
                            <option value="independent">Independent</option>
                        </select>
                    </div>

                    <div className='address-section'>
                        <input type="text" name='street_address' placeholder='Restaurant Street Address' required/>
                        <div className='address-row'>
                            <input type="text" name='city' placeholder='City' required/>
                            <input type="text" name='postcode' placeholder='Postcode' required/>
                        </div>
                    </div>

                    <input type="tel" name='restaurant_phone' placeholder='Restaurant Phone Number' required/>
                    <input type="url" name='website' placeholder='Restaurant Website (optional)'/>
                </div>

                {/* Contact Person */}
                <div className='form-section'>
                    <h3>Primary Contact Information</h3>
                    <div className='contact-row'>
                        <input type="text" name='contact_first_name' placeholder='First Name' required/>
                        <input type="text" name='contact_last_name' placeholder='Last Name' required/>
                    </div>

                    <input type="text" name='job_title' placeholder='Job Title/Position' required/>
                    <input type="email" name='contact_email' placeholder='Contact Email' required/>
                    <input type="tel" name='contact_phone' placeholder='Contact Phone Number' required/>
                </div>

                {/* Business Details */}
                <div className='form-section'>
                    <h3>Business Details</h3>
                    <div className='business-details-row'>
                        <input type="text" name='business_registration' placeholder='Business Registration Number' required/>
                        <input type="text" name='vat_number' placeholder='VAT Number (if applicable)'/>
                    </div>

                    <div className='business-details-row'>
                        <select name='years_operating' required>
                            <option value="">Years in Operation</option>
                            <option value="less-than-1">Less than 1 year</option>
                            <option value="1-2">1-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>

                        <select name='seating_capacity' required>
                            <option value="">Seating Capacity</option>
                            <option value="0-20">0-20 seats</option>
                            <option value="21-50">21-50 seats</option>
                            <option value="51-100">51-100 seats</option>
                            <option value="100+">100+ seats</option>
                            <option value="takeaway-only">Takeaway Only</option>
                        </select>
                    </div>

                    <div className='operating-hours'>
                        <label>Typical Operating Hours:</label>
                        <div className='hours-row'>
                            <select name='opening_time' required>
                                <option value="">Opening Time</option>
                                <option value="6:00">6:00 AM</option>
                                <option value="7:00">7:00 AM</option>
                                <option value="8:00">8:00 AM</option>
                                <option value="9:00">9:00 AM</option>
                                <option value="10:00">10:00 AM</option>
                                <option value="11:00">11:00 AM</option>
                                <option value="12:00">12:00 PM</option>
                            </select>
                            <select name='closing_time' required>
                                <option value="">Closing Time</option>
                                <option value="20:00">8:00 PM</option>
                                <option value="21:00">9:00 PM</option>
                                <option value="22:00">10:00 PM</option>
                                <option value="23:00">11:00 PM</option>
                                <option value="00:00">12:00 AM</option>
                                <option value="01:00">1:00 AM</option>
                                <option value="02:00">2:00 AM</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Delivery Experience */}
                <div className='form-section'>
                    <h3>Delivery Experience</h3>
                    <div className='delivery-experience'>
                        <label className='radio-label'>
                            <input type="radio" name='delivery_experience' value='yes-current' required/>
                            Yes, we currently offer delivery through other platforms
                        </label>
                        <label className='radio-label'>
                            <input type="radio" name='delivery_experience' value='yes-past' required/>
                            Yes, we have offered delivery in the past
                        </label>
                        <label className='radio-label'>
                            <input type="radio" name='delivery_experience' value='no-interested' required/>
                            No, but we're interested in starting delivery
                        </label>
                        <label className='radio-label'>
                            <input type="radio" name='delivery_experience' value='no-first-time' required/>
                            No, this would be our first delivery platform
                        </label>
                    </div>

                    <div className='volume-row'>
                        <select name='expected_daily_orders'>
                            <option value="">Expected Daily Orders</option>
                            <option value="1-10">1-10 orders</option>
                            <option value="11-25">11-25 orders</option>
                            <option value="26-50">26-50 orders</option>
                            <option value="51-100">51-100 orders</option>
                            <option value="100+">100+ orders</option>
                        </select>

                        <select name='average_order_value'>
                            <option value="">Average Order Value</option>
                            <option value="under-15">Under £15</option>
                            <option value="15-25">£15-£25</option>
                            <option value="25-40">£25-£40</option>
                            <option value="40-60">£40-£60</option>
                            <option value="60+">£60+</option>
                        </select>
                    </div>
                </div>

                {/* Additional Information */}
                <div className='form-section'>
                    <h3>Additional Information</h3>
                    <div className='message-box'>
                        <textarea name="special_requirements" placeholder="Any special requirements, dietary options offered, or additional information you'd like to share..." rows="4"></textarea>
                    </div>

                    <div className='checkboxes-section'>
                        <h4>Services Offered (select all that apply):</h4>
                        <div className='services-checkboxes'>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='vegetarian'/>
                                Vegetarian Options
                            </label>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='vegan'/>
                                Vegan Options
                            </label>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='gluten-free'/>
                                Gluten-Free Options
                            </label>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='halal'/>
                                Halal Food
                            </label>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='alcohol'/>
                                Alcohol Service
                            </label>
                            <label className='checkbox-label'>
                                <input type="checkbox" name='services' value='catering'/>
                                Catering Services
                            </label>
                        </div>
                    </div>

                    <div className='agreements'>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='food_hygiene' required/>
                            I confirm our restaurant has a valid food hygiene rating
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='business_insurance' required/>
                            I confirm we have valid business and public liability insurance
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='terms_agreement' required/>
                            I agree to Swift Food's partner terms and conditions
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='commission_agreement' required/>
                            I understand and agree to the commission structure
                        </label>
                    </div>
                </div>

                <button type="submit" className='submit-btn'>Submit Partnership Application</button>
            </form>
        </div>
    )
}

export default RestaurantPartner
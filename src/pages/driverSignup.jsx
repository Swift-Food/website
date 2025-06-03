import './driverSignup.css'

function DriverSignup() {
    return (
        <div className='driver-signup'>
            <div className='driver-header'>
                <h1>Join Our Driver Team</h1>
                <p>Earn money on your schedule delivering delicious food to customers</p>
                <p>Fill out the form below to get started with your driver application.</p>
            </div>

            <form className='driver-form' name="driver-signup" method="POST" netlify>
                <input type="hidden" name="form-name" value="driver-signup" />
                
                {/* Personal Information */}
                <div className='form-section'>
                    <h3>Personal Information</h3>
                    <div className='names'>
                        <input type="text" name='first_name' placeholder='First Name' required/>
                        <input type="text" name='last_name' placeholder='Last Name' required/>
                    </div>

                    <input type="email" name='email' placeholder='Email Address' required/>
                    <input type="tel" name='phone' placeholder='Phone Number' required/>
                    
                    <div className='address-row'>
                        <input type="text" name='address' placeholder='Street Address' required/>
                        <input type="text" name='city' placeholder='City' required/>
                    </div>
                    
                    <div className='address-row'>
                        <input type="text" name='postcode' placeholder='Postcode' required/>
                        <input type="date" name='date_of_birth' required/>
                    </div>
                </div>

                {/* Driver Information */}
                <div className='form-section'>
                    <h3>Driver Information</h3>
                    <div className='license-row'>
                        <input type="text" name='license_number' placeholder='Driving License Number' required/>
                        <select name='license_years' required>
                            <option value="">Years of driving experience</option>
                            <option value="1-2">1-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                    </div>

                    <div className='vehicle-row'>
                        <select name='vehicle_type' required>
                            <option value="">Vehicle Type</option>
                            <option value="car">Car</option>
                            <option value="motorcycle">Motorcycle</option>
                            <option value="bicycle">Bicycle</option>
                            <option value="scooter">Scooter</option>
                        </select>
                        <input type="text" name='vehicle_make' placeholder='Vehicle Make (e.g., Honda, Toyota)' required/>
                    </div>

                    <input type="text" name='vehicle_model' placeholder='Vehicle Model' required/>
                    <input type="text" name='vehicle_year' placeholder='Vehicle Year' required/>
                    <input type="text" name='registration_number' placeholder='Vehicle Registration Number' required/>
                </div>

                {/* Availability */}
                <div className='form-section'>
                    <h3>Availability</h3>
                    <div className='availability-checkboxes'>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='availability' value='weekday_mornings'/>
                            Weekday Mornings (7AM - 12PM)
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='availability' value='weekday_afternoons'/>
                            Weekday Afternoons (12PM - 6PM)
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='availability' value='weekday_evenings'/>
                            Weekday Evenings (6PM - 11PM)
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='availability' value='weekend_days'/>
                            Weekend Days (7AM - 6PM)
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='availability' value='weekend_evenings'/>
                            Weekend Evenings (6PM - 11PM)
                        </label>
                    </div>

                    <div className='hours-row'>
                        <select name='hours_per_week' required>
                            <option value="">Expected hours per week</option>
                            <option value="5-10">5-10 hours</option>
                            <option value="10-20">10-20 hours</option>
                            <option value="20-30">20-30 hours</option>
                            <option value="30-40">30-40 hours</option>
                            <option value="40+">40+ hours</option>
                        </select>
                    </div>
                </div>

                {/* Additional Information */}
                <div className='form-section'>
                    <h3>Additional Information</h3>
                    <div className='message-box'>
                        <textarea name="additional_info" placeholder="Tell us why you want to become a driver with Swift Food and any relevant experience..." rows="4"></textarea>
                    </div>

                    <div className='checkbox-agreements'>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='has_insurance' required/>
                            I confirm that I have valid vehicle insurance
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='background_check' required/>
                            I consent to a background check
                        </label>
                        <label className='checkbox-label'>
                            <input type="checkbox" name='terms_agreement' required/>
                            I agree to the terms and conditions
                        </label>
                    </div>
                </div>

                <button type="submit" className='submit-btn'>Submit Application</button>
            </form>
        </div>
    )
}

export default DriverSignup
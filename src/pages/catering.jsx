import React, { useState } from 'react';

function Contact() {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        message: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('');

        try {
            // Netlify form submission
            const response = await fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    "form-name": "contact",
                    ...formData
                }).toString()
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    message: ''
                });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        }

        setIsSubmitting(false);
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            {/* Header Section with gradient background */}
            <div className="contact-header">
                <div className="text_section">
                    <h1>Contact Us</h1>
                    <p>Need help with something?</p>
                    <p>Check out our FAQs or fill out the contact form below with your questions.</p>
                </div>
                <div className="app_image">
                    <img 
                        src="https://via.placeholder.com/250x300/ffffff/ff0088?text=Contact+Us" 
                        alt="Contact Swift Food"
                    />
                </div>
            </div>

            {/* Contact Form Section */}
            <div className="contact-form-container">
                {/* Hidden form for Netlify */}
                <form name="contact" netlify="true" netlify-honeypot="bot-field" hidden>
                    <input type="text" name="first_name" />
                    <input type="text" name="last_name" />
                    <input type="email" name="email" />
                    <textarea name="message"></textarea>
                </form>

                <div className='contact-form'>
                    {submitStatus === 'success' && (
                        <div className="success-message">
                            <p>✅ Thank you for your message! We'll get back to you soon.</p>
                        </div>
                    )}
                    
                    {submitStatus === 'error' && (
                        <div className="error-message">
                            <p>❌ Sorry, there was an error sending your message. Please try again.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <input type="hidden" name="form-name" value="contact" />
                        
                        <div className='names'>
                            <input 
                                type="text" 
                                name='first_name' 
                                placeholder='First Name' 
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                            <input 
                                type="text" 
                                name='last_name' 
                                placeholder='Last Name' 
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <input 
                            type="email" 
                            name='email' 
                            placeholder='Email' 
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />

                        <div className='message-box'>
                            <textarea 
                                name="message" 
                                placeholder="Message" 
                                rows="7" 
                                value={formData.message}
                                onChange={handleChange}
                                required
                                disabled={isSubmitting}
                            ></textarea>
                        </div>

                        <button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Sending...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>

            <style jsx>{`
                .contact-header {
                    background-image: linear-gradient(#ff0088, #FFC3E3);
                    display: flex;
                    justify-content: space-evenly;
                    align-items: center;
                    flex-wrap: wrap;
                    padding: 50px;
                    min-height: 400px;
                }

                .text_section {
                    text-decoration: none;
                    font-size: 1.5rem;
                    font-weight: bold;
                    text-align: center;
                    margin-bottom: 20px;
                    max-width: 500px;
                }

                .text_section h1 {
                    color: #fff;
                    font-size: 4rem;
                    margin: 0 0 20px 0;
                }

                .text_section p {
                    color: #fff;
                    font-size: 1.2rem;
                    font-style: italic;
                    margin: 10px 0;
                    line-height: 1.5;
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

                .contact-form-container {
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 40px 20px;
                }

                .contact-form {
                    background: #ffffff;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 10px 30px rgba(255, 0, 136, 0.1);
                    border: 2px solid #FFC3E3;
                }

                .names {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .names input {
                    flex: 1;
                }

                .contact-form input,
                .contact-form textarea {
                    width: 100%;
                    padding: 15px;
                    margin-bottom: 20px;
                    border: 2px solid #FFC3E3;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-family: inherit;
                    transition: border-color 0.3s ease, box-shadow 0.3s ease;
                    box-sizing: border-box;
                }

                .contact-form input:focus,
                .contact-form textarea:focus {
                    outline: none;
                    border-color: #ff0088;
                    box-shadow: 0 0 0 3px rgba(255, 0, 136, 0.1);
                }

                .contact-form input::placeholder,
                .contact-form textarea::placeholder {
                    color: #999;
                    font-style: italic;
                }

                .message-box {
                    margin-bottom: 20px;
                }

                .contact-form textarea {
                    resize: vertical;
                    min-height: 120px;
                }

                .contact-form button {
                    background: linear-gradient(#ff0088, #FFC3E3);
                    color: white;
                    border: none;
                    padding: 15px 40px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    width: 100%;
                }

                .contact-form button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 0, 136, 0.3);
                }

                .contact-form button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                    transform: none;
                }

                .success-message {
                    background: #d4edda;
                    color: #155724;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #c3e6cb;
                }

                .error-message {
                    background: #f8d7da;
                    color: #721c24;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid #f5c6cb;
                }

                .success-message p,
                .error-message p {
                    margin: 0;
                    font-weight: bold;
                }

                @media (max-width: 768px) {
                    .contact-header {
                        flex-direction: column;
                        padding: 30px 20px;
                    }

                    .text_section h1 {
                        font-size: 2.5rem;
                    }

                    .text_section p {
                        font-size: 1rem;
                    }

                    .app_image {
                        margin-top: 20px;
                        width: 200px;
                    }

                    .names {
                        flex-direction: column;
                        gap: 0;
                    }

                    .contact-form {
                        padding: 20px;
                        margin: 0 10px;
                    }
                }

                @media (max-width: 480px) {
                    .contact-header {
                        padding: 20px 15px;
                    }

                    .text_section h1 {
                        font-size: 2rem;
                    }

                    .contact-form-container {
                        margin: 30px auto;
                        padding: 20px 10px;
                    }
                }
            `}</style>
        </div>
    );
}

export default Contact;
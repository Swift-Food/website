import './contact.css'

function Contact() {
    return (
        <div className='contact'>
            <h1>Contact Us</h1>
            <p>Need help with something?</p>
            <p>Check out our FAQs or fill out the contact form below with your questions.</p>
            <form className='contact-form' action="https://formspree.io/f/(PUT FORM ID HERE!!!!)" method="POST">
                <div className='names'>
                    <input type="text" name='first_name' placeholder='First Name' required/>
                    <input type="text" name='last_name' placeholder='Last Name' required/>
                </div>

                <input type="text" name='email' placeholder='Email' required/>

                <div className='message-box'>
                    <textarea name="message" placeholder="Message" rows="7" required></textarea>
                </div>

                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Contact
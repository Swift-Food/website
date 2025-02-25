import './footer.css'
import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <p>Download our App</p>
                    <div className='store_images'>
                        <div className='apple'>
                            <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                               target='_blank'>
                                <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                            </a>
                        </div>
                        <div className='google_play'>
                            <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                               target='_blank'>
                                <img src='/swift_eats/images/googleplay_img.png' alt='Image of google play'></img>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-section links">
                    <ul>
                        <li><Link to={"/swift_eats"}>About Us</Link></li>
                        <li><Link to={"/about-us"}>Catering</Link></li>
                        <li><Link to={"/contact"}>Contact</Link></li>
                        <li><Link to={"/FAQ"}>FAQs</Link></li>
                        <li><Link to={"/about-us"}>Markets</Link></li>
                        <li><Link to={"/contact"}>Sign Up</Link></li>
                        <li><Link to={"/swift_eats"}>Partner With Us</Link></li>
                        <li><Link to={"/about-us"}>Become a Rider</Link></li>
                        <li><Link to={"/contact"}>Terms and Conditions</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-section-social">
                <div className='tiktok'>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                       target='_blank'>
                        <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                    </a>
                </div>
                <div className='insta'>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                       target='_blank'>
                        <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                    </a>
                </div>
                <div className='youtube'>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                       target='_blank'>
                        <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                    </a>
                </div>
                <div className='rednote'>
                    <a href='https://play.google.com/store/apps/details?id=com.whatsapp&pcampaignid=web_share'
                       target='_blank'>
                        <img src='/swift_eats/images/appstore_img.png' alt='Image of apple'></img>
                    </a>
                </div>

            </div>
            <div className="footer-bottom">
                <p>Stratus JY Tech Limited &copy; {new Date().getFullYear()}. All rights reserved.</p>
            </div>

        </footer>
    )
}

export default Footer;

import './footer.css'
import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                {/* <div className="footer-section about">
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
                </div> */}
                <div className="footer-section links">
                    <ul>
                        <li><Link to={"/about-us"}>About Us</Link></li>
                        <li><Link to={"/catering"}>Catering</Link></li>
                        <li><Link to={"/contact"}>Contact</Link></li>
                        <li><Link to={"/FAQ"}>FAQs</Link></li>
                        <li><Link to={"/markets"}>Markets</Link></li>
                        <li><Link to={"/restaurant-partner"}>Partner With Us</Link></li>
                        <li><Link to={"/driver-signup"}>Become a Rider</Link></li>
                        <li><Link to={"/tandcs"}>Terms and Conditions</Link></li>
                        <li><Link to={"/privacypolicy"}>Privacy Policy</Link></li>
                    </ul>
                </div>
            </div>

            <div className="footer-section-social">
                <div className='tiktok'>
                    <a href='https://www.tiktok.com/@swiftfood_uk'
                       target='_blank'>
                        <img src='/swift_eats/images/tiktok.png' alt='Image of tiktok' width={50} height={50}></img>
                    </a>
                </div>
                <div className='insta'>
                    <a href='https://www.instagram.com/swiftfood_uk/'
                       target='_blank'>
                        <img src='/swift_eats/images/instagram.png' alt='Image of insta' width={50} height={50}></img>
                    </a>
                </div>
                <div className='youtube'>
                    <a href='https://www.youtube.com/@Swiftfood_uk'
                       target='_blank'>
                        <img src='/swift_eats/images/youtube.png' alt='Image of youtube' width={50} height={50}></img>
                    </a>
                </div>
                <div className='rednote'>
                    <a href='https://www.xiaohongshu.com/user/profile/5fcaee6e0000000001001f7c'
                       target='_blank'>
                        <img src='/swift_eats/images/Xiao-Hong Shu-128.png' alt='Image of rednote' width={50} height={50}></img>
                    </a>
                </div>

            </div>
            <div className="footer-bottom">
                <p>SWIFT FOOD SERVICES LTD. {new Date().getFullYear()}. All rights reserved.</p>
            </div>

        </footer>
    )
}

export default Footer;

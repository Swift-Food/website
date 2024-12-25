import './footer.css'
import {Link} from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section about">
                    <h2>SwiftEats</h2>
                    <p>(enter company slogan here)</p>
                </div>
                <div className="footer-section links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><Link to={"/swift_eats"}>Home</Link></li>
                        <li><Link to={"/about-us"}>About Us</Link></li>
                        <li><Link to={"/contact"}>Contact</Link></li>
                    </ul>
                </div>
                <div className="footer-section social">
                    <h3>Follow Us</h3>
                    <ul>
                    <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
                        <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
                        <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>Stratus JY Tech Limited &copy; {new Date().getFullYear()}. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer;

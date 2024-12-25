import './header.css'
import { Link } from 'react-router-dom';
import { useState } from 'react';

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="/swift_eats/images/swift_logo.png" alt="Company Logo" />
                <Link to={"/swift_eats"}>Swift</Link>
            </div>
            <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                <li><Link to={"/swift_eats"}>Home</Link></li>
                <li><Link to={"/about-us"}>About Us</Link></li>
                <li><Link to={"/contact"}>Contact</Link></li>
            </ul>
            <div className="navbar-menu" onClick={toggleMenu}>
                {/* Mobile Menu Icon */}
                <span>&#9776;</span>
            </div>
        </nav>
    );
}

export default Header;

import './imagerow.css'
import {Link} from 'react-router-dom';

function ImageRow() {
    return (
        <div className="image-row">
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/eating_food_2.jpg" alt="Image 1"/>
                </Link>
                <h1>Join the Community</h1>
                <p>Sign up now and be the first to access the best local street food, delivered straight to your door.</p>
            </div>
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/bakery.jpg" alt="Image 2"/>
                </Link>
                <h1>Partner With Us</h1>
                <p>Expand your reach and grow your business by joining our network of top street food vendors.</p>
            </div>
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/rider.jpg" alt="Image 3"/>
                </Link>
                <h1>Become a Rider</h1>
                <p>Earn on your own schedule by delivering amazing street food to hungry customers near you.</p>
            </div>
        </div>
    )
}

export default ImageRow;
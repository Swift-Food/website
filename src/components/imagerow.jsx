import './imagerow.css'
import {Link} from 'react-router-dom';

function ImageRow() {
    return (
        <div className="image-row">
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/stall_stock.jpg" alt="Image 1"/>
                </Link>
                <p>Stalls</p>
            </div>
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/rider_stock.jpg" alt="Image 2"/>
                </Link>
                <p>Riders</p>
            </div>
            <div className="image-container">
                <Link to={"/stalls"}>
                    <img src="/swift_eats/images/food_stock.jpg" alt="Image 3"/>
                </Link>
                <p>Customers</p>
            </div>
        </div>
    )
}

export default ImageRow;
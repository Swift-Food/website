import './infocard.css'

function InfoCard() {
    return (
        <div className='parent-container'>
            <div className="info-card">
                <div className='image-section'>
                    <img src='/swift_eats/images/food_board.jpg' alt='image of a board of food'></img>
                </div>
                <div className='title-section'>
                    <h1>Our Purpose</h1>
                    <p>We aim to connect food lovers with the best local market stalls and street food vendors, delivering
                     delicious meals quickly and affordably. Swift Food was created to make street food more accessible
                     while supporting the hardworking vendors that make London's food scene unique. Our goal is to become
                     the go-to platform for students and food lovers who want variety, quality, and value—all in one place.</p>
                </div>
            </div>
        </div>
    )
}

export default InfoCard;
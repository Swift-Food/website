import './aboutuscard.css'

function AboutUsCard() {
    return (
        <div className='parent-container'>
            <div className="info-card">

                <div className='title-section'>
                    <h1>What Makes Us Different?</h1>
                </div>
                <div className='image-section'>
                    <img src='/swift_eats/images/food_board.jpg' alt='image of a board of food'></img>
                </div>
                <div className='text-section'>
                    <p><b>Multiple Cuisines, One Order</b> - Craving Thai, Mexican, and Lebanese all at once? No
                        problem. Mix and
                        match dishes from different vendors in a single order.</p>
                    <p><b>Supporting Local Businesses</b> - We champion independent food stalls and small vendors,
                        bringing their incredible flavours to your doorstep.</p>
                    <p><b>More Affordable Than the Big Names</b> - Lower delivery fees mean you can enjoy your
                        favourite meals without breaking the bank.</p>
                </div>

                <div className='title-section'>
                    <h1>The Problem We're Solving</h1>
                </div>
                <div className='image-section'>
                    <img src='/swift_eats/images/eating_food.jpg' alt='image of a board of food'></img>
                </div>
                <div className='text-section'>
                    <p>While big delivery platforms focus on expensive restaurants, we saw a gap in the market—London's
                        vibrant street food scene was missing from delivery apps. At the same time, platforms like
                     Deliveroo, UberEats, and JustEat were becoming too expensive for students and everyday people.
                     That's where Swift Food comes in.</p>
                </div>

                <div className='title-section'>
                    <h1>Where We Operate</h1>
                </div>
                <div className='image-section'>
                    <img src='/swift_eats/images/shops.jpg' alt='image of a board of food'></img>
                </div>
                <div className='text-section'>
                    <p>We're currently serving the Camden area, but we have big plans!</p>
                    <p>Swift Food is scaling across London, bringing its fast, affordable, and diverse food delivery
                     service to more people soon.</p>
                </div>

            </div>
        </div>
    )
}

export default AboutUsCard;
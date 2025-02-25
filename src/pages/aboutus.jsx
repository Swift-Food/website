import './aboutus.css'
import AboutUsCard from "../components/aboutuscard.jsx";

function AboutUs() {
    return (
        <div className='aboutus'>
            <div className='title'>
                <h1>About us</h1>
                <h2>Bringing Street Food to Your Doorstep - <i>Fast, Affordable and Local</i></h2>
                <h3>At Swift Food, we believe that great food shouldn't come with a hefty price tag.</h3>
            </div>

            <AboutUsCard />
        </div>
    )
}

export default AboutUs
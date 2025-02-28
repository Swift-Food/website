import './faqcard.css'
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";


function FAQCard() {

    const [openIndexes, setOpenIndexes] = useState({}); // Keeps track of open questions per category

    const faqSections = [
        {
            title: "General",
            questions: [
                { question: "What is Swift Food?", answer: "Swift Food is a food delivery app that connects vou with" +
                        " the best local street food vendors and market stalls, delivering affordable," +
                        " high-quality meals straight to your door. Unlike other delivery platforms, we let you order" +
                        " from multiple stalls within the same market in one delivery while keeping costs low." },
                { question: "Where is Swift Food available?", answer: "We currently operate in Camden, but we're expanding" +
                        " across London soon! Stay tuned for updates as we grow." },
                { question: "Who can use Swift Food?", answer: "Anyone! However, when we launch, our focus will be on" +
                        " students, offering them a cheaper, more flexible alternative to other food delivery services." },
            ],
        },
        {
            title: "Orders",
            questions: [
                {
                    question: "How do I place an order?",
                    answer: (
                        <>
                            Ordering with Swift Food is simple:
                            <ol>
                                <li>Choose a market (e.g. Camden Market).</li>
                                <li>Browse food stalls and vendors within that market.</li>
                                <li>Add dishes from multiple stalls in one order.</li>
                                <li>Checkout and track your delivery live.</li>
                            </ol>
                        </>
                    ),
                },
                { question: "Can I order from multiple vendors in one order?", answer: "Yes! You can mix and match" +
                        " dishes from different food stalls within the same market in a single delivery—so you can" +
                        " enjoy a variety of cuisines without extra fees." },
                { question: "How long does delivery take?", answer: "We aim to deliver your food within 15 minutes" +
                        " after the vendor finishes preparing your meal. Our fast delivery ensures you get fresh," +
                        " hot food straight from the market to your door." },
            ],
        },
        {
            title: "Catering & Events",
            questions: [
                {
                    question: "Do you offer catering for big events?",
                    answer: (
                        <>
                            <h4>Yes! If you're planning an event, we offer a catering option where you can:</h4>
                            Fill out a request form with details on how many people you're serving and your preferred cuisines.
                            See which market stalls can provide food, along with estimated prep and delivery times.
                            Get customised meal packages based on your event size, whether it's a small gathering or a large festival.

                            <h4>For more details, visit our <u><b>Catering Page</b></u> on the app or website.</h4>
                        </>
                    ),
                },
            ],
        },
        {
            title: "Restaurants & Vendors",
            questions: [
                { question: "How do you choose your food vendors?", answer: "We partner with local street food stalls, market vendors," +
                        " and small restaurants that serve delicious, high-quality meals at affordable prices." },
                { question: "I own a food stall—how can I partner with Swift Food?", answer: "We'd love to have you" +
                        " on board! Fill out our business inquiries form on the website, and our team will get in touch." },
            ],
        },
        {
            title: "Support",
            questions: [
                { question: "What if there's an issue with my order?", answer: "If you experience any problems," +
                        " contact our support team through the app, and we'll sort it out ASAP." },
                { question: "How do I contact customer support?", answer: "You can reach out via live chat in the app" +
                        " or email at ...()." },
            ],
        },
    ];

    const toggleFAQ = (sectionIndex, questionIndex) => {
        setOpenIndexes((prev) => ({
            ...prev,
            [sectionIndex]: prev[sectionIndex] === questionIndex ? null : questionIndex,
        }));
    };

    return (
        <div className='parent-container'>
            <div className="info-card-faq">

                <div className='title-section'>
                    <h1>Frequently Asked Questions</h1>
                </div>

                <div className="faq-card">
                    {faqSections.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="faq-section">
                            <h3 className="faq-category-title">{section.title}</h3>
                            <div className="faq-container">
                                {section.questions.map((item, questionIndex) => (
                                    <div
                                        className={`faq-item ${openIndexes[sectionIndex] === questionIndex ? "open" : ""}`}
                                        key={questionIndex}
                                    >
                                        <div className="faq-question"
                                             onClick={() => toggleFAQ(sectionIndex, questionIndex)}>
                                            {item.question}
                                            <FaChevronDown
                                                className={`icon ${openIndexes[sectionIndex] === questionIndex ? "rotate" : ""}`}/>
                                        </div>
                                        <div className="faq-answer">{item.answer}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}

export default FAQCard;
import './faqcard.css'
import { useState } from "react";

const faqData_general = [
    {
        question: "What is Swift Food?",
        answer: "Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can't offer you a refund or exchange.",
    },
    {
        question: "Where is Swift Food available?",
        answer: "You can track your order by using the tracking number sent to your email after purchase.",
    },
    {
        question: "Who can use Swift Food?",
        answer: "Yes, we ship worldwide! Shipping times may vary depending on your location.",
    },
]

const faqData_order = [
    {
        question: "What is Swift Food?",
        answer: "Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can't offer you a refund or exchange.",
    },
    {
        question: "Where is Swift Food available?",
        answer: "You can track your order by using the tracking number sent to your email after purchase.",
    },
    {
        question: "Who can use Swift Food?",
        answer: "Yes, we ship worldwide! Shipping times may vary depending on your location.",
    },
]
const faqData_catering = [
    {
        question: "What is Swift Food?",
        answer: "Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can't offer you a refund or exchange.",
    },
]
const faqData_restaurants = [
    {
        question: "What is Swift Food?",
        answer: "Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can't offer you a refund or exchange.",
    },
    {
        question: "Where is Swift Food available?",
        answer: "You can track your order by using the tracking number sent to your email after purchase.",
    },
]

const faqData_support = [
    {
        question: "What is Swift Food?",
        answer: "Our return policy lasts 30 days. If 30 days have gone by since your purchase, unfortunately, we can't offer you a refund or exchange.",
    },
    {
        question: "Where is Swift Food available?",
        answer: "You can track your order by using the tracking number sent to your email after purchase.",
    },
]
function FAQCard() {
    return (
        <div className='parent-container'>
            <div className="info-card">

                <div className='title-section'>
                    <h1>Frequently Asked Questions</h1>
                </div>
                <div className="faq-container">

                    <h2>General</h2>
                    <div className="faq-group">
                        <div className="faq-item">
                            <div className="faq-question">
                                What is your return policy?
                                <span className="icon">▼</span>
                            </div>
                            <div className="faq-answer">
                                Our return policy lasts 30 days. If 30 days have gone by since your
                                purchase,
                                unfortunately, we can't offer you a refund or exchange.
                            </div>
                        </div>

                        <div className="faq-item">
                            <div className="faq-question">
                                How can I track my order?
                                <span className="icon">▼</span>
                            </div>
                            <div className="faq-answer">
                                You can track your order by using the tracking number sent to your email
                                after
                                purchase.
                            </div>
                        </div>

                        <div className="faq-item">
                            <div className="faq-question">
                                Do you offer international shipping?
                                <span className="icon">▼</span>
                            </div>
                            <div className="faq-answer">
                                Yes, we ship worldwide! Shipping times may vary depending on your location.
                            </div>
                        </div>
                    </div>

                    <h2>Order</h2>


                    <h2>Catering & Events</h2>


                    <h2>Restaurants & Vendors</h2>


                    <h2>Support</h2>
                </div>
            </div>
        </div>
    )
}

export default FAQCard;
"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function FAQ() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqData = [
    {
      title: "General",
      questions: [
        { 
          question: "What is Swift Food?", 
          answer: "Swift Food is a food delivery app that connects you with the best local street food vendors and market stalls, delivering affordable, high-quality meals straight to your door. Unlike other delivery platforms, we let you order from multiple stalls within the same market in one delivery while keeping costs low." 
        },
        { 
          question: "Where is Swift Food available?", 
          answer: "We currently operate in Camden, but we're expanding across London soon! Stay tuned for updates as we grow." 
        },
        { 
          question: "Who can use Swift Food?", 
          answer: "Anyone! However, when we launch, our focus will be on students, offering them a cheaper, more flexible alternative to other food delivery services." 
        },
      ],
    },
    {
      title: "Orders",
      questions: [
        {
          question: "How do I place an order?",
          answer: (
            <div>
              <p className="mb-3">Ordering with Swift Food is simple:</p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Choose a market (e.g. Camden Market).</li>
                <li>Browse food stalls and vendors within that market.</li>
                <li>Add dishes from multiple stalls in one order.</li>
                <li>Checkout and track your delivery live.</li>
              </ol>
            </div>
          ),
        },
        { 
          question: "Can I order from multiple vendors in one order?", 
          answer: "Yes! You can mix and match dishes from different food stalls within the same market in a single delivery—so you can enjoy a variety of cuisines without extra fees." 
        },
        { 
          question: "How long does delivery take?", 
          answer: "We aim to deliver your food within 15 minutes after the vendor finishes preparing your meal. Our fast delivery ensures you get fresh, hot food straight from the market to your door." 
        },
      ],
    },
    {
      title: "Catering & Events",
      questions: [
        {
          question: "Do you offer catering for big events?",
          answer: (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Yes! If you're planning an event, we offer a catering option where you can:</h4>
                <p className="text-gray-600 mb-3">
                  Fill out a request form with details on how many people you're serving and your preferred cuisines. 
                  See which market stalls can provide food, along with estimated prep and delivery times. 
                  Get customised meal packages based on your event size, whether it's a small gathering or a large festival.
                </p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <h4 className="font-semibold text-primary">
                  For more details, visit our <span className="underline font-bold">Catering Page</span> on the app or website.
                </h4>
              </div>
            </div>
          ),
        },
      ],
    },
    {
      title: "Restaurants & Vendors",
      questions: [
        { 
          question: "How do you choose your food vendors?", 
          answer: "We partner with local street food stalls, market vendors, and small restaurants that serve delicious, high-quality meals at affordable prices." 
        },
        { 
          question: "I own a food stall—how can I partner with Swift Food?", 
          answer: "We'd love to have you on board! Fill out our business inquiries form on the website, and our team will get in touch." 
        },
      ],
    },
    {
      title: "Support",
      questions: [
        { 
          question: "What if there's an issue with my order?", 
          answer: "If you experience any problems, contact our support team through the app, and we'll sort it out ASAP." 
        },
        { 
          question: "How do I contact customer support?", 
          answer: "You can reach out via live chat in the app or email us through our contact form." 
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about Swift Food
          </p>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="rounded-xl shadow-sm border border-primary p-6">
              {/* Category Title */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-200">
                {category.title}
              </h2>

              {/* Questions */}
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  const isOpen = openItems[key];

                  return (
                    <div key={questionIndex} className="border border-primary rounded-lg overflow-hidden">
                      {/* Question Button */}
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full text-left p-4 hover:bg-secondary transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800 pr-4">
                          {item.question}
                        </span>
                        <span className="text-primary text-xl font-bold flex-shrink-0">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>

                      {/* Answer Content */}
                      {isOpen && (
                        <div className="p-4 border-t border-primary">
                          <div className="text-gray-600 leading-relaxed">
                            {typeof item.answer === 'string' ? (
                              <p>{item.answer}</p>
                            ) : (
                              item.answer
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-primary/5 rounded-xl p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Contact Support
          </Link>
        </div>

       
      </div>
    </div>
  );
}
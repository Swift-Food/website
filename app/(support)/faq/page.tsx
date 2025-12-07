"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function FAQ() {
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});

  const toggleItem = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const faqData = [
    {
      title: "Ordering & Lead Time",
      questions: [
        {
          question: "How far in advance should I place an order?",
          answer:
            "Lead times vary by restaurant, and each menu clearly shows the required notice. Some partners offer short-notice options, while others require more preparation time. For larger groups or events, placing your order as early as possible helps us coordinate seamlessly with our partners.",
        },
        {
          question: "Can I place same-day orders?",
          answer:
            "Yes. Certain restaurants accept same-day or short-notice orders. The exact timing will always be shown on the restaurant's menu.",
        },
        {
          question: "Is there a minimum order quantity?",
          answer:
            "Most restaurants do not require a minimum order. When a specific partner has one, it will be clearly displayed before checkout.",
        },
      ],
    },
    {
      title: "Menu, Allergies & Customisation",
      questions: [
        {
          question: "Do you provide allergen details and dietary filters?",
          answer:
            "Yes. Each menu item includes allergen information provided by the restaurant. If you have allergies or strict dietary requirements, please confirm details directly with the supplier. Dietary filters are also available to help you browse easily.",
        },
        {
          question: "Can I order from multiple restaurants in one delivery?",
          answer:
            "Yes, you can combine items from several partners within a single order.",
        },
        {
          question: "Do the menus change?",
          answer:
            "Menus remain consistent, though special or seasonal offerings may be featured during festive periods.",
        },
      ],
    },
    {
      title: "Delivery & Logistics",
      questions: [
        {
          question: "What delivery times are available?",
          answer:
            "You may request any preferred delivery time. Once submitted, our team reviews and confirms availability to ensure smooth coordination.",
        },
        {
          question: "Who delivers the food?",
          answer:
            "Deliveries are handled by a dedicated courier team experienced in event-scale orders.",
        },
        {
          question: "What if something goes wrong with my delivery?",
          answer:
            "If an issue such as a delay or incorrect drop-off occurs, we will contact you promptly with updates and next steps.",
        },
        {
          question: "What if part of my order is missing or incorrect?",
          answer:
            "Please document as much as possible and submit a request with supporting evidence through our form. Once reviewed, and if approved, a partial refund or credit will be issued.",
        },
        {
          question: "Do you provide cutlery, plates and napkins?",
          answer:
            "Yes. Cutlery, plates and napkins can be included upon request. Some partners may apply a small, clearly displayed charge.",
        },
        {
          question: "Can I modify my order after placing it?",
          answer:
            "Most orders cannot be modified once confirmed. However, if you submit a request through our form, we will review it promptly and may be able to process manual adjustments or offer alternatives.",
        },
      ],
    },
    {
      title: "Payments, Cancellations & Refunds",
      questions: [
        {
          question: "What payment methods can I use?",
          answer:
            "We accept all payment options supported by our Stripe partners, including major debit and credit cards, international cards, Visa, and American Express. We also accept wallets such as Link, Apply Pay, and Google Pay",
        },
        {
          question: "What is your cancellation and refund policy?",
          answer:
            "Restaurants have their own cancellation and refund rules, which will be displayed before you place your order. Refund requests must be submitted within 48 hours of delivery, and the restaurant will review and respond according to its policy.",
        },
      ],
    },
    {
      title: "Our Partners",
      questions: [
        {
          question: "Where does the food come from?",
          answer:
            "We work with a carefully selected set of restaurant partners chosen for their quality, value, and commitment to positive operational practices.",
        },
      ],
    },
    {
      title: "Platform Experience",
      questions: [
        {
          question: "How do I place and manage an order?",
          answer:
            "Orders are placed through our website. A dedicated management page, which is emailed to you post checkout, allows you to organise collection, assign responsibilities, and keep everyone informed.",
        },
        {
          question: "Can I track my order?",
          answer:
            "You will receive timely updates as your order progresses, with information provided as close to real time as possible.",
        },
      ],
    },
    {
      title: "Event Scale & Recurring Orders",
      questions: [
        {
          question: "What is the largest event Swift can support?",
          answer:
            "We can accommodate events serving up to 10,000 people. For very large orders, contacting us early ensures the best possible coordination.",
        },
        {
          question: "How early should I book for a 500-person event?",
          answer:
            "We recommend placing large event orders at least one week in advance. Earlier bookings are advised for complex or multi-vendor arrangements.",
        },
        {
          question: "Can Swift work with venue access restrictions?",
          answer:
            "Yes. If you share any venue requirements or restrictions, we can coordinate with the venue where possible. If direct delivery is not allowed, we will arrange the closest feasible delivery point and keep you informed.",
        },
        {
          question: "Do you support big campus-wide events?",
          answer:
            "Yes. We support events such as balls, fairs, and hackathons. For UCL and upcoming partner universities, you can select specific campus buildings for delivery, and we offer coordination support.",
        },
      ],
    },
    {
      title: "Student & Community Benefits",
      questions: [
        {
          question: "Do you offer sponsorships or partnerships for events?",
          answer:
            "Yes. We occasionally support student groups, societies, and community events through sponsorships or partnerships. Opportunities vary, so please contact us directly to discuss your event.",
        },
        {
          question: "Do you offer discounts for student groups or societies?",
          answer:
            "We frequently run promotions for student organisations. Check our social media platforms to stay updated on current offers.",
        },
      ],
    },
    {
      title: "Corporate & Recurring Orders",
      questions: [
        {
          question: "Can I schedule recurring or corporate orders?",
          answer:
            "Yes. Our team can help you set up a corporate account that includes additional features such as budget controls, role assignments, and access to an expanded selection of restaurant partners.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about Swift Food
          </p>
        </div>

        {/* FAQ Content */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div
              key={categoryIndex}
              className="rounded-xl border border-primary p-6"
            >
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
                    <div
                      key={questionIndex}
                      className="border border-primary rounded-lg overflow-hidden"
                    >
                      {/* Question Button */}
                      <button
                        onClick={() => toggleItem(categoryIndex, questionIndex)}
                        className="w-full text-left p-4 hover:bg-secondary transition-colors flex justify-between items-center"
                      >
                        <span className="font-medium text-gray-800 pr-4">
                          {item.question}
                        </span>
                        <span className="text-primary text-xl font-bold flex-shrink-0">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {/* Answer Content */}
                      {isOpen && (
                        <div className="p-4 border-t border-primary">
                          <div className="text-gray-600 leading-relaxed">
                            {typeof item.answer === "string" ? (
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
            Can't find what you're looking for? Our support team is here to
            help!
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

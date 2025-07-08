import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function AboutUs() {
  return (
    <div className="min-h-screen py-12">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            About <span className="text-primary">Swift Food</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Bringing Street Food to Your Doorstep - <em className="text-primary font-semibold">Fast, Affordable and Local</em>
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              At Swift Food, we believe that great food shouldn't come with a hefty price tag. We're revolutionizing food delivery 
              by connecting you with London's incredible street food scene, making delicious, authentic meals accessible to everyone.
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">What Makes Us Different?</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Multiple Cuisines */}
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🍜</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Multiple Cuisines, One Order</h3>
              <p className="text-gray-600 leading-relaxed">
                Craving Thai, Mexican, and Lebanese all at once? No problem. Mix and match dishes from different vendors 
                in a single order, creating your perfect meal combination.
              </p>
            </div>

            {/* Supporting Local */}
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏪</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Supporting Local Businesses</h3>
              <p className="text-gray-600 leading-relaxed">
                We champion independent food stalls and small vendors, bringing their incredible flavours to your doorstep 
                while helping local businesses thrive in the digital age.
              </p>
            </div>

            {/* Affordable */}
            <div className="bg-white rounded-xl shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">More Affordable Than the Big Names</h3>
              <p className="text-gray-600 leading-relaxed">
                Lower delivery fees and competitive pricing mean you can enjoy your favourite meals without breaking the bank. 
                Great food should be accessible to everyone.
              </p>
            </div>
          </div>
        </div>

        {/* The Problem We're Solving */}
        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-8 mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">The Problem We're Solving</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                While big delivery platforms focus on expensive restaurants, we saw a gap in the market—London's vibrant 
                street food scene was missing from delivery apps. The authentic flavors, affordable prices, and diverse 
                cuisines found in markets like Camden were largely inaccessible through traditional delivery services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                At the same time, platforms like Deliveroo, UberEats, and JustEat were becoming too expensive for students 
                and everyday people, with high delivery fees and inflated menu prices. <span className="font-semibold text-primary">That's where Swift Food comes in.</span>
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-primary mb-3">Our Solution</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>✓ Connect street food vendors to customers</p>
                  <p>✓ Affordable delivery fees</p>
                  <p>✓ Multi-vendor ordering</p>
                  <p>✓ Support local businesses</p>
                  <p>✓ Authentic street food experience</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Where We Operate */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">Where We Operate</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We're currently serving the vibrant Camden area, home to one of London's most famous food markets. Camden Market 
              offers an incredible diversity of cuisines, from traditional British fare to authentic international dishes.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              But we have big plans! Swift Food is scaling across London, bringing its fast, affordable, and diverse food 
              delivery service to more neighborhoods soon. Our goal is to make street food accessible to every corner of the city.
            </p>
            <div className="bg-primary/10 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-2">Coming Soon:</h3>
              <p className="text-gray-700 text-sm">
                Borough Market • Brick Lane • Portobello Road • Greenwich Market • And many more!
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <span className="text-6xl mb-4 block">📍</span>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Currently Serving</h3>
              <p className="text-2xl font-bold text-primary">Tottenham Court Road Market</p>
              <p className="text-2xl font-bold text-primary">Goodge Market</p>
              <p className="text-gray-600 mt-2">London's Premier Food Destination</p>
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-12">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Speed</h3>
              <p className="text-gray-600 text-sm">Fast delivery without compromising on quality</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🤝</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-gray-600 text-sm">Supporting local vendors and bringing people together</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">💎</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Quality</h3>
              <p className="text-gray-600 text-sm">Authentic flavors from trusted local vendors</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        {/* <div className="bg-primary text-white rounded-xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Experience Swift Food?</h2>
          <p className="text-lg mb-6 opacity-90">
            Join thousands of food lovers who've discovered a better way to order delivery
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get in Touch
            </Link>
            <Link 
              href="/" 
              className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Start Ordering
            </Link>
          </div>
        </div> */}

       
      </div>
    </div>
  );
}
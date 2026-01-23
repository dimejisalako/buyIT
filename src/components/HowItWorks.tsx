"use client";
import { useState, useEffect } from "react";

const steps = [
  {
    id: 1,
    title: "Find Product on Amazon",
    description: "Browse Amazon.com and find the product you want to buy",
    icon: "🔍",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    details: "Search for any product on Amazon.com - electronics, books, clothing, anything!"
  },
  {
    id: 2,
    title: "Copy Product Link",
    description: "Copy the full Amazon product URL from your browser",
    icon: "📋",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    details: "Just copy the URL from your browser's address bar - we handle the rest!"
  },
  {
    id: 3,
    title: "Paste Link & Add to Cart",
    description: "Paste the link in our system and add to your cart",
    icon: "🛒",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    details: "Our system automatically processes the link and adds it with a $1.50 service fee"
  },
  {
    id: 4,
    title: "Upload Payment Evidence",
    description: "Make payment in Nigeria and upload proof",
    icon: "💳",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    details: "Pay in Naira via bank transfer, then upload your payment receipt or screenshot"
  },
  {
    id: 5,
    title: "We Buy & Ship",
    description: "We purchase your items and handle international delivery",
    icon: "🚚",
    color: "from-indigo-500 to-blue-500",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
    details: "No US delivery fees! Just our $1.50 service fee + international shipping"
  }
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('how-it-works');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How BuyIT Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, secure, and transparent process to get your Amazon products delivered to Nigeria
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              ✅ No US delivery fees
            </span>
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              💰 Just $1.50 service fee
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              🚚 + International delivery
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-1 bg-gray-200 rounded-full hidden lg:block">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`relative transition-all duration-700 ease-in-out transform ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                } ${
                  activeStep === index ? 'scale-105' : 'scale-100'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Step Card */}
                <div className={`relative bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-500 ${
                  activeStep === index 
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}>
                  {/* Step Number */}
                  <div className={`absolute -top-4 left-6 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${step.color}`}>
                    {step.id}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${step.bgColor} transition-all duration-500 ${
                    activeStep === index ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                  }`}>
                    <span className="text-3xl">{step.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {step.description}
                    </p>
                    
                    {/* Expandable Details */}
                    <div className={`overflow-hidden transition-all duration-500 ${
                      activeStep === index ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      <div className={`p-3 rounded-lg ${step.bgColor} mt-3`}>
                        <p className={`text-xs ${step.textColor} font-medium`}>
                          {step.details}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {activeStep === index && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse" />
                  )}
                </div>

                {/* Arrow (hidden on mobile) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className={`w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center transition-all duration-500 ${
                      activeStep >= index ? 'border-blue-500 text-blue-500' : 'border-gray-300 text-gray-300'
                    }`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to start shopping?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of Nigerians who are already shopping from Amazon without the hassle of US delivery fees!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center gap-2 text-blue-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm">Secure payments in Naira</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm">Fast international delivery</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-sm">24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}



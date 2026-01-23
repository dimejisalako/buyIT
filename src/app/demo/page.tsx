"use client";
import { useState } from "react";
import Link from "next/link";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [demoProduct, setDemoProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const demoScenarios = [
    {
      title: "iPhone 15 Pro Max",
      url: "https://www.amazon.com/Apple-iPhone-15-Pro-Max/dp/B0CHX1F7J6",
      description: "Latest iPhone with advanced camera system"
    },
    {
      title: "Sony WH-1000XM5 Headphones", 
      url: "https://www.amazon.com/Sony-WH-1000XM5-Headphones/dp/B09XS7JWHH",
      description: "Premium noise-canceling headphones"
    },
    {
      title: "MacBook Air M2",
      url: "https://www.amazon.com/Apple-MacBook-Air-M2/dp/B0B3C2R8MP",
      description: "Powerful laptop for work and creativity"
    }
  ];

  const processSteps = [
    {
      title: "Paste Amazon Link",
      description: "User copies product URL from Amazon",
      icon: "🔗",
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Web Search Analysis", 
      description: "Our system searches the web for product details",
      icon: "🔍",
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Product Preview",
      description: "Show extracted product information",
      icon: "📋",
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "User Confirmation",
      description: "User confirms product details are correct",
      icon: "✅",
      color: "from-orange-500 to-red-500"
    },
    {
      title: "Add to Cart",
      description: "Product added with $1.50 service fee",
      icon: "🛒",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  async function runDemo(scenario) {
    setIsProcessing(true);
    setCurrentStep(0);
    
    // Simulate the process step by step
    for (let i = 0; i < processSteps.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Fetch real product data
    try {
      const response = await fetch('/api/amazon-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scenario.url })
      });
      
      const data = await response.json();
      if (data.success) {
        setDemoProduct(data.product);
      }
    } catch (error) {
      console.error('Demo error:', error);
    }
    
    setIsProcessing(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              BuyIT Demo
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/" className="hover:text-blue-400 transition-colors">← Back to App</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              BuyIT Demo
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Experience our revolutionary Amazon link processing system with smart web search and user confirmation
          </p>
          
          {/* Demo Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-blue-400">100%</div>
              <div className="text-gray-300">Link Processing</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-green-400">$1.50</div>
              <div className="text-gray-300">Service Fee Only</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <div className="text-3xl font-bold text-purple-400">Smart</div>
              <div className="text-gray-300">Web Search</div>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Scenarios */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Try Our Smart Link Processing</h2>
          <p className="text-gray-300">Click any scenario below to see the magic happen</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {demoScenarios.map((scenario, index) => (
            <button
              key={index}
              onClick={() => runDemo(scenario)}
              disabled={isProcessing}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left hover:bg-white/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <h3 className="text-xl font-bold mb-2">{scenario.title}</h3>
              <p className="text-gray-300 text-sm mb-4">{scenario.description}</p>
              <div className="text-xs text-blue-400 font-mono break-all">
                {scenario.url}
              </div>
            </button>
          ))}
        </div>

        {/* Process Visualization */}
        {isProcessing && (
          <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-center mb-8">Processing Amazon Link...</h3>
            
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 md:space-x-4">
              {processSteps.map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-500 ${
                    currentStep >= index 
                      ? `bg-gradient-to-r ${step.color} scale-110` 
                      : 'bg-gray-600 scale-100'
                  }`}>
                    <span className="text-2xl">{step.icon}</span>
                  </div>
                  <h4 className={`font-semibold mb-1 transition-colors ${
                    currentStep >= index ? 'text-white' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-xs transition-colors ${
                    currentStep >= index ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                  
                  {currentStep === index && (
                    <div className="mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Demo Result */}
        {demoProduct && !isProcessing && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center mb-6 text-green-400">
              ✅ Product Successfully Processed!
            </h3>
            
            <div className="bg-black/30 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-bold mb-4">{demoProduct.title}</h4>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">ASIN:</span>
                      <span className="font-mono">{demoProduct.asin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-green-400">{demoProduct.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rating:</span>
                      <span className="text-yellow-400">⭐ {demoProduct.rating}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reviews:</span>
                      <span>{demoProduct.reviewCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Confidence:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        demoProduct.confidence === 'high' ? 'bg-green-600' :
                        demoProduct.confidence === 'medium' ? 'bg-yellow-600' : 'bg-orange-600'
                      }`}>
                        {demoProduct.confidence?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h5 className="font-semibold mb-3">Features Found:</h5>
                  <ul className="space-y-2 text-sm">
                    {demoProduct.features?.slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-900/30 rounded-lg">
                    <div className="text-xs text-blue-300 mb-1">Next Steps:</div>
                    <div className="text-sm">
                      ✅ User confirms details<br/>
                      ✅ Add to cart with $1.50 fee<br/>
                      ✅ We purchase & ship to Nigeria
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Showcase */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center mb-12">Why BuyIT is Revolutionary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🚫</div>
              <h3 className="font-bold mb-2">No Scraping</h3>
              <p className="text-gray-300 text-sm">Uses smart web search instead of blocked scraping</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-bold mb-2">Web Search</h3>
              <p className="text-gray-300 text-sm">Finds product details through intelligent search</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-bold mb-2">User Confirmation</h3>
              <p className="text-gray-300 text-sm">Always confirms details before proceeding</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-bold mb-2">Transparent Pricing</h3>
              <p className="text-gray-300 text-sm">Just $1.50 service fee, no hidden costs</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold mb-4">Ready to Try the Real Thing?</h2>
          <p className="text-gray-300 mb-8">Experience BuyIT with your own Amazon products</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all transform hover:scale-105"
            >
              🚀 Launch BuyIT App
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="border-2 border-white/30 hover:border-white/50 text-white font-semibold py-4 px-8 rounded-xl transition-all hover:bg-white/10"
            >
              🔄 Restart Demo
            </button>
          </div>
        </div>
      </div>

      {/* Floating particles for visual effect */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}

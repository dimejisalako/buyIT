"use client";
import { useState } from "react";
// import HeroSection from "./HeroSection";
import Cart, { CartItem } from "../components/Cart";
import UnifiedSearch from "../components/UnifiedSearch";
import AuthModal from "../components/AuthModal";
import HowItWorks from "../components/HowItWorks";
import { useApp } from "../context/AppContext";

export default function Home() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, logoutUser } = useApp();

  const handleAddToCart = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random()}`,
    };
    setCartItems(prev => [...prev, newItem]);
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BuyIT
              </h1>
              <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                Your Amazon Shopping Assistant
              </span>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              {currentUser ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Welcome, {currentUser.name}</span>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4M7 13l-1.5-4M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={logoutUser}
                    className="text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4M7 13l-1.5-4M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                    </svg>
                    {cartItems.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItems.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Shop Amazon.com from Nigeria
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No more expensive individual delivery fees! Just $1.50 service fee per item. 
            We buy from Amazon, consolidate your items, and ship to Nigeria.
          </p>
        </div>

        {/* Unified Search - Full functionality restored! */}
        <div className="max-w-4xl mx-auto">
          <UnifiedSearch onAddToCart={(link, title, price, image, quantity) => {
            handleAddToCart({
              title: title || "Amazon Product",
              link,
              image,
              price,
              addedAt: new Date()
            });
          }} />
        </div>
      </main>

      {/* How It Works Section */}
      <HowItWorks />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">BuyIT</h3>
              <p className="text-gray-400">
                Your trusted Amazon shopping assistant for Nigeria. Save money on delivery fees and shop with confidence.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">How It Works</h4>
              <ul className="space-y-2 text-gray-400">
                <li>1. Search or paste Amazon product links</li>
                <li>2. Add items to your cart</li>
                <li>3. We purchase and consolidate</li>
                <li>4. Pay in Naira via bank transfer</li>
                <li>5. Receive your items in Nigeria</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-gray-400">
                <p>📧 support@buyit.ng</p>
                <p>📱 +234 XXX XXX XXXX</p>
                <p>🌍 Lagos, Nigeria</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 BuyIT. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

"use client";
import { useState } from "react";
import UnifiedSearch from "../components/UnifiedSearch";
import { CartItem } from "../components/Cart";

interface HeroSectionProps {
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

export default function HeroSection({ onAddToCart }: HeroSectionProps) {

  useEffect(() => {
    // No need to load trending products anymore
    setLoading(false);
  }, []);

  function handleAddProduct(link: string, productTitle?: string, price?: string, image?: string, quantity?: number) {
    onAddToCart({
      title: productTitle || "Amazon Product",
      link,
      image,
      price,
      addedAt: new Date()
    });
  }

  if (loading) {
    return (
      <div className="w-full text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading trending products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Unified Search - handles both product searches and Amazon links */}
      <div className="max-w-4xl mx-auto">
        <UnifiedSearch onAddToCart={handleAddProduct} />
      </div>


      {/* Benefits */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose BuyIT?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">💰</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Save Money</h4>
            <p className="text-gray-600 text-sm">No US delivery fees - just $1.50 service fee per item</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🛡️</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure Process</h4>
            <p className="text-gray-600 text-sm">Pay in Naira with bank transfer - safe and familiar</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Fast & Easy</h4>
            <p className="text-gray-600 text-sm">Just search, paste links, or browse trending items</p>
          </div>
        </div>
      </div>
    </div>
  );
} 
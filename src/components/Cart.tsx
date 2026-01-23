"use client";
import { useState } from "react";

export interface CartItem {
  id: string;
  title: string;
  link: string;
  image?: string;
  price?: string;
  addedAt: Date;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  user?: { email: string; name: string; id: string } | null;
  onAuthRequired: () => void;
  onCheckout: () => void;
}

const SERVICE_FEE = 1.50;

export default function Cart({ isOpen, onClose, items, onRemoveItem, onClearCart, user, onAuthRequired, onCheckout }: CartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const totalServiceFees = items.length * SERVICE_FEE;

  const handleCheckout = async () => {
    // Require authentication for checkout
    if (!user) {
      onAuthRequired();
      return;
    }

    setIsCheckingOut(true);
    
    try {
      onCheckout();
      onClose();
    } catch (error) {
      alert("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
            <p className="text-gray-600 text-sm">{items.length} items</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">🛒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600">Add some Amazon products to get started!</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-contain bg-white rounded-lg"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                      {item.title}
                    </h4>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 text-xs hover:underline block mb-2 truncate"
                    >
                      View on Amazon →
                    </a>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Service fee: <span className="font-semibold text-blue-600">${SERVICE_FEE.toFixed(2)}</span>
                      </span>
                      {item.price && (
                        <span className="text-sm font-bold text-gray-900">{item.price}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Items:</span>
                <span className="font-semibold">{items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Service fees:</span>
                <span className="font-semibold text-blue-600">${totalServiceFees.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total service fees:</span>
                  <span className="font-bold text-xl text-blue-600">${totalServiceFees.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  + Product costs + International delivery
                </p>
                {!user ? (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-blue-700 text-xs font-medium">
                      🔐 Sign in required to complete checkout
                    </p>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                    <p className="text-amber-700 text-xs font-medium">
                      💡 Next: Pay in Naira via bank transfer, then upload payment evidence
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClearCart}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Clear Cart
              </button>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="flex-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
              >
                {isCheckingOut ? "Processing..." : (!user ? "Sign In to Checkout" : "Proceed to Payment")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

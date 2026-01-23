"use client";
import { useState } from "react";

interface ProductData {
  asin: string;
  url: string;
  title: string;
  price: string;
  image: string;
  availability: string;
  rating?: string;
  reviewCount?: string;
  features?: string[];
  description?: string;
  needsConfirmation?: boolean;
  searchMethod?: string;
  confidence?: 'low' | 'medium' | 'high';
}

interface ProductLinkBoxProps {
  onSubmit: (link: string, title?: string) => void;
}

export default function ProductLinkBox({ onSubmit }: ProductLinkBoxProps) {
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [productPreview, setProductPreview] = useState<ProductData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!link.trim()) {
      setError("Please enter a product link.");
      return;
    }
    
    if (!link.includes("amazon.com")) {
      setError("Please enter a valid Amazon.com product link.");
      return;
    }
    
    setError("");
    setSuccess("");
    setIsLoading(true);
    setProductPreview(null);
    setShowPreview(false);
    
    try {
      // Call our new Amazon scraping API
      const response = await fetch('/api/amazon-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: link }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch product data');
      }

      // The API returns the product data in a 'product' field
      if (data.success && data.product && data.product.title) {
        setProductPreview(data.product);
        setShowPreview(true);
      } else {
        throw new Error('No product data received');
      }
    } catch (err: any) {
      // Even if API fails, still capture the link with basic info
      const basicProduct = {
        asin: link.match(/\/dp\/([A-Z0-9]{10})/i)?.[1] || 'unknown',
        url: link,
        title: extractBasicTitle(link),
        price: 'Check Amazon for current price',
        image: '',
        availability: 'Available on Amazon',
        rating: '',
        reviewCount: '',
        needsConfirmation: true,
        searchMethod: 'fallback_capture',
        confidence: 'low' as const,
        error: 'API unavailable - using basic link capture'
      };
      
      setProductPreview(basicProduct);
      setShowPreview(true);
      setError(""); // Clear error since we're still proceeding
    } finally {
      setIsLoading(false);
    }
  }

  // Helper function to extract basic title from URL
  function extractBasicTitle(url: string): string {
    try {
      const urlParts = url.split('/');
      const titleIndex = urlParts.findIndex(part => part === 'dp') - 1;
      
      if (titleIndex >= 0 && urlParts[titleIndex]) {
        return urlParts[titleIndex]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase())
          .replace(/\s+/g, ' ')
          .trim();
      }
      
      return 'Amazon Product';
    } catch {
      return 'Amazon Product';
    }
  }

  function handleAddToCart() {
    if (productPreview) {
      onSubmit(productPreview.url, productPreview.title);
      setLink("");
      setProductPreview(null);
      setShowPreview(false);
      setSuccess("Product added to cart successfully! 🎉");
      setTimeout(() => setSuccess(""), 3000);
    }
  }

  function handleCancel() {
    setProductPreview(null);
    setShowPreview(false);
    setLink("");
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {!showPreview ? (
        <>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🔗</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Amazon Product</h3>
            <p className="text-gray-600">
              Paste any Amazon.com product link below. We'll fetch the real product details for you.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="url"
                placeholder="https://www.amazon.com/product-name/dp/..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={link}
                onChange={e => setLink(e.target.value)}
                disabled={isLoading}
                required
              />
              <button
                type="submit"
                disabled={isLoading || !link.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all transform hover:scale-105"
              >
                {isLoading ? "Fetching..." : "Get Product"}
              </button>
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg">
                <span>✅</span>
                <span>{success}</span>
              </div>
            )}
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-lg">💡</span>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">How it works</h4>
                <p className="text-blue-700 text-sm">
                  Paste any Amazon product URL and we'll extract the real product title, price, images, and details before adding to your cart.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        productPreview && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Product Details</h3>
              <p className="text-gray-600">
                {productPreview.searchMethod === 'fallback_capture' 
                  ? 'We captured your Amazon link. Please confirm the product details below are correct.'
                  : 'We found this product information through web search. Please confirm these details are correct.'
                }
              </p>
              {productPreview.confidence && (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  productPreview.confidence === 'high' ? 'bg-green-100 text-green-700' :
                  productPreview.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {productPreview.confidence === 'high' ? 'High Confidence Match' :
                   productPreview.confidence === 'medium' ? 'Medium Confidence Match' :
                   productPreview.searchMethod === 'fallback_capture' ? 'Link Captured - Please Verify' :
                   'Low Confidence - Please Verify'}
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="md:w-1/3">
                  {productPreview.image ? (
                    <img
                      src={productPreview.image}
                      alt={productPreview.title}
                      className="w-full h-48 md:h-64 object-contain bg-white rounded-lg border"
                    />
                  ) : (
                    <div className="w-full h-48 md:h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="md:w-2/3 space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {productPreview.title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {productPreview.price && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-semibold text-green-600">{productPreview.price}</span>
                        </div>
                      )}
                      
                      {productPreview.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Rating:</span>
                          <span className="font-semibold text-yellow-600">⭐ {productPreview.rating}</span>
                          {productPreview.reviewCount && (
                            <span className="text-gray-500">({productPreview.reviewCount} reviews)</span>
                          )}
                        </div>
                      )}
                    </div>

                    {productPreview.availability && (
                      <div className="mt-2">
                        <span className="text-sm text-gray-600">Availability: </span>
                        <span className="text-sm font-medium text-green-600">{productPreview.availability}</span>
                      </div>
                    )}
                  </div>

                  {productPreview.features && productPreview.features.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Key Features:</h5>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {productPreview.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Description */}
                  {productPreview.description && (
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Description:</h5>
                      <p className="text-sm text-gray-700">{productPreview.description}</p>
                    </div>
                  )}

                  {/* Search Method Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span className={`w-2 h-2 rounded-full ${
                        productPreview.searchMethod === 'web_search' ? 'bg-green-500' :
                        productPreview.searchMethod === 'fallback_capture' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}></span>
                      <span>
                        {productPreview.searchMethod === 'web_search' ? 'Found via web search' :
                         productPreview.searchMethod === 'fallback_capture' ? 'Link captured (API unavailable)' :
                         productPreview.searchMethod === 'url_extraction_only' ? 'Extracted from URL' :
                         'Basic extraction'}
                      </span>
                    </div>
                  </div>

                  {/* Service Fee Info */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">BuyIT Service Fee:</span>
                      <span className="font-semibold text-blue-600">$1.50</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      No US delivery fees! Just our flat service fee per item.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmation Question */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <span className="text-yellow-600 text-xl">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">Confirm Product Details</h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    Is this the correct product you want to purchase? The details above were found through web search 
                    and may need verification.
                  </p>
                  <div className="text-xs text-yellow-600">
                    <strong>What happens next:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>We'll verify the current price and availability on Amazon</li>
                      <li>You'll receive a confirmation with exact details before payment</li>
                      <li>We'll purchase the item only after your final approval</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
              >
                ✅ Yes, Add to Cart ($1.50 service fee)
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                ❌ No, Try Again
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
} 
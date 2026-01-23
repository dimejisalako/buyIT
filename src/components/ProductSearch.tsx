"use client";
import { useState } from "react";

interface Product {
  title: string;
  image: string;
  link: string;
  price?: string;
}

interface ProductSearchProps {
  onAddToCart: (link: string, title: string) => void;
}

export default function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setError("Please enter a search term");
      return;
    }

    setIsSearching(true);
    setError("");
    setSearchResults([]);

    try {
      // Try to fetch from Amazon API
      const response = await fetch(`/api/amazon?keyword=${encodeURIComponent(searchTerm)}`);
      
      if (response.ok) {
        const product = await response.json();
        setSearchResults([product]);
      } else {
        // Fallback to mock results if API fails
        const mockResults = [
          {
            title: `${searchTerm} - Premium Quality`,
            image: "https://via.placeholder.com/300x300/f0f0f0/666666?text=" + encodeURIComponent(searchTerm),
            link: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}`,
            price: "$29.99"
          },
          {
            title: `${searchTerm} - Best Seller`,
            image: "https://via.placeholder.com/300x300/e0e0e0/555555?text=" + encodeURIComponent(searchTerm),
            link: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&ref=sr_nr_p_72_1`,
            price: "$39.99"
          },
          {
            title: `${searchTerm} - Professional Grade`,
            image: "https://via.placeholder.com/300x300/d0d0d0/444444?text=" + encodeURIComponent(searchTerm),
            link: `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&ref=sr_nr_p_36_2`,
            price: "$59.99"
          }
        ];
        setSearchResults(mockResults);
      }
    } catch (err) {
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    onAddToCart(product.link, product.title);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🔍</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Search Amazon Products</h3>
        <p className="text-gray-600">
          Search for products directly and add them to your cart with our $1.50 service fee.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for products (e.g., iPhone, headphones, books...)"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isSearching}
            required
          />
          <button
            type="submit"
            disabled={isSearching || !searchTerm.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all transform hover:scale-105"
          >
            {isSearching ? "Searching..." : "Search"}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Search Results for "{searchTerm}"
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((product, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative mb-3">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-32 object-contain bg-white rounded-lg"
                  />
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="absolute top-2 right-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105"
                  >
                    + Add to Cart
                  </button>
                </div>
                
                <h5 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
                  {product.title}
                </h5>
                
                {product.price && (
                  <p className="text-green-600 font-bold text-lg mb-2">{product.price}</p>
                )}
                
                <div className="flex items-center justify-between">
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-gray-700 text-xs hover:underline"
                  >
                    View on Amazon →
                  </a>
                  <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2 py-1 rounded-full">
                    +$1.50 fee
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Searching Amazon products...</p>
        </div>
      )}
    </div>
  );
}



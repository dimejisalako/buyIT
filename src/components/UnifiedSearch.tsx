"use client";
import { useState } from "react";

interface UnifiedSearchProps {
  onAddToCart: (item: { title: string; link: string; image?: string; price?: string; quantity?: number }) => void;
}

export default function UnifiedSearch({ onAddToCart }: UnifiedSearchProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [submittedLink, setSubmittedLink] = useState<string | null>(null);

  const isAmazonUrl = (text: string) => {
    try {
      const url = new URL(text);
      return url.hostname.includes("amazon.com") || url.hostname.includes("www.amazon.com");
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Please enter a product link.");
      return;
    }

    if (!isAmazonUrl(input)) {
      setError("Please enter a valid Amazon.com product link. Direct product search is currently unavailable.");
      return;
    }

    setError("");
    setSuccess("");
    setIsLoading(true);
    setSubmittedLink(null);

    try {
      const response = await fetch('/api/submit-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: input }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to submit link for review.');
      }

      setSubmittedLink(input);
      setSuccess("Link submitted for manual review! We'll get back to you shortly.");
      setInput(""); // Clear input after submission
    } catch (err: any) {
      console.error("Error submitting link:", err);
      setError(err.message || "Failed to submit link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl">🔗</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Add Amazon Product</h3>
        <p className="text-gray-600">
          Paste any Amazon product link and we'll manually verify it for you with a screenshot confirmation!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="relative">
          <input
            type="url"
            placeholder="https://www.amazon.com/product-name/dp/..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-6 py-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            required
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg text-sm transition-all transform hover:scale-105"
          >
            {isLoading ? "Submitting..." : "Submit Link"}
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
            {submittedLink && (
              <a href={submittedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                View Submitted Link
              </a>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
"use client";
import { useState } from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            BuyIT - Your Amazon Shopping Assistant
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            App is loading... Please wait while we fix the issue.
          </p>
        </div>
      </div>
    </div>
  );
}

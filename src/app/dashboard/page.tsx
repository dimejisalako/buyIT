"use client";
import { useApp, OrderStatusLabels } from '../../context/AppContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { currentUser, getUserOrders, getUserStats } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userOrders = getUserOrders(currentUser.id);
  const stats = getUserStats(currentUser.id);
  const currentTime = new Date().getHours();
  const greeting = currentTime < 12 ? 'Good Morning' : currentTime < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">BuyIT Dashboard</h1>
                <p className="text-xs text-gray-500">Your Shopping Overview</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Shopping
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">{greeting}, {currentUser.name}!</h2>
          <p className="text-blue-100">Welcome to your BuyIT dashboard. Here's an overview of your shopping activity.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-green-600 text-xs font-medium mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">📦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Products Ordered</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                <p className="text-green-600 text-xs font-medium mt-1">Items purchased</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">🛍️</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                <p className="text-blue-600 text-xs font-medium mt-1">Including fees</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 text-xl">💰</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Savings</p>
                <p className="text-3xl font-bold text-green-600">${stats.totalSavings.toFixed(2)}</p>
                <p className="text-green-600 text-xs font-medium mt-1">VS individual shipping</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">💸</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Order Status</h3>
          
          {userOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <p className="text-gray-600 mb-4">No orders yet</p>
              <button
                onClick={() => router.push('/')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(order.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">${order.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} items</p>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'awaiting_pickup' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {OrderStatusLabels[order.status]}
                      </span>
                    </div>
                    
                    {/* Status Progress */}
                    <div className="relative">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>Ordered</span>
                        <span>Processing</span>
                        <span>Shipping</span>
                        <span>Delivered</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: order.status === 'ordered' ? '25%' :
                                   order.status === 'shipped' || order.status === 'received' ? '50%' :
                                   order.status === 'internationally_shipped' || order.status === 'arrived_nigeria' ? '75%' :
                                   order.status === 'awaiting_pickup' || order.status === 'completed' ? '100%' : '25%'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">Items:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                          {item.image && (
                            <img src={item.image} alt={item.title} className="w-12 h-12 object-contain" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                            <p className="text-sm text-gray-500">{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shopping Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Shopping Insights</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">💡 Money Saved</h4>
              <p className="text-gray-600 text-sm mb-2">
                By using BuyIT instead of individual shipping, you've saved:
              </p>
              <p className="text-2xl font-bold text-green-600">${stats.totalSavings.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Our $1.50 service fee vs estimated individual shipping costs
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">📊 Shopping Pattern</h4>
              <p className="text-gray-600 text-sm mb-2">
                Average order value:
              </p>
              <p className="text-2xl font-bold text-blue-600">
                ${stats.totalOrders > 0 ? (stats.totalSpent / stats.totalOrders).toFixed(2) : '0.00'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Items per order: {stats.totalOrders > 0 ? (stats.totalItems / stats.totalOrders).toFixed(1) : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



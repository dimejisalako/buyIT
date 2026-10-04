"use client";
import { useState, useEffect } from "react";

interface ProductRequest {
  id: string;
  userId?: string;
  amazonUrl: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'purchased';
  submittedAt: Date;
  confirmationDetails?: {
    title: string;
    price: string;
    image: string;
    screenshotUrl: string;
    confirmedAt?: Date;
  };
}

export default function AdminRequests() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        console.log('Fetching requests from API...');
        const response = await fetch('/api/admin/requests', { headers: { 'x-admin-key': localStorage.getItem('shopbrow-admin-key') || '' } });
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch requests`);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        // Convert date strings back to Date objects
        const requestsWithDates = data.requests.map((req: any) => ({
          ...req,
          submittedAt: new Date(req.submittedAt),
          confirmationDetails: req.confirmationDetails ? {
            ...req.confirmationDetails,
            confirmedAt: req.confirmationDetails.confirmedAt ? new Date(req.confirmationDetails.confirmedAt) : undefined
          } : undefined
        }));
        
        console.log('Processed requests:', requestsWithDates);
        setRequests(requestsWithDates);
      } catch (error) {
        console.error('Error fetching requests:', error);
        setRequests([]);
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'purchased': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Requests</h1>
          <p className="text-gray-600 mt-2">Manage customer Amazon product requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests yet</h3>
            <p className="text-gray-500">Customer requests will appear here when submitted.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {request.confirmationDetails?.title || 'Amazon Product'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Request ID: {request.id}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Customer Info</h4>
                          <p className="text-sm text-gray-600">User ID: {request.userId || 'Anonymous'}</p>
                          {request.confirmationDetails?.price && (
                            <p className="text-sm text-gray-600">Price: {request.confirmationDetails.price}</p>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">Amazon URL</h4>
                          <a 
                            href={request.amazonUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                          >
                            {request.amazonUrl}
                          </a>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <span>Submitted: {request.submittedAt.toLocaleString()}</span>
                        {request.confirmationDetails?.confirmedAt && (
                          <span className="ml-4">Confirmed: {request.confirmationDetails.confirmedAt.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        📋 Next Steps:
                      </h4>
                      <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
                        <li>Visit the Amazon URL above</li>
                        <li>Take a screenshot of the product</li>
                        <li>Send confirmation email to customer with screenshot</li>
                        <li>Update request status to "screenshot_sent"</li>
                      </ol>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

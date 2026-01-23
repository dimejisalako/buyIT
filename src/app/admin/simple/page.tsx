"use client";
import { useState, useEffect } from "react";

export default function SimpleAdmin() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('SimpleAdmin: Starting fetch...');
    
    fetch('/api/admin/requests')
      .then(response => {
        console.log('SimpleAdmin: Response received', response.status);
        return response.json();
      })
      .then(data => {
        console.log('SimpleAdmin: Data received', data);
        setRequests(data.requests || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('SimpleAdmin: Error', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  console.log('SimpleAdmin: Render state', { loading, error, requestsCount: requests.length });

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Simple Admin - Loading...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Simple Admin - Error</h1>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Admin Portal</h1>
      <p className="mb-4">Total Requests: <strong>{requests.length}</strong></p>
      
      {requests.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No requests found in database.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p><strong>ID:</strong> {request.id}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${
                      request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {request.status}
                    </span>
                  </p>
                  <p><strong>User:</strong> {request.userId || 'N/A'}</p>
                </div>
                <div>
                  <p><strong>Amazon URL:</strong></p>
                  <a 
                    href={request.amazonUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm break-all"
                  >
                    {request.amazonUrl}
                  </a>
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Quick Actions:</h3>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}


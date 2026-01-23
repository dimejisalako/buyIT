"use client";
import { useState, useEffect } from "react";

export default function AdminTest() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/requests')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Test - Raw API Data</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
      
      {data?.requests?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Requests ({data.requests.length})</h2>
          {data.requests.map((req: any) => (
            <div key={req.id} className="border p-4 mb-4 rounded">
              <p><strong>ID:</strong> {req.id}</p>
              <p><strong>URL:</strong> <a href={req.amazonUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600">{req.amazonUrl}</a></p>
              <p><strong>Status:</strong> {req.status}</p>
              <p><strong>Submitted:</strong> {req.submittedAt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


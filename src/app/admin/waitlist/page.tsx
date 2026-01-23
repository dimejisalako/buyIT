"use client";
import { useState, useEffect } from "react";

interface WaitlistEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  consentEmail: boolean;
  consentSms: boolean;
  acceptedTerms: boolean;
  createdAt: string;
  ipAddress?: string;
}

export default function WaitlistAdmin() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchWaitlist = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/waitlist?adminKey=${adminKey}`);
      const data = await response.json();

      if (data.success) {
        setEntries(data.entries);
        setIsAuthenticated(true);
      } else {
        setError(data.error || "Failed to fetch waitlist");
        setIsAuthenticated(false);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if admin key is in localStorage
    const savedKey = localStorage.getItem("shopbrow-admin-key");
    if (savedKey) {
      setAdminKey(savedKey);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("shopbrow-admin-key", adminKey);
    fetchWaitlist();
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Consent Email", "Consent SMS", "Joined At"];
    const csvContent = [
      headers.join(","),
      ...entries.map((entry) =>
        [
          `"${entry.name}"`,
          `"${entry.email}"`,
          `"${entry.phone}"`,
          entry.consentEmail ? "Yes" : "No",
          entry.consentSms ? "Yes" : "No",
          new Date(entry.createdAt).toLocaleString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shopbrow-waitlist-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Waitlist Admin
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Admin Key
              </label>
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter admin key"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
            >
              {loading ? "Loading..." : "Access Waitlist"}
            </button>
          </form>
          <p className="text-slate-500 text-sm mt-4 text-center">
            Default key: <code className="bg-slate-700 px-2 py-1 rounded">shopbrow-admin-2026</code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Waitlist Dashboard</h1>
            <p className="text-slate-400 mt-1">
              {entries.length} {entries.length === 1 ? "person" : "people"} on the waitlist
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchWaitlist}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              disabled={entries.length === 0}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-white">{entries.length}</div>
            <div className="text-slate-400 text-sm">Total Signups</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-emerald-400">
              {entries.filter((e) => e.consentEmail).length}
            </div>
            <div className="text-slate-400 text-sm">Email Consent</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
            <div className="text-3xl font-bold text-amber-400">
              {entries.filter((e) => e.consentSms).length}
            </div>
            <div className="text-slate-400 text-sm">SMS Consent</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">#</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Name</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Email</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Phone</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Consent</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No entries yet. Share your landing page to start collecting signups!
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                      <td className="px-6 py-4 text-white font-medium">{entry.name}</td>
                      <td className="px-6 py-4 text-slate-300">{entry.email}</td>
                      <td className="px-6 py-4 text-slate-300">{entry.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {entry.consentEmail && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                              Email
                            </span>
                          )}
                          {entry.consentSms && (
                            <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                              SMS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(entry.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* File location info */}
        <div className="mt-8 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">📁 Data Storage Location</h3>
          <p className="text-slate-400 text-sm">
            Your waitlist data is stored locally in: <br />
            <code className="bg-slate-700 px-2 py-1 rounded text-emerald-400 mt-2 inline-block">
              {`{project-root}/waitlist-data.json`}
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}

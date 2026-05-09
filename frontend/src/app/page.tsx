"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { Search, Activity, MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";

// Data Types for Real-Time Event Payload
type GeoUpdate = {
  query: string;
  brand: string;
  model: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  timestamp: string;
  mockText?: string;
};

export default function Dashboard() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [query, setQuery] = useState("");
  const [brandName, setBrandName] = useState("");
  const [updates, setUpdates] = useState<GeoUpdate[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Establish Socket.io connection to backend
    const newSocket = io("http://localhost:4000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    // Listen for new tracking events
    newSocket.on("geo_update", (data: GeoUpdate) => {
      // Prepend the new update to the feed
      setUpdates((prev) => [data, ...prev]);
    });

    // Clean up socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query || !brandName) return;

    setIsTracking(true);

    try {
      // Start the tracking process on the backend
      const res = await fetch("http://localhost:4000/api/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, brandName }),
      });

      if (!res.ok) {
        console.error("Failed to start tracking API");
      }
    } catch (error) {
      console.error("Error calling track API:", error);
    } finally {
      // We set this to false immediately as the backend responds right away (202 Accepted)
      setIsTracking(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "Positive":
        return <TrendingUp className="w-4 h-4 text-emerald-400" />;
      case "Negative":
        return <TrendingDown className="w-4 h-4 text-rose-400" />;
      default:
        return <Minus className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 font-sans selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12 relative">
        
        {/* Background glow effects */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        {/* Dashboard Header */}
        <header className="flex items-center space-x-5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 backdrop-blur-md shadow-[0_0_30px_-5px_rgba(99,102,241,0.2)]">
            <Activity className="w-10 h-10 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-br from-white via-indigo-200 to-cyan-400 bg-clip-text text-transparent tracking-tight">
              GEO Analytics
            </h1>
            <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">
              Generative Engine Optimization Tracking Platform
            </p>
          </div>
        </header>

        {/* Control Panel (Glassmorphism UI) */}
        <section className="relative p-8 md:p-10 rounded-[2rem] bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl shadow-2xl overflow-hidden group">
          {/* Subtle animated border highlight */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          <form onSubmit={handleTrack} className="relative z-10 flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-semibold text-slate-300 ml-1 uppercase tracking-wider">Search Query</label>
              <div className="relative group/input">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. best project management tool"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/30 transition-all placeholder:text-slate-600 text-slate-100 shadow-inner"
                  required
                />
              </div>
            </div>
            
            <div className="flex-1 w-full space-y-3">
              <label className="text-sm font-semibold text-slate-300 ml-1 uppercase tracking-wider">Brand Name</label>
              <div className="relative group/input">
                <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="e.g. Asana"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/60 border border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/30 transition-all placeholder:text-slate-600 text-slate-100 shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isTracking}
              className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-2xl font-semibold transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] disabled:shadow-none hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.7)] flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              {isTracking ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-500/30 border-t-slate-300 rounded-full animate-spin"></div>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Real-Time Results Feed */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-3 tracking-tight">
              <MessageSquare className="w-6 h-6 text-cyan-400" />
              Live LLM Responses
            </h2>
            <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800/50">
              <div className="relative flex h-2.5 w-2.5">
                {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
              </div>
              <span className="text-sm font-medium text-slate-300">
                {isConnected ? 'Connected to Stream' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {updates.length === 0 ? (
              <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 border-2 border-dashed border-slate-800/60 rounded-[2rem]">
                <Activity className="w-16 h-16 mb-6 opacity-20" />
                <p className="text-lg font-medium">Waiting for LLM analysis events...</p>
                <p className="text-sm mt-2 opacity-60">Enter a query and brand name to start tracking</p>
              </div>
            ) : (
              updates.map((update, idx) => (
                <div
                  key={`${update.timestamp}-${idx}`}
                  className="group p-6 rounded-[1.5rem] bg-slate-900/40 border border-slate-800/60 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all duration-300 backdrop-blur-md relative overflow-hidden shadow-lg hover:shadow-[0_8px_30px_-10px_rgba(99,102,241,0.2)] animate-in fade-in slide-in-from-bottom-4"
                >
                  {/* Subtle top border accent */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex justify-between items-start mb-5">
                    <div className="px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm">
                      {update.model}
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border shadow-sm
                      ${update.sentiment === 'Positive' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                        update.sentiment === 'Negative' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                        'bg-slate-800/50 border-slate-700/50 text-slate-300'}`}
                    >
                      {getSentimentIcon(update.sentiment)}
                      <span>{update.sentiment}</span>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">Query</div>
                      <div className="text-sm font-medium text-slate-200 leading-relaxed">"{update.query}"</div>
                    </div>
                    
                    <div>
                      <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">Model Context</div>
                      <div className="text-sm text-slate-300 p-4 bg-slate-950/50 rounded-xl border border-slate-800/50 italic leading-relaxed">
                        "{update.mockText}"
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
                    <span>{update.brand}</span>
                    <span>{new Date(update.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

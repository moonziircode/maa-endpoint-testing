"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { UserProfile, TrackingResult } from "@/lib/types";
import { getOpcodeDescription } from "@/lib/opcode-map";
import { 
  Truck, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  User, 
  Package, 
  AlertCircle,
  Loader2
} from "lucide-react";

export default function TrackingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [awb, setAwb] = useState("11004249108088");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });
  }, []);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awb.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const resp = await fetch(`/api/tracking/${encodeURIComponent(awb.trim())}`);
      const data = await resp.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || "Nomor AWB tidak ditemukan");
      }
    } catch (err: any) {
      setError(err.message || "Gagal menghubungi server tracking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tracking Shipment Real-Time</h1>
            <p className="text-xs text-slate-500 mt-1">
              Lacak status pengiriman dan riwayat operasional berdasarkan nomor AWB / Resi.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <form onSubmit={handleTrack} className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={awb}
                  onChange={(e) => setAwb(e.target.value)}
                  placeholder="Masukkan Nomor Resi / AWB..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                  required
                />
                <Truck className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center space-x-2 shadow-xs transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>{loading ? "Melacak..." : "Lacak"}</span>
              </button>
            </form>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tracking Result Display */}
          {result && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Summary Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Nomor Resi</span>
                    <div className="text-xl font-black text-slate-900 font-mono">{result.awb}</div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Status Terkini</span>
                    <div className="text-sm font-bold text-red-600">{result.currentStatus}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Layanan</span>
                    <span className="font-bold text-slate-900">{result.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Asal (Origin)</span>
                    <span className="font-bold text-slate-900">{result.origin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Tujuan (Destination)</span>
                    <span className="font-bold text-slate-900">{result.destination}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Penerima</span>
                    <span className="font-bold text-slate-900">{result.receiverName}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-red-600" />
                  <span>Riwayat Perjalanan Paket</span>
                </h3>

                <div className="relative pl-6 border-l-2 border-red-100 space-y-8 ml-3">
                  {result.history && result.history.length > 0 ? (
                    result.history.map((ev, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-red-600 border-4 border-white shadow-xs" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1">
                          <span className="font-bold text-slate-900">
                            {ev.statusName} ({getOpcodeDescription(ev.statusCode)})
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">{ev.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600">{ev.message}</p>
                        {ev.location && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-2">
                      Paket baru tercatat di sistem gerai Anteraja (Dropoff Stage).
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

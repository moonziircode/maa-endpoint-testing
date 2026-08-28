"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { UserProfile, TrackingResult } from "@/lib/types";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  Search, 
  MapPin, 
  Clock, 
  Loader2, 
  Copy,
  Check
} from "lucide-react";

function TrackingInner() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [awb, setAwb] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });

    const paramAwb = searchParams?.get("awb");
    if (paramAwb) {
      setAwb(paramAwb);
      trackAwb(paramAwb);
    }
  }, [searchParams]);

  const trackAwb = async (trackingAwb: string) => {
    if (!trackingAwb.trim()) return;

    setLoading(true);
    setErrorDetail(null);
    setResult(null);

    try {
      const resp = await fetch(`/api/tracking/${encodeURIComponent(trackingAwb.trim())}`);
      const data = await resp.json();
      if (data.success) {
        setResult(data);
      } else {
        const rawErrMsg = data.error || data.message || "Nomor resi tidak ditemukan";
        setErrorDetail({
          title: "Resi Tidak Ditemukan",
          message: rawErrMsg,
          endpoint: `GET /api/tracking/${trackingAwb.trim()}`,
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setErrorDetail({
        title: "Kendala Koneksi",
        message: "Tidak dapat terhubung ke server pelacakan.",
        endpoint: `GET /api/tracking/${trackingAwb.trim()}`,
        statusCode: "Network Error",
        rawDetails: { error: err.message || String(err) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    trackAwb(awb);
  };

  const handleCopyAwb = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Lacak Paket</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cek riwayat perjalanan dan status pengiriman paket terkini.
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <form onSubmit={handleTrack} className="flex space-x-2">
              <input
                type="text"
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                placeholder="Masukkan nomor resi (AWB)..."
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />

              <button
                type="submit"
                disabled={loading || !awb.trim()}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>{loading ? "Melacak..." : "Lacak"}</span>
              </button>
            </form>
          </div>

          {/* Tracking Result Display */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Summary Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Nomor Resi</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-bold text-slate-900 font-mono">{result.awb}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyAwb(result.awb)}
                        className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                        title="Salin nomor resi"
                      >
                        {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Status Terkini</span>
                    <div className="text-xs font-bold text-red-600">{result.currentStatus}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Layanan</span>
                    <span className="font-semibold text-slate-900">{result.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Asal</span>
                    <span className="font-semibold text-slate-900 truncate block">{result.origin}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Tujuan</span>
                    <span className="font-semibold text-slate-900 truncate block">{result.destination}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-red-600" />
                  <span>Riwayat Perjalanan Paket</span>
                </h3>

                <div className="relative pl-5 border-l border-red-100 space-y-6 ml-2">
                  {result.history && result.history.length > 0 ? (
                    result.history.map((ev, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-red-600 border-2 border-white" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-0.5">
                          <span className="font-semibold text-slate-900">
                            {ev.statusName}
                          </span>
                          <span className="text-[11px] text-slate-400">{ev.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600">{ev.message}</p>
                        {ev.location && (
                          <div className="flex items-center space-x-1 text-[11px] text-slate-400 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            <span>{ev.location}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500 py-1">
                      Paket telah tercatat di gerai dan menunggu pickup kurir.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pop-up Modal Error Detail */}
      {errorDetail && (
        <ErrorModal
          isOpen={Boolean(errorDetail)}
          onClose={() => setErrorDetail(null)}
          title={errorDetail.title}
          message={errorDetail.message}
          endpoint={errorDetail.endpoint}
          statusCode={errorDetail.statusCode}
          rawDetails={errorDetail.rawDetails}
          timestamp={errorDetail.timestamp}
        />
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    }>
      <TrackingInner />
    </Suspense>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { UserProfile, ScanResult } from "@/lib/types";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  CheckCircle2, 
  AlertCircle, 
  Copy,
  Check,
  User, 
  MapPin,
  ArrowRight
} from "lucide-react";

export default function ScanPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);
  const [copiedAwb, setCopiedAwb] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      });
  }, []);

  const handleScan = async (awb: string) => {
    setLoading(true);
    setResult(null);
    setErrorDetail(null);
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awb })
      });
      const data = await resp.json();
      setResult(data);

      if (data.status === "ERROR") {
        setErrorDetail({
          title: "Scan Belum Berhasil",
          message: data.message || "Gagal memproses nomor resi.",
          endpoint: "POST /api/scan",
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e: any) {
      const errObj = {
        awb,
        status: "ERROR" as const,
        message: "Tidak dapat terhubung ke server. Silakan coba lagi."
      };
      setResult(errObj);
      setErrorDetail({
        title: "Kendala Koneksi",
        message: "Koneksi ke server terputus.",
        endpoint: "POST /api/scan",
        statusCode: "Network Error",
        rawDetails: { error: e.message || String(e) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAwb = (awbText: string) => {
    navigator.clipboard.writeText(awbText);
    setCopiedAwb(true);
    setTimeout(() => setCopiedAwb(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-3xl mx-auto w-full space-y-5">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Scan Paket Masuk</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Scan barcode resi dropoff pelanggan untuk dimasukkan ke tasklist penyerahan.
            </p>
          </div>

          {/* Scanner Card */}
          <BarcodeScanner onScan={handleScan} loading={loading} />

          {/* Scan Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Status Header Alert */}
              {result.status === "SUCCESS" && (
                <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-sm">Paket Berhasil Diproses</span>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full">
                      Masuk Tasklist
                    </span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold block uppercase">Nomor Resi (AWB)</span>
                      <span className="text-base font-mono font-bold text-slate-900">{result.awb}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyAwb(result.awb)}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 flex items-center space-x-1 transition-colors"
                    >
                      {copiedAwb ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedAwb ? "Tersalin" : "Salin"}</span>
                    </button>
                  </div>

                  {/* Shipper & Receiver Summary */}
                  {result.senderName && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                          <User className="w-3.5 h-3.5 text-red-500" />
                          <span>Pengirim:</span>
                        </div>
                        <div className="font-semibold text-slate-900">{result.senderName}</div>
                        <div className="text-slate-500 text-[11px] truncate">{result.senderAddress}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center space-x-1.5 font-bold text-slate-700 mb-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Penerima:</span>
                        </div>
                        <div className="font-semibold text-slate-900">{result.receiverName}</div>
                        <div className="text-slate-500 text-[11px] truncate">{result.receiverAddress}</div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <a
                      href="/tasklist"
                      className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center space-x-1"
                    >
                      <span>Lihat di Tasklist</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}

              {result.status === "ALREADY_CLAIMED" && (
                <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-amber-800">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Paket Sudah Pernah Di-scan</span>
                      <span className="text-xs text-slate-500">Resi ini sudah tercatat sebelumnya di sistem.</span>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "NOT_FOUND" && (
                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Nomor Resi Tidak Ditemukan</span>
                      <span className="text-xs text-slate-500">Pastikan nomor resi Anteraja yang Anda masukkan sudah benar.</span>
                    </div>
                  </div>
                </div>
              )}

              {result.status === "ERROR" && (
                <div className="p-5 bg-white border border-red-200 rounded-2xl shadow-xs space-y-3">
                  <div className="flex items-center space-x-2 text-red-800">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Paket Belum Dapat Diproses</span>
                      <span className="text-xs text-slate-600">{result.message || "Silakan coba lagi beberapa saat lagi."}</span>
                    </div>
                  </div>
                </div>
              )}
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

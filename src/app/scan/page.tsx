"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { UserProfile, ScanResult } from "@/lib/types";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Package, 
  User, 
  MapPin, 
  DollarSign,
  Clock,
  ShieldAlert,
  Copy
} from "lucide-react";

export default function ScanPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);

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
          title: "Kendala Scan / Validasi AWB",
          message: data.message || "Scan error",
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
        message: e.message || "Gagal menghubungi server scan"
      };
      setResult(errObj);
      setErrorDetail({
        title: "Kendala Jaringan Scan",
        message: e.message || String(e),
        endpoint: "POST /api/scan",
        statusCode: "Network / Client Error",
        rawDetails: { error: e.message || String(e) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Scan & Validasi Paket</h1>
            <p className="text-xs text-slate-500 mt-1">
              Verifikasi resi dropoff Anteraja, cek status klaim ganda, dan periksa detail pengiriman.
            </p>
          </div>

          {/* Scanner Card */}
          <BarcodeScanner onScan={handleScan} loading={loading} />

          {/* Scan Results */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Status Header Alert */}
              {result.status === "SUCCESS" && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">AWB Valid & Siap Diproses</span>
                      <span className="text-xs text-emerald-700 font-mono">{result.message}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-full">
                    AWB: {result.awb}
                  </span>
                </div>
              )}

              {result.status === "ALREADY_CLAIMED" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-amber-800">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Order Telah Diklaim Sebelumnya</span>
                      <span className="text-xs text-amber-700 font-mono">{result.message}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded-full">
                    STATUS: CLAIMED
                  </span>
                </div>
              )}

              {result.status === "NOT_FOUND" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">AWB Tidak Ditemukan</span>
                      <span className="text-xs text-red-700 font-mono">{result.message}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorDetail({
                        title: "Detail AWB Tidak Ditemukan",
                        message: result.message || "AWB Tidak Ditemukan",
                        endpoint: `GET /maa-task/order/v2/search/${result.awb}`,
                        statusCode: 404,
                        rawDetails: result,
                        timestamp: new Date().toISOString()
                      });
                    }}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kendala</span>
                  </button>
                </div>
              )}

              {result.status === "ERROR" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-red-800">
                  <div className="flex items-center space-x-3">
                    <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    <div>
                      <span className="font-bold text-sm block">Gagal Memproses AWB</span>
                      <span className="text-xs text-red-700 font-mono">{result.message}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorDetail({
                        title: "Detail Error Scan AWB",
                        message: result.message || "Error",
                        endpoint: "POST /api/scan",
                        statusCode: 500,
                        rawDetails: result,
                        timestamp: new Date().toISOString()
                      });
                    }}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Kendala</span>
                  </button>
                </div>
              )}

              {/* Rich Details Card */}
              {result.senderName && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                  {/* General Info */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Layanan</span>
                      <span className="text-sm font-bold text-slate-900">{result.productCode || "REG"}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Berat Paket</span>
                      <span className="text-sm font-bold text-slate-900">{result.weight || 1.0} Kg</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Ongkir</span>
                      <span className="text-sm font-bold text-red-600">
                        Rp {(result.deliveryPrice || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block font-medium">Metode Pembayaran</span>
                      <span className="text-sm font-bold text-slate-900">{result.isCod ? "COD" : "NON-COD / LUNAS"}</span>
                    </div>
                  </div>

                  {/* Shipper & Receiver Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Shipper */}
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2">
                        <User className="w-3.5 h-3.5 text-red-500" />
                        <span>PENGIRIM</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{result.senderName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{result.senderPhone}</div>
                      <div className="text-xs text-slate-600 mt-2 leading-relaxed">{result.senderAddress}</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{result.senderDistrict}</div>
                    </div>

                    {/* Receiver */}
                    <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 mb-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>PENERIMA</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">{result.receiverName}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{result.receiverPhone}</div>
                      <div className="text-xs text-slate-600 mt-2 leading-relaxed">{result.receiverAddress}</div>
                      <div className="text-xs font-semibold text-slate-800 mt-1">{result.receiverDistrict}</div>
                    </div>
                  </div>

                  {/* Items list */}
                  {result.itemDescription && (
                    <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-slate-700 font-medium">
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Deskripsi Barang: <strong>{result.itemDescription}</strong></span>
                      </div>
                      <span className="text-slate-500 font-medium">Klien: {result.client || "Marketplace / Reguler"}</span>
                    </div>
                  )}
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

"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { UserProfile, ScanResult } from "@/lib/types";
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Package, 
  User, 
  MapPin, 
  DollarSign,
  Clock,
  ShieldAlert
} from "lucide-react";

export default function ScanPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

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
    try {
      const resp = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ awb })
      });
      const data = await resp.json();
      setResult(data);
    } catch (e: any) {
      setResult({
        awb,
        status: "ERROR",
        message: e.message || "Gagal menghubungi server scan"
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
                      <span className="text-xs text-emerald-700">{result.message}</span>
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
                      <span className="text-xs text-amber-700">{result.message}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-mono font-bold rounded-full">
                    STATUS: CLAIMED
                  </span>
                </div>
              )}

              {result.status === "NOT_FOUND" && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center space-x-3 text-red-800">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-sm block">AWB Tidak Ditemukan</span>
                    <span className="text-xs text-red-700">{result.message}</span>
                  </div>
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
    </div>
  );
}

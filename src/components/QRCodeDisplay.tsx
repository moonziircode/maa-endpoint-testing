"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone
} from "lucide-react";

interface QRCodeDisplayProps {
  qrPayload: string;
  amount: number;
  transactionNo: string;
  onRefresh?: () => void;
  checking?: boolean;
  statusText?: string;
  isPaid?: boolean;
}

export function QRCodeDisplay({
  qrPayload,
  amount,
  transactionNo,
  onRefresh,
  checking = false,
  statusText = "Menunggu Pembayaran",
  isPaid = false
}: QRCodeDisplayProps) {
  const [viewMode, setViewMode] = useState<"bayaraja" | "qr">("bayaraja");
  const [iframeLoading, setIframeLoading] = useState(true);

  // Ensure URL is clean
  const paymentUrl = qrPayload && qrPayload.startsWith("http") 
    ? qrPayload 
    : `https://payment.anteraja.id/qrCode?token=${qrPayload}`;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 text-center max-w-lg mx-auto shadow-md space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Payment Gateway Anteraja (Bayaraja)</span>
        </div>
        <span className="text-[11px] bg-red-50 text-red-700 font-mono px-2 py-0.5 rounded-md font-semibold">
          {transactionNo || "TMAA"}
        </span>
      </div>

      {/* Amount Display */}
      <div>
        <span className="text-xs text-slate-400 font-medium block">Total Tagihan Resmi (Backend)</span>
        <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
          Rp {amount.toLocaleString("id-ID")}
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Metode: <strong className="text-slate-800">QRIS / GoPay / BCA / E-Wallet</strong>
        </div>
      </div>

      {/* Paid State */}
      {isPaid ? (
        <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-16 h-16 text-emerald-600" />
          <span className="font-bold text-lg">PEMBAYARAN TELAH LUNAS</span>
          <span className="text-xs text-emerald-600">Transaksi telah diverifikasi oleh gateway Anteraja</span>
        </div>
      ) : (
        <>
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("bayaraja")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                viewMode === "bayaraja"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Portal Bayaraja (Resmi MAA)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("qr")}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center space-x-1.5 transition-all ${
                viewMode === "qr"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code Langsung</span>
            </button>
          </div>

          {/* Container Body */}
          {viewMode === "bayaraja" ? (
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-inner h-[460px] flex flex-col">
              {iframeLoading && (
                <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center space-y-2 z-10">
                  <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
                  <span className="text-xs font-semibold">Memuat Portal Bayaraja Anteraja...</span>
                </div>
              )}
              <iframe
                src={paymentUrl}
                title="Anteraja Bayaraja Payment"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center my-2 space-y-3">
              <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-100">
                <QRCodeSVG
                  value={paymentUrl}
                  size={220}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-[11px] text-slate-500 max-w-xs leading-relaxed">
                Scan QR di atas untuk membuka portal pembayaran resmi Anteraja di perangkat pelanggan.
              </p>
            </div>
          )}

          {/* External Link Option */}
          <div className="flex items-center justify-center pt-1">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
            >
              <span>Buka Portal Bayaraja di Tab Penuh</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </>
      )}

      {/* Status & Action Buttons */}
      <div className="pt-2 space-y-3">
        <div className="flex items-center justify-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 animate-pulse"
          }`}>
            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
            {statusText}
          </span>
        </div>

        {!isPaid && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={checking}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Memeriksa Status..." : "Periksa Status Pembayaran"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

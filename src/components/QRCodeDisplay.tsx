"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  QrCode, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
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

  const paymentUrl = qrPayload && qrPayload.startsWith("http") 
    ? qrPayload 
    : `https://payment.anteraja.id/qrCode?token=${qrPayload}`;

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center max-w-md mx-auto shadow-xs space-y-4">
      {/* Amount Display */}
      <div>
        <span className="text-xs text-slate-400 font-medium block">Total Pembayaran</span>
        <div className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
          Rp {amount.toLocaleString("id-ID")}
        </div>
      </div>

      {/* Paid State */}
      {isPaid ? (
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center justify-center space-y-2 text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          <span className="font-bold text-base">Pembayaran Berhasil (Lunas)</span>
          <span className="text-xs text-emerald-600">Paket telah siap diproses</span>
        </div>
      ) : (
        <>
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode("bayaraja")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                viewMode === "bayaraja"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Portal Pembayaran</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("qr")}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1 transition-all ${
                viewMode === "qr"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR Code</span>
            </button>
          </div>

          {/* Container Body */}
          {viewMode === "bayaraja" ? (
            <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 h-[440px] flex flex-col">
              {iframeLoading && (
                <div className="absolute inset-0 bg-slate-900 text-white flex flex-col items-center justify-center space-y-2 z-10">
                  <RefreshCw className="w-5 h-5 animate-spin text-red-500" />
                  <span className="text-xs">Memuat QRIS...</span>
                </div>
              )}
              <iframe
                src={paymentUrl}
                title="Pembayaran QRIS Anteraja"
                onLoad={() => setIframeLoading(false)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center my-2 space-y-2">
              <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-100">
                <QRCodeSVG
                  value={paymentUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Scan QR di atas menggunakan GoPay / BCA / QRIS untuk membayar
              </p>
            </div>
          )}

          {/* External Link Option */}
          <div className="flex items-center justify-center pt-1">
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-slate-600 hover:text-red-600 font-medium"
            >
              <span>Buka di tab baru</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </>
      )}

      {/* Status & Action Buttons */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
          }`}>
            {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
            {statusText}
          </span>
        </div>

        {!isPaid && onRefresh && (
          <button
            onClick={onRefresh}
            disabled={checking}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Memeriksa..." : "Periksa Pembayaran"}</span>
          </button>
        )}
      </div>
    </div>
  );
}

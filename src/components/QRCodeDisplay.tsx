"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

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
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center max-w-sm mx-auto shadow-sm">
      <div className="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
        <QrCode className="w-4 h-4 text-red-600" />
        <span>Pembayaran QRIS / GoPay</span>
      </div>

      <div className="text-2xl font-black text-slate-900 mb-1">
        Rp {amount.toLocaleString("id-ID")}
      </div>
      <div className="text-xs text-slate-400 font-mono mb-4">
        Ref: {transactionNo}
      </div>

      {/* QR Box */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-center my-3 relative">
        {isPaid ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2 text-emerald-600">
            <CheckCircle2 className="w-16 h-16" />
            <span className="font-bold text-lg">PEMBAYARAN LUNAS</span>
          </div>
        ) : (
          <QRCodeSVG
            value={qrPayload || "https://payment.anteraja.id"}
            size={200}
            level="M"
            includeMargin={true}
          />
        )}
      </div>

      {/* Status Badge */}
      <div className="mt-4 flex items-center justify-center space-x-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          isPaid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700 animate-pulse"
        }`}>
          {isPaid ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <AlertCircle className="w-3.5 h-3.5 mr-1" />}
          {statusText}
        </span>
      </div>

      {/* Check Status Button */}
      {!isPaid && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={checking}
          className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? "animate-spin" : ""}`} />
          <span>{checking ? "Memeriksa..." : "Periksa Status Pembayaran"}</span>
        </button>
      )}
    </div>
  );
}

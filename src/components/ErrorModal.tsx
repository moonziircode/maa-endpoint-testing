"use client";

import React, { useState } from "react";
import { AlertOctagon, Copy, Check, X, Terminal, Server, Clock } from "lucide-react";

export interface ErrorDetail {
  title?: string;
  message: string;
  endpoint?: string;
  statusCode?: number | string;
  rawDetails?: any;
  timestamp?: string;
}

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  endpoint?: string;
  statusCode?: number | string;
  rawDetails?: any;
  timestamp?: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title = "Detail Kendala Sistem",
  message,
  endpoint,
  statusCode,
  rawDetails,
  timestamp = new Date().toISOString()
}: ErrorModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const formattedRaw = typeof rawDetails === "object" 
    ? JSON.stringify(rawDetails, null, 2) 
    : String(rawDetails || message);

  const fullDiagnosticText = `=== DETAIL KENDALA SISTEM ANTERAJA MAA ===
Waktu      : ${timestamp}
Endpoint   : ${endpoint || "N/A"}
HTTP Status: ${statusCode || "N/A"}
Pesan Error: ${message}

Detail Teknis / Raw Response:
${formattedRaw}
==========================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDiagnosticText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-red-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertOctagon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">{title}</h3>
              <p className="text-xs text-red-100 mt-0.5">Pesan error sistem ditulis apa adanya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-800 text-sm">
          {/* Main Verbatim Error Message Box */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-800 block mb-1">
              Pesan Error Utama (Verbatim)
            </span>
            <p className="font-mono text-xs text-red-900 font-semibold break-words leading-relaxed">
              {message}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {endpoint && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2">
                <Server className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Endpoint</span>
                  <span className="font-mono font-bold text-slate-800 truncate block">{endpoint}</span>
                </div>
              </div>
            )}

            {statusCode && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-2">
                <Terminal className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Status Code</span>
                  <span className="font-mono font-bold text-red-600">HTTP {statusCode}</span>
                </div>
              </div>
            )}
          </div>

          {/* Raw JSON / Technical Trace Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5" />
                <span>Raw Response / Payload Data</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">JSON Object</span>
            </div>
            <pre className="p-3.5 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed border border-slate-800">
              {formattedRaw}
            </pre>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Tercatat pada: {timestamp}</span>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between space-x-3">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all shadow-sm ${
              copied
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>✓ Detail Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Detail Kendala</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

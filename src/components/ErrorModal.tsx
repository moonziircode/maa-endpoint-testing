"use client";

import React, { useState } from "react";
import { AlertCircle, Copy, Check, X, ChevronDown, ChevronUp } from "lucide-react";

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
  title = "Pemberitahuan",
  message,
  endpoint,
  statusCode,
  rawDetails,
  timestamp = new Date().toISOString()
}: ErrorModalProps) {
  const [copied, setCopied] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);

  if (!isOpen) return null;

  const formattedRaw = typeof rawDetails === "object" 
    ? JSON.stringify(rawDetails, null, 2) 
    : String(rawDetails || message);

  const fullDiagnosticText = `=== DETAIL KENDALA ANTERAJA MAA ===
Waktu      : ${timestamp}
Endpoint   : ${endpoint || "N/A"}
Status Code: ${statusCode || "N/A"}
Pesan      : ${message}

Raw Data:
${formattedRaw}
===================================`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullDiagnosticText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-red-600 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 text-xs">
          <p className="text-slate-700 leading-relaxed font-medium">
            {message}
          </p>

          {/* Collapsible Technical Info for Office/Admin */}
          {(endpoint || statusCode || rawDetails) && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTechnical(!showTechnical)}
                className="flex items-center justify-between w-full text-slate-500 hover:text-slate-800 text-[11px] font-medium py-1"
              >
                <span>{showTechnical ? "Sembunyikan Info Teknis" : "Info Teknis (Office / Support)"}</span>
                {showTechnical ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showTechnical && (
                <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 font-mono text-[10px]">
                  {endpoint && <div><strong>Endpoint:</strong> {endpoint}</div>}
                  {statusCode && <div><strong>Status:</strong> HTTP {statusCode}</div>}
                  <div className="pt-1">
                    <pre className="p-2 bg-slate-900 text-emerald-400 rounded-lg overflow-x-auto max-h-32 leading-relaxed">
                      {formattedRaw}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between space-x-2">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Tersalin" : "Salin Info"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

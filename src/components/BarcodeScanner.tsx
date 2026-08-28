"use client";

import React, { useState, useEffect } from "react";
import { Camera, Search } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface BarcodeScannerProps {
  onScan: (awb: string) => void;
  loading?: boolean;
}

export function BarcodeScanner({ onScan, loading = false }: BarcodeScannerProps) {
  const [manualAwb, setManualAwb] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (cameraActive) {
      scanner = new Html5QrcodeScanner(
        "camera-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          onScan(decodedText);
          setCameraActive(false);
          scanner?.clear();
        },
        () => {
          // ignore frame scan errors
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [cameraActive, onScan]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualAwb.trim()) {
      onScan(manualAwb.trim());
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nomor Resi / AWB
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={manualAwb}
              onChange={(e) => setManualAwb(e.target.value)}
              placeholder="Masukkan nomor resi..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || !manualAwb.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{loading ? "Memproses..." : "Proses"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            Dapat menggunakan scanner barcode USB atau input keyboard
          </span>

          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className="flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cameraActive ? "Tutup Kamera" : "Buka Kamera"}</span>
          </button>
        </div>

        {cameraActive && (
          <div className="mt-3 p-3 bg-slate-900 rounded-xl overflow-hidden">
            <div id="camera-reader" className="w-full"></div>
          </div>
        )}
      </form>
    </div>
  );
}

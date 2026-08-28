"use client";

import React, { useState, useEffect } from "react";
import { Camera, QrCode, Search, AlertCircle } from "lucide-react";
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
        (error) => {
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Nomor Resi / AWB / Barcode
          </label>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualAwb}
                onChange={(e) => setManualAwb(e.target.value)}
                placeholder="Contoh: 11004249108088 atau scan barcode..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-base font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                autoFocus
              />
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading || !manualAwb.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm flex items-center space-x-2 shadow-xs transition-all"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? "Memeriksa..." : "Cari / Scan"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Mendukung barcode scanner USB & input manual</span>
          </div>

          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-red-600 transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>{cameraActive ? "Tutup Kamera" : "Gunakan Kamera HP/Webcam"}</span>
          </button>
        </div>

        {cameraActive && (
          <div className="mt-4 p-3 bg-slate-900 rounded-xl overflow-hidden">
            <div id="camera-reader" className="w-full"></div>
          </div>
        )}
      </form>
    </div>
  );
}

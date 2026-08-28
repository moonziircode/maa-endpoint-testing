"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("50004786");
  const [password, setPassword] = useState("aa12345");
  const [loading, setLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetail(null);
    setLoading(true);

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await resp.json();
      if (data.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        const rawErr = data.error || "Login gagal";
        setErrorDetail({
          title: "Kendala Autentikasi CAS SSO",
          message: rawErr,
          endpoint: "POST /api/auth/login",
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setErrorDetail({
        title: "Kendala Jaringan / Server",
        message: err.message || String(err),
        endpoint: "POST /api/auth/login",
        statusCode: "Network / Client Error",
        rawDetails: { error: err.message || String(err) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-red-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-red-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-white font-black text-2xl tracking-tighter">
            A
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ANTERAJA MAA</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Mitra Agent Portal Web</p>
        </div>

        {/* Error Alert Inline with Click for Details */}
        {errorDetail && (
          <div 
            onClick={() => {}}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start justify-between space-x-3 text-red-800 text-xs shadow-sm"
          >
            <div className="flex items-start space-x-2.5 min-w-0">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <span className="font-bold block text-red-900">Autentikasi Gagal (HTTP {errorDetail.statusCode})</span>
                <span className="font-mono break-words">{errorDetail.message}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(errorDetail, null, 2));
              }}
              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[10px] flex-shrink-0 transition-colors"
            >
              Salin
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Nomor Induk Agent (NIA) / Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: 50004786"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password CAS SSO
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses CAS SSO...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk ke Dashboard MAA</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <div className="text-[11px] text-slate-400 font-medium">
            Terhubung langsung dengan SSO CAS Anteraja & Master Database Supabase
          </div>
        </div>
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

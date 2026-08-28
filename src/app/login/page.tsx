"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        const rawErr = data.error || "Nomor Induk Agen atau kata sandi tidak sesuai";
        setErrorDetail({
          title: "Login Belum Berhasil",
          message: rawErr,
          endpoint: "POST /api/auth/login",
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setErrorDetail({
        title: "Kendala Koneksi",
        message: "Tidak dapat terhubung ke server. Silakan periksa koneksi internet Anda.",
        endpoint: "POST /api/auth/login",
        statusCode: "Network Error",
        rawDetails: { error: err.message || String(err) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-3 text-white font-black text-xl tracking-tight">
            A
          </div>
          <h1 className="text-lg font-bold text-slate-900">Masuk Mitra Anteraja</h1>
          <p className="text-xs text-slate-500 mt-0.5">Silakan masuk menggunakan akun agen Anda</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor Induk Agen (NIA)
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan NIA"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                required
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memeriksa Akun...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>
        </form>
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

import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { 
  QrCode, 
  PackagePlus, 
  Truck, 
  Store, 
  MapPin, 
  Phone, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-xs mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Akun Terverifikasi CAS Anteraja</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">{user.agentShopName}</h1>
              <p className="text-slate-300 text-sm mt-2 leading-relaxed">
                Selamat datang kembali, <strong>{user.name}</strong>. Anda terhubung sebagai Agent Staff dengan NIA <strong>{user.username}</strong> di Distrik <strong>{user.agentShopDistrict}</strong>.
              </p>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-red-600/20 to-transparent pointer-events-none" />
          </div>

          {/* Quick Action Cards */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Aksi Cepat Menu Utama</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Scan Paket */}
              <a
                href="/scan"
                className="bg-white border border-slate-200 hover:border-red-500 rounded-2xl p-6 transition-all hover:shadow-md group block"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <QrCode className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Scan Paket / AWB</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scan barcode resi dropoff dan validasi status kepemilikan/claim paket secara real-time.
                </p>
              </a>

              {/* Buat Order Manual */}
              <a
                href="/order/create"
                className="bg-white border border-slate-200 hover:border-red-500 rounded-2xl p-6 transition-all hover:shadow-md group block"
              >
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PackagePlus className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Buat Order Manual</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Input order manual, hitung tarif ongkir resmi, kode promo, dan cetak QRIS pembayaran.
                </p>
              </a>

              {/* Tracking Shipment */}
              <a
                href="/tracking"
                className="bg-white border border-slate-200 hover:border-red-500 rounded-2xl p-6 transition-all hover:shadow-md group block"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Tracking Shipment</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Lacak posisi paket terkini dengan timeline riwayat operasional dan pemetaan opcode.
                </p>
              </a>
            </div>
          </div>

          {/* Profile & Outlet Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Store className="w-4 h-4 text-red-600" />
                <span>Informasi Gerai / Outlet</span>
              </h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Nama Gerai</dt>
                  <dd className="font-semibold text-slate-900">{user.agentShopName}</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">District Origin Code</dt>
                  <dd className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    {user.agentShopDistrict}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Agent Staff UUID</dt>
                  <dd className="font-mono text-slate-600 truncate max-w-[200px]">{user.agentStaffId}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span>Database & Integrasi Cloud</span>
              </h3>
              <dl className="divide-y divide-slate-100 text-xs">
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Supabase Master Database</dt>
                  <dd className="font-semibold text-emerald-600">6.545 Kecamatan (Active)</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">API Gateway Anteraja</dt>
                  <dd className="font-semibold text-slate-900">api.anteraja.id (Live)</dd>
                </div>
                <div className="py-2.5 flex justify-between">
                  <dt className="text-slate-500">Otentikasi SSO</dt>
                  <dd className="font-semibold text-slate-900">cas.anteraja.id (Encrypted Session)</dd>
                </div>
              </dl>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

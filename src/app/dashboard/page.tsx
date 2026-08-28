import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getTasklist } from "@/lib/anteraja-api";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { 
  QrCode, 
  PackagePlus, 
  Search, 
  ClipboardList,
  ArrowRight,
  Package
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  // Live count of waiting pickup tasks
  let waitingPickupCount = 0;
  try {
    const taskResult = await getTasklist(session.token, { size: 100 });
    if (taskResult.success && taskResult.tasks) {
      waitingPickupCount = taskResult.tasks.filter((t) => t.taskStatus !== "SUDAH_SERAH" && t.taskStatus !== "PICKED_UP").length;
    }
  } catch (e) {
    waitingPickupCount = 0;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
          {/* Friendly Greeting Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-500 font-medium block mb-0.5">{user.agentShopName}</span>
              <h1 className="text-xl font-bold text-slate-900">Halo, {user.name} 👋</h1>
              <p className="text-xs text-slate-500 mt-1">
                Pilih menu di bawah untuk memulai operasional gerai hari ini.
              </p>
            </div>

            {/* Actionable Waiting Pickup Counter */}
            <a 
              href="/tasklist"
              className="bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl p-4 flex items-center space-x-3 transition-colors group flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl font-black text-red-600 leading-tight">
                  {waitingPickupCount} Paket
                </div>
                <div className="text-[11px] text-slate-600 font-semibold flex items-center space-x-1">
                  <span>Menunggu Pickup</span>
                  <ArrowRight className="w-3 h-3 text-red-600 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </a>
          </div>

          {/* 4 Main Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Scan Paket */}
            <a
              href="/scan"
              className="bg-white border border-slate-100 hover:border-red-300 rounded-2xl p-5 transition-all shadow-xs group block"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Scan Paket Masuk
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Scan barcode resi dropoff pelanggan dan masukkan ke daftar tasklist.
              </p>
            </a>

            {/* Buat Order */}
            <a
              href="/order/create"
              className="bg-white border border-slate-100 hover:border-red-300 rounded-2xl p-5 transition-all shadow-xs group block"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Buat Order Baru
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Input pengiriman manual, cek tarif ongkir, dan cetak QRIS pembayaran.
              </p>
            </a>

            {/* Tasklist */}
            <a
              href="/tasklist"
              className="bg-white border border-slate-100 hover:border-red-300 rounded-2xl p-5 transition-all shadow-xs group block"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Tasklist Penyerahan
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Lihat daftar paket yang siap diserahkan saat kurir Satria datang pickup.
              </p>
            </a>

            {/* Lacak Resi */}
            <a
              href="/tracking"
              className="bg-white border border-slate-100 hover:border-red-300 rounded-2xl p-5 transition-all shadow-xs group block"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors">
                  Lacak Paket
                </h2>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cek status dan posisi paket terkini berdasarkan nomor resi (AWB).
              </p>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}

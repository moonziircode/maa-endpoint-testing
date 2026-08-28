"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  ClipboardList, 
  Search, 
  RefreshCw, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  Filter,
  ArrowUpDown,
  Phone,
  MapPin,
  Tag
} from "lucide-react";
import { MaaTaskItem, UserProfile } from "@/lib/types";

export default function TasklistPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [tasks, setTasks] = useState<MaaTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dropoff" | "titip" | "tertunda" | "sudah_serah">("dropoff");
  const [searchKey, setSearchKey] = useState("");
  const [summary, setSummary] = useState({
    outstandingPickup: 0,
    dropoffCount: 0,
    titipPickupCount: 0,
    tertundaCount: 0,
    deliveryCount: 0
  });
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
    loadTasklist(activeTab, "");
  }, []);

  const loadTasklist = async (tab: string, query: string) => {
    setLoading(true);
    setErrorDetail(null);
    try {
      const params = new URLSearchParams({
        tab,
        key: query,
        page: "0",
        size: "50"
      });
      const resp = await fetch(`/api/tasklist?${params.toString()}`);
      const data = await resp.json();

      if (data.success && Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        if (data.summary) {
          setSummary(data.summary);
        }
      } else {
        setTasks([]);
        setErrorDetail({
          title: "Gagal Memuat Tasklist",
          message: data.message || "Gagal mengambil data tasklist dari Anteraja Gateway",
          endpoint: `GET /api/tasklist?${params.toString()}`,
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e: any) {
      setTasks([]);
      setErrorDetail({
        title: "Kendala Jaringan Tasklist",
        message: e.message || String(e),
        endpoint: "GET /api/tasklist",
        statusCode: "Network / Client Error",
        rawDetails: { error: e.message || String(e) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: "dropoff" | "titip" | "tertunda" | "sudah_serah") => {
    setActiveTab(newTab);
    loadTasklist(newTab, searchKey);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadTasklist(activeTab, searchKey);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(text);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                <ClipboardList className="w-4 h-4" />
                <span>Logistics Operations & Handover Queue</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Tasklist Paket Mitra (Belum Diserahkan ke Satria)
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Daftar resi/task yang telah di-scan oleh Mitra dan sedang menunggu proses pickup oleh Satria/Kurir.
              </p>
            </div>

            <button
              onClick={() => loadTasklist(activeTab, searchKey)}
              disabled={loading}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
              <span>{loading ? "Memuat..." : "Segarkan Data"}</span>
            </button>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Menunggu Pickup
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {summary.outstandingPickup}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Dropoff Aktif
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {summary.dropoffCount}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Titip Pickup
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {summary.titipPickupCount}
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Terkonfirmasi Bayar
                </span>
                <span className="text-2xl font-black text-slate-900">
                  {tasks.filter(t => t.paymentStatus === "PAID").length}
                </span>
              </div>
            </div>
          </div>

          {/* Tab Navigation & Search Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              {/* Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTabChange("dropoff")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "dropoff"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Dropoff (Menunggu Pickup)
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("titip")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "titip"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Titip Pickup
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("tertunda")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "tertunda"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tertunda (On-Hold)
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("sudah_serah")}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    activeTab === "sudah_serah"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Sudah Serah (Riwayat)
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full lg:w-80">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="Cari No. AWB / Task Code..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Tasklist Table & Content */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
                <span className="text-xs font-semibold">Memuat data tasklist dari Anteraja Gateway...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Tidak Ada Paket di Tasklist</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Saat ini tidak ada paket yang berstatus menunggu pickup untuk filter yang dipilih. Seluruh paket telah diserahkan ke Satria atau belum ada transaksi baru.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4">No. AWB / Task Code</th>
                      <th className="py-3.5 px-4">Layanan</th>
                      <th className="py-3.5 px-4">Pengirim</th>
                      <th className="py-3.5 px-4">Penerima & Tujuan</th>
                      <th className="py-3.5 px-4 text-right">Tarif & Berat</th>
                      <th className="py-3.5 px-4 text-center">Status Operasional</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => {
                      const displayCode = task.waybillNo || task.taskCode;
                      return (
                        <tr key={task.taskCode} className="hover:bg-slate-50/80 transition-colors">
                          {/* AWB & Task Code */}
                          <td className="py-4 px-4 align-top">
                            <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                              <span>{displayCode}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(displayCode, "AWB")}
                                title="Salin No. Resi"
                                className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                              Task: {task.taskCode}
                            </span>
                            {copiedAwb === displayCode && (
                              <span className="text-[10px] text-emerald-600 font-bold block animate-in fade-in">
                                Disalin!
                              </span>
                            )}
                          </td>

                          {/* Service */}
                          <td className="py-4 px-4 align-top">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-100">
                              {task.productCode || "REG"}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {task.productName || "Anteraja Regular"}
                            </span>
                          </td>

                          {/* Shipper */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-slate-800">{task.shipperName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{task.shipperPhone}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {task.shipperDistrict || "-"}
                            </span>
                          </td>

                          {/* Receiver */}
                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-slate-800">{task.receiverName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{task.receiverPhone}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate max-w-xs">{task.receiverAddress || task.receiverDistrict || "-"}</span>
                            </div>
                          </td>

                          {/* Price & Weight */}
                          <td className="py-4 px-4 align-top text-right">
                            <div className="font-bold text-slate-900">
                              Rp {task.deliveryPrice.toLocaleString("id-ID")}
                            </div>
                            <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                              {task.parcelTotalWeight} KG
                            </span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ${
                              task.paymentStatus === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                            }`}>
                              {task.paymentStatus === "PAID" ? "LUNAS" : "BELUM BAYAR"}
                            </span>
                          </td>

                          {/* Operational Status */}
                          <td className="py-4 px-4 align-top text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              task.taskStatus === "SUDAH_SERAH" || task.taskStatus === "PICKED_UP"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800 animate-pulse"
                            }`}>
                              {task.taskStatus === "SUDAH_SERAH" || task.taskStatus === "PICKED_UP" ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Sudah Serah Satria
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Menunggu Pickup Satria
                                </>
                              )}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Tanggung Jawab: {task.taskStatus === "SUDAH_SERAH" || task.taskStatus === "PICKED_UP" ? "Operasional Satria" : "Mitra Counter"}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-4 px-4 align-top text-right">
                            <a
                              href={`/tracking?awb=${encodeURIComponent(task.waybillNo || task.taskCode)}`}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
                            >
                              <span>Lacak</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

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

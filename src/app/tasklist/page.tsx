"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  Search, 
  RefreshCw, 
  Package, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Check,
  ExternalLink
} from "lucide-react";
import { MaaTaskItem, UserProfile } from "@/lib/types";

function getFriendlyServiceName(code: string): string {
  switch (code) {
    case "REG": return "Regular";
    case "ND": return "Next Day";
    case "SD": return "Same Day";
    case "ECO": return "Economy";
    case "CARGO": return "Cargo";
    default: return code;
  }
}

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
          title: "Pemberitahuan",
          message: data.message || "Gagal memuat daftar tasklist.",
          endpoint: `GET /api/tasklist?${params.toString()}`,
          statusCode: resp.status,
          rawDetails: data,
          timestamp: new Date().toISOString()
        });
      }
    } catch (e: any) {
      setTasks([]);
      setErrorDetail({
        title: "Kendala Koneksi",
        message: "Tidak dapat terhubung ke server. Silakan coba lagi.",
        endpoint: "GET /api/tasklist",
        statusCode: "Network Error",
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(text);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 space-y-5 max-w-6xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Tasklist Penyerahan Paket
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar paket yang siap diserahkan saat kurir Satria datang pickup ke gerai.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl border border-red-100">
                {summary.outstandingPickup} Menunggu Pickup
              </span>
              <button
                onClick={() => loadTasklist(activeTab, searchKey)}
                disabled={loading}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
                title="Segarkan data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-red-600" : ""}`} />
              </button>
            </div>
          </div>

          {/* Search & Tabs */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Tabs */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleTabChange("dropoff")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "dropoff"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Menunggu Pickup ({summary.dropoffCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("titip")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "titip"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Titip Pickup ({summary.titipPickupCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("tertunda")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "tertunda"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Tertunda ({summary.tertundaCount})
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("sudah_serah")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "sudah_serah"
                      ? "bg-white text-slate-900 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Riwayat Serah
                </button>
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-72">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="Cari nomor resi..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
                >
                  Cari
                </button>
              </form>
            </div>

            {/* Tasklist Content */}
            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center space-y-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                <span className="text-xs">Memuat data paket...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Tidak ada paket di daftar ini</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Belum ada paket yang menunggu penyerahan untuk kategori yang dipilih.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3 px-3">Nomor Resi (AWB)</th>
                      <th className="py-3 px-3">Layanan</th>
                      <th className="py-3 px-3">Penerima & Tujuan</th>
                      <th className="py-3 px-3 text-right">Ongkir & Berat</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tasks.map((task) => {
                      const displayAwb = task.waybillNo || task.taskCode;
                      const isPickedUp = task.taskStatus === "SUDAH_SERAH" || task.taskStatus === "PICKED_UP";
                      return (
                        <tr key={task.taskCode} className="hover:bg-slate-50/60 transition-colors">
                          {/* AWB */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                              <span>{displayAwb}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(displayAwb)}
                                title="Salin resi"
                                className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                              >
                                {copiedAwb === displayAwb ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Service */}
                          <td className="py-3.5 px-3 align-middle">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                              {getFriendlyServiceName(task.productCode || "REG")}
                            </span>
                          </td>

                          {/* Receiver & Destination */}
                          <td className="py-3.5 px-3 align-middle">
                            <div className="font-semibold text-slate-900">{task.receiverName}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">
                              {task.receiverAddress || task.receiverDistrict || "-"}
                            </div>
                          </td>

                          {/* Price & Weight */}
                          <td className="py-3.5 px-3 align-middle text-right">
                            <div className="font-bold text-slate-900">
                              Rp {task.deliveryPrice.toLocaleString("id-ID")}
                            </div>
                            <span className="text-[11px] text-slate-400 block">
                              {task.parcelTotalWeight} kg
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3 align-middle text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                              isPickedUp
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {isPickedUp ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Sudah Di-pickup
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Menunggu Pickup
                                </>
                              )}
                            </span>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-3 align-middle text-right">
                            <a
                              href={`/tracking?awb=${encodeURIComponent(displayAwb)}`}
                              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
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

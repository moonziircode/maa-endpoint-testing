"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { DistrictSelector } from "@/components/DistrictSelector";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { UserProfile, District, TariffItem } from "@/lib/types";
import { ErrorModal, ErrorDetail } from "@/components/ErrorModal";
import { 
  CheckCircle2, 
  QrCode, 
  Loader2, 
  Plus
} from "lucide-react";

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

export default function CreateOrderPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form State - DEFAULT EMPTY
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderDistrict, setSenderDistrict] = useState("");
  const [senderPostalCode, setSenderPostalCode] = useState("");

  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverDistrict, setReceiverDistrict] = useState("");
  const [receiverPostalCode, setReceiverPostalCode] = useState("");

  const [itemName, setItemName] = useState("");
  const [weight, setWeight] = useState(1.0);
  const [showDimension, setShowDimension] = useState(false);
  const [length, setLength] = useState(10);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [productCode, setProductCode] = useState("REG");

  // Rates & Promo
  const [rates, setRates] = useState<TariffItem[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");

  // Payment & Creation State
  const [creating, setCreating] = useState(false);
  const [taskCode, setTaskCode] = useState("");
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [errorDetail, setErrorDetail] = useState<ErrorDetail | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          if (data.user.agentShopDistrict && !senderDistrict) {
            setSenderDistrict(data.user.agentShopDistrict);
          }
          if (data.user.agentShopName && !senderName) {
            setSenderName(data.user.agentShopName);
          }
        }
      });
  }, []);

  // Automatically recalculate rates when origin, destination, weight or dimensions change
  useEffect(() => {
    if (senderDistrict && receiverDistrict) {
      handleCalculateRates();
    }
  }, [senderDistrict, receiverDistrict, weight, length, width, height]);

  const handleCalculateRates = async () => {
    setLoadingRates(true);
    try {
      const resp = await fetch("/api/order/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: senderDistrict,
          destination: receiverDistrict,
          weight,
          length,
          width,
          height
        })
      });
      const data = await resp.json();
      if (data.success) {
        setRates(data.rates || []);
        if (data.rates && data.rates.length > 0) {
          const currentExists = data.rates.some((r: any) => r.product_code === productCode);
          if (!currentExists) {
            setProductCode(data.rates[0].product_code);
          }
        }
      }
    } catch (e) {
      console.error("[Rate Calculation Error]:", e);
    } finally {
      setLoadingRates(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const resp = await fetch("/api/order/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promoCode })
      });
      const data = await resp.json();
      if (data.valid) {
        setDiscount(data.discountAmount || 0);
        setPromoMessage(data.message || "Promo berhasil diterapkan");
      } else {
        setDiscount(0);
        setPromoMessage(data.message || "Kode promo tidak berlaku");
      }
    } catch (e: any) {
      setPromoMessage("Gagal memvalidasi kode promo");
    }
  };

  const selectedRate = rates.find((r) => r.product_code === productCode);
  const baseShippingFee = selectedRate ? selectedRate.delivery_price : 11500;
  const finalAmount = Math.max(0, baseShippingFee - discount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorDetail(null);

    try {
      // Step 1: Create Dropoff Task with selected service rate
      const dropResp = await fetch("/api/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderPhone,
          senderAddress,
          senderDistrict,
          senderPostalCode,
          receiverName,
          receiverPhone,
          receiverAddress,
          receiverDistrict,
          receiverPostalCode,
          itemName,
          weight,
          length,
          width,
          height,
          productCode,
          deliveryPrice: baseShippingFee
        })
      });

      const dropData = await dropResp.json();
      if (!dropData.success || !dropData.taskCode) {
        const rawErrMsg = dropData.error || dropData.message || "Gagal membuat order dropoff";
        setErrorDetail({
          title: "Order Belum Berhasil",
          message: rawErrMsg,
          endpoint: "POST /api/order/create",
          statusCode: dropResp.status,
          rawDetails: dropData,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const generatedTaskCode = dropData.taskCode;
      setTaskCode(generatedTaskCode);
      const actualPayableAmount = dropData.deliveryPrice 
        ? Math.max(0, dropData.deliveryPrice - discount) 
        : finalAmount;

      // Step 2: Initiate QR Payment using real backend payable amount
      const payResp = await fetch("/api/order/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: generatedTaskCode,
          amount: actualPayableAmount,
          promoCode,
          paymentCode: "006"
        })
      });

      const payData = await payResp.json();
      if (!payData.success) {
        const rawErrMsg = payData.error || payData.message || "Gagal menyiapkan pembayaran QR";
        setErrorDetail({
          title: "Pembayaran Belum Berhasil",
          message: rawErrMsg,
          endpoint: "POST /api/order/payment/initiate",
          statusCode: payResp.status,
          rawDetails: payData,
          timestamp: new Date().toISOString()
        });
        return;
      }

      setPaymentData(payData);
    } catch (err: any) {
      setErrorDetail({
        title: "Kendala Koneksi",
        message: "Tidak dapat terhubung ke server. Silakan periksa jaringan internet Anda.",
        endpoint: "POST /api/order/create",
        statusCode: "Network Error",
        rawDetails: { error: err.message || String(err) },
        timestamp: new Date().toISOString()
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCheckPayment = async () => {
    if (!taskCode) return;
    setCheckingPayment(true);
    try {
      const resp = await fetch("/api/order/payment/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskCode })
      });
      const data = await resp.json();
      if (data.paid) {
        setIsPaid(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />

        <main className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Buat Order Baru</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Isi data pengiriman pelanggan untuk membuat resi dan pembayaran QRIS.
            </p>
          </div>

          {!paymentData ? (
            <form onSubmit={handleSubmitOrder} className="space-y-5">
              {/* Sender & Receiver Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Sender Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-xs">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Pengirim
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Nama pengirim"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nomor HP</label>
                    <input
                      type="tel"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Alamat</label>
                    <textarea
                      rows={2}
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      placeholder="Alamat lengkap pengirim"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                      required
                    />
                  </div>

                  <DistrictSelector
                    label="Kecamatan Pengirim"
                    value={senderDistrict}
                    onChange={(d: District) => {
                      setSenderDistrict(d.dist_code);
                      if (d.postal_code) setSenderPostalCode(d.postal_code.split(",")[0]);
                    }}
                  />
                </div>

                {/* Receiver Card */}
                <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-xs">
                  <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                    Penerima
                  </h2>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      placeholder="Nama penerima"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nomor HP</label>
                    <input
                      type="tel"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Alamat</label>
                    <textarea
                      rows={2}
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      placeholder="Alamat lengkap penerima"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
                      required
                    />
                  </div>

                  <DistrictSelector
                    label="Kecamatan Penerima"
                    value={receiverDistrict}
                    onChange={(d: District) => {
                      setReceiverDistrict(d.dist_code);
                      if (d.postal_code) setReceiverPostalCode(d.postal_code.split(",")[0]);
                    }}
                  />
                </div>
              </div>

              {/* Package & Service */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-xs">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                  Paket & Layanan
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nama Barang</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      placeholder="Contoh: Baju, Sepatu, Dokumen"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Berat (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
                      required
                    />
                  </div>
                </div>

                {/* Collapsible Dimension Details */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDimension(!showDimension)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{showDimension ? "Sembunyikan Ukuran Paket" : "Tambah Ukuran Paket (P x L x T)"}</span>
                  </button>

                  {showDimension && (
                    <div className="mt-2 grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Panjang (cm)</label>
                        <input
                          type="number"
                          value={length}
                          onChange={(e) => setLength(parseInt(e.target.value) || 10)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Lebar (cm)</label>
                        <input
                          type="number"
                          value={width}
                          onChange={(e) => setWidth(parseInt(e.target.value) || 10)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1">Tinggi (cm)</label>
                        <input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Selection */}
                {rates.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Pilihan Layanan
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {rates.map((r) => {
                        const isSelected = productCode === r.product_code;
                        return (
                          <div
                            key={r.product_code}
                            onClick={() => setProductCode(r.product_code)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-red-600 bg-red-50/50 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-0.5">
                              <span className="font-bold text-xs text-slate-900">
                                {getFriendlyServiceName(r.product_code)}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">{r.duration}</span>
                            </div>
                            <div className="text-sm font-black text-red-600">
                              Rp {r.delivery_price.toLocaleString("id-ID")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Promo Code Input */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Kode Promo (Opsional)"
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Terapkan
                    </button>
                  </div>

                  {promoMessage && (
                    <span className="text-xs text-slate-600 font-medium">
                      {promoMessage} {discount > 0 && <strong>(-Rp {discount.toLocaleString("id-ID")})</strong>}
                    </span>
                  )}
                </div>
              </div>

              {/* Total & Submit Button */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Total Ongkir</span>
                  <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                    <span>Rp {finalAmount.toLocaleString("id-ID")}</span>
                    {discount > 0 && (
                      <span className="text-xs line-through text-slate-400 font-normal">
                        Rp {baseShippingFee.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition-colors"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Buat Order & Bayar QRIS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-xs block">Order Berhasil Dibuat</span>
                    <span className="text-xs text-emerald-700 font-mono">
                      Silakan scan QRIS untuk menyelesaikan pembayaran
                    </span>
                  </div>
                </div>
              </div>

              <QRCodeDisplay
                qrPayload={paymentData.qrPayload || paymentData.paymentUrl}
                amount={paymentData.totalPayment}
                transactionNo={paymentData.transactionNo}
                onRefresh={handleCheckPayment}
                checking={checkingPayment}
                isPaid={isPaid}
                statusText={isPaid ? "Lunas" : "Menunggu Pembayaran"}
              />

              <div className="text-center">
                <button
                  onClick={() => {
                    setPaymentData(null);
                    setTaskCode("");
                    setIsPaid(false);
                    setReceiverName("");
                    setReceiverPhone("");
                    setReceiverAddress("");
                    setReceiverDistrict("");
                    setItemName("");
                    setPromoCode("");
                    setDiscount(0);
                  }}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  Buat Order Baru Lagi
                </button>
              </div>
            </div>
          )}
        </main>
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

"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { DistrictSelector } from "@/components/DistrictSelector";
import { QRCodeDisplay } from "@/components/QRCodeDisplay";
import { UserProfile, District, TariffItem } from "@/lib/types";
import { 
  PackagePlus, 
  Calculator, 
  Tag, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function CreateOrderPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Form State
  const [senderName, setSenderName] = useState("Agent Counter Kuningan");
  const [senderPhone, setSenderPhone] = useState("081299887766");
  const [senderAddress, setSenderAddress] = useState("Kuningan City Mall Lt. 2");
  const [senderDistrict, setSenderDistrict] = useState("31.74.02");
  const [senderPostalCode, setSenderPostalCode] = useState("12940");

  const [receiverName, setReceiverName] = useState("Budi Santoso");
  const [receiverPhone, setReceiverPhone] = useState("081388776655");
  const [receiverAddress, setReceiverAddress] = useState("Jl. Fatmawati Raya No. 45");
  const [receiverDistrict, setReceiverDistrict] = useState("31.74.06");
  const [receiverPostalCode, setReceiverPostalCode] = useState("12430");

  const [itemName, setItemName] = useState("Dokumen dan Pakaian");
  const [weight, setWeight] = useState(1.0);
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
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          if (data.user.agentShopDistrict) {
            setSenderDistrict(data.user.agentShopDistrict);
          }
        }
      });
  }, []);

  const handleCalculateRates = async () => {
    setLoadingRates(true);
    setRates([]);
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
          setProductCode(data.rates[0].product_code);
        }
      }
    } catch (e) {
      console.error(e);
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
        setPromoMessage(data.message);
      } else {
        setDiscount(0);
        setPromoMessage(data.message);
      }
    } catch (e: any) {
      setPromoMessage(e.message);
    }
  };

  const selectedRate = rates.find((r) => r.product_code === productCode);
  const baseShippingFee = selectedRate ? selectedRate.delivery_price : 11500;
  const finalAmount = Math.max(0, baseShippingFee - discount);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setOrderError("");

    try {
      // Step 1: Create Dropoff Task
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
          productCode
        })
      });

      const dropData = await dropResp.json();
      if (!dropData.success || !dropData.taskCode) {
        throw new Error(dropData.message || "Gagal membuat order dropoff");
      }

      const generatedTaskCode = dropData.taskCode;
      setTaskCode(generatedTaskCode);

      // Step 2: Initiate QR Payment
      const payResp = await fetch("/api/order/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskCode: generatedTaskCode,
          amount: finalAmount,
          promoCode,
          paymentCode: "006"
        })
      });

      const payData = await payResp.json();
      if (!payData.success) {
        throw new Error(payData.message || "Gagal generate QR pembayaran");
      }

      setPaymentData(payData);
    } catch (err: any) {
      setOrderError(err.message || "Terjadi kesalahan saat memproses order");
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

        <main className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buat Order Manual</h1>
            <p className="text-xs text-slate-500 mt-1">
              Input data pengirim, penerima (Master District Supabase), hitung tarif resmi, dan cetak QRIS GoPay.
            </p>
          </div>

          {orderError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{orderError}</span>
            </div>
          )}

          {!paymentData ? (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* Sender & Recipient Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sender Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    <span>Data Pengirim (Origin)</span>
                  </h2>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Pengirim</label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telepon</label>
                    <input
                      type="text"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={senderAddress}
                      onChange={(e) => setSenderAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <DistrictSelector
                    label="Kecamatan Pengirim (Origin)"
                    value={senderDistrict}
                    onChange={(d: District) => {
                      setSenderDistrict(d.dist_code);
                      if (d.postal_code) setSenderPostalCode(d.postal_code.split(",")[0]);
                    }}
                  />
                </div>

                {/* Recipient Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
                  <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span>Data Penerima (Destination)</span>
                  </h2>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Penerima</label>
                    <input
                      type="text"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No. Telepon</label>
                    <input
                      type="text"
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
                    <textarea
                      rows={2}
                      value={receiverAddress}
                      onChange={(e) => setReceiverAddress(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <DistrictSelector
                    label="Kecamatan Penerima (Destination)"
                    value={receiverDistrict}
                    onChange={(d: District) => {
                      setReceiverDistrict(d.dist_code);
                      if (d.postal_code) setReceiverPostalCode(d.postal_code.split(",")[0]);
                    }}
                  />
                </div>
              </div>

              {/* Parcel Specs & Rate Calculation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 flex items-center justify-between border-b border-slate-100 pb-3">
                  <span>Detail Barang & Layanan Pengiriman</span>
                  <button
                    type="button"
                    onClick={handleCalculateRates}
                    disabled={loadingRates}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <Calculator className={`w-3.5 h-3.5 ${loadingRates ? "animate-spin" : ""}`} />
                    <span>{loadingRates ? "Menghitung..." : "Hitung Tarif Resmi"}</span>
                  </button>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Barang</label>
                    <input
                      type="text"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Berat (Kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={weight}
                      onChange={(e) => setWeight(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dimensi (P x L x T)</label>
                    <div className="flex space-x-1 text-xs">
                      <input
                        type="number"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value) || 10)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md text-center"
                      />
                      <span className="self-center">x</span>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value) || 10)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md text-center"
                      />
                      <span className="self-center">x</span>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 10)}
                        className="w-full px-2 py-2 border border-slate-300 rounded-md text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Available Rates */}
                {rates.length > 0 && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Pilih Layanan Pengiriman
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {rates.map((r) => {
                        const isSelected = productCode === r.product_code;
                        return (
                          <div
                            key={r.product_code}
                            onClick={() => setProductCode(r.product_code)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              isSelected
                                ? "border-red-600 bg-red-50/50 shadow-xs"
                                : "border-slate-200 hover:border-slate-300 bg-white"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-sm text-slate-900">{r.product_code}</span>
                              <span className="text-xs text-slate-500 font-medium">{r.duration}</span>
                            </div>
                            <div className="text-base font-black text-red-600">
                              Rp {r.delivery_price.toLocaleString("id-ID")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Promo Code Input */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        placeholder="Kode Promo (Opsional)"
                        className="px-3 py-2 pl-8 border border-slate-300 rounded-lg text-xs uppercase font-mono tracking-wider"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
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
              <div className="bg-slate-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Total Pembayaran Ongkir</span>
                  <div className="text-2xl font-black text-white flex items-baseline space-x-2">
                    <span>Rp {finalAmount.toLocaleString("id-ID")}</span>
                    {discount > 0 && (
                      <span className="text-sm line-through text-slate-500 font-normal">
                        Rp {baseShippingFee.toLocaleString("id-ID")}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="px-8 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center space-x-2 transition-all"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Membuat Order & QR...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" />
                      <span>Generate QRIS Pembayaran</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* QR Payment Flow */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3 text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <div>
                    <span className="font-bold text-sm block">Task Order Berhasil Dibuat!</span>
                    <span className="text-xs text-emerald-700">
                      Task Code: <strong>{taskCode}</strong> &bull; Silakan bayar menggunakan GoPay / BCA / QRIS
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
                statusText={isPaid ? "LUNAS (PAID)" : "Menunggu Pembayaran"}
              />

              <div className="text-center">
                <button
                  onClick={() => {
                    setPaymentData(null);
                    setTaskCode("");
                    setIsPaid(false);
                  }}
                  className="px-6 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
                >
                  Buat Order Baru Lagi
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

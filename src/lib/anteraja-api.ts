import { UserProfile, TariffItem, PromoResult, ScanResult, CreateOrderPayload, PaymentInitiateResult, TrackingResult } from "./types";

const CAS_URL = process.env.ANTERAJA_CAS_URL || "https://cas.anteraja.id";
const API_URL = process.env.ANTERAJA_API_URL || "https://api.anteraja.id";

interface CasLoginResult {
  success: boolean;
  token?: string;
  user?: UserProfile;
  error?: string;
}

function extractCookies(resp: Response, prevCookies: string = ""): string {
  const cookieMap = new Map<string, string>();
  
  if (prevCookies) {
    for (const part of prevCookies.split(";")) {
      const trimmed = part.trim();
      if (trimmed) {
        const [k, v] = trimmed.split("=");
        if (k) cookieMap.set(k.trim(), v ? v.trim() : "");
      }
    }
  }

  const rawSetCookie = typeof (resp.headers as any).getSetCookie === "function"
    ? (resp.headers as any).getSetCookie()
    : [resp.headers.get("set-cookie")].filter(Boolean);

  for (const item of rawSetCookie) {
    if (typeof item === "string") {
      const firstPart = item.split(";")[0].trim();
      if (firstPart) {
        const [k, v] = firstPart.split("=");
        if (k) cookieMap.set(k.trim(), v ? v.trim() : "");
      }
    }
  }

  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

export async function loginCAS(username: string, password: string): Promise<CasLoginResult> {
  try {
    const cleanUsername = username.trim();
    // Step 1: GET CAS Login headers to extract lt and execution
    const initialResp = await fetch(`${CAS_URL}/cas/login?isapp=true&acctype=emp`, {
      headers: {
        "User-Agent": "okhttp/4.9.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    const lt = initialResp.headers.get("lt") || "";
    const execution = initialResp.headers.get("execution") || "";
    const cookies1 = extractCookies(initialResp);

    // Step 2: POST credentials to CAS
    const bodyParams = new URLSearchParams();
    bodyParams.append("username", cleanUsername);
    bodyParams.append("password", password);
    bodyParams.append("lt", lt);
    bodyParams.append("execution", execution);
    bodyParams.append("_eventId", "submit");
    bodyParams.append("submit", "LOGIN");

    const loginResp = await fetch(`${CAS_URL}/cas/login?isapp=true&acctype=emp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "okhttp/4.9.0",
        "Cookie": cookies1
      },
      body: bodyParams.toString(),
      redirect: "manual"
    });

    const cookies2 = extractCookies(loginResp, cookies1);

    // Step 3: Request Service Ticket for https://api.anteraja.id
    const serviceUrl = encodeURIComponent("https://api.anteraja.id");
    const stResp = await fetch(`${CAS_URL}/cas/login?service=${serviceUrl}`, {
      headers: {
        "Cookie": cookies2,
        "User-Agent": "okhttp/4.9.0",
      },
      redirect: "manual"
    });

    const location = stResp.headers.get("location") || "";
    const bodyText = await stResp.text();
    let ticket = "";

    const ticketMatch = location.match(/ticket=([^&]+)/) || location.match(/ST-[A-Za-z0-9-]+/) || bodyText.match(/ST-[A-Za-z0-9-]+/);
    if (ticketMatch) {
      ticket = ticketMatch[0].startsWith("ticket=") ? ticketMatch[0].replace("ticket=", "") : ticketMatch[0];
    }

    if (!ticket) {
      return { success: false, error: "Kredensial tidak valid atau gagal memperoleh Service Ticket dari CAS Anteraja" };
    }

    // Step 4: Exchange Service Ticket for Bearer JWT at API Gateway
    const deviceId = "8f3b2d1c0a9e8f7a";
    const gatewayBody = {
      ticket: ticket,
      service: "https://api.anteraja.id",
      deviceId: deviceId,
      appKey: "MAA",
      appSecret: "santuy"
    };

    const gatewayResp = await fetch(`${API_URL}/user/cas/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "okhttp/4.9.0",
        "deviceId": deviceId,
        "appKey": "MAA",
        "appSecret": "santuy"
      },
      body: JSON.stringify(gatewayBody)
    });

    const gatewayJson = await gatewayResp.json();
    
    // In Anteraja API convention, status 0 or 200 represents success
    const isGatewaySuccess = gatewayJson && (gatewayJson.status === 0 || gatewayJson.status === 200) && gatewayJson.content;
    
    if (!isGatewaySuccess) {
      const errorMsg = (gatewayJson?.info && gatewayJson.info !== "OK") 
        ? gatewayJson.info 
        : (gatewayJson?.error || "Gagal otentikasi API Gateway Anteraja");
      return { success: false, error: errorMsg };
    }

    const content = gatewayJson.content;
    const agentObj = content.agent || {};
    const shopObj = agentObj.shop || {};

    const profile: UserProfile = {
      username: content.nir || content.username || cleanUsername,
      name: content.name || agentObj.name || cleanUsername,
      phone: content.phone || "",
      email: content.email || "",
      agentStaffId: content.agent_staff_id || content.id || "",
      agentId: agentObj.id || "",
      agentName: agentObj.name || "",
      agentShopDistrict: content.agent_shop_district || shopObj.district || "31.74.02",
      agentShopName: content.agent_shop_name || shopObj.name || "Gerai Anteraja",
      outletAddress: shopObj.address || ""
    };

    return {
      success: true,
      token: content.token,
      user: profile
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Network exception during CAS login" };
  }
}

export async function scanAndValidateAWB(token: string, staffId: string, awb: string): Promise<ScanResult> {
  const cleanAwb = awb.trim();
  const headers = {
    "token": token,
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "okhttp/4.9.0"
  };

  try {
    // 1. Probe v2 search to check claim status
    const v2Url = `${API_URL}/maa-task/order/v2/search/${cleanAwb}?agent_staff_id=${staffId}`;
    const v2Resp = await fetch(v2Url, { headers });
    const v2Json = await v2Resp.json();

    if (v2Json.status === 400 && v2Json.info && v2Json.info.includes("sudah pernah di klaim")) {
      // Fetch details from v1 search
      const v1Url = `${API_URL}/maa-task/order/search/${cleanAwb}?agent_staff_id=${staffId}`;
      const v1Resp = await fetch(v1Url, { headers });
      const v1Json = await v1Resp.json();
      const order = v1Json.content && v1Json.content[0] ? v1Json.content[0] : null;

      return {
        awb: cleanAwb,
        status: "ALREADY_CLAIMED",
        message: v2Json.info || "Order ini sudah pernah di klaim sebelumnya.",
        orderSource: order?.order_source,
        client: order?.client,
        productCode: order?.product_code,
        deliveryPrice: order?.delivery_price,
        isCod: order?.ext_info?.is_cod,
        weight: order?.parcel_total_weight,
        itemDescription: order?.items?.[0]?.item_name,
        senderName: order?.shipper_info?.name,
        senderPhone: order?.shipper_info?.phone,
        senderAddress: order?.shipper_info?.address,
        senderDistrict: order?.shipper_info?.district_name,
        receiverName: order?.receiver_info?.name,
        receiverPhone: order?.receiver_info?.phone,
        receiverAddress: order?.receiver_info?.address,
        receiverDistrict: order?.receiver_info?.district_name,
        raw: order
      };
    }

    // 2. Query Search v1
    const v1Url = `${API_URL}/maa-task/order/search/${cleanAwb}?agent_staff_id=${staffId}`;
    const v1Resp = await fetch(v1Url, { headers });
    const v1Json = await v1Resp.json();

    if (v1Json.status === 200 && v1Json.content && v1Json.content.length > 0) {
      const order = v1Json.content[0];
      return {
        awb: cleanAwb,
        status: "SUCCESS",
        message: "Order valid dan siap diproses / dropoff",
        orderSource: order.order_source,
        client: order.client,
        productCode: order.product_code,
        deliveryPrice: order.delivery_price,
        isCod: order.ext_info?.is_cod,
        weight: order.parcel_total_weight,
        itemDescription: order.items?.[0]?.item_name,
        senderName: order.shipper_info?.name,
        senderPhone: order.shipper_info?.phone,
        senderAddress: order.shipper_info?.address,
        senderDistrict: order.shipper_info?.district_name,
        receiverName: order.receiver_info?.name,
        receiverPhone: order.receiver_info?.phone,
        receiverAddress: order.receiver_info?.address,
        receiverDistrict: order.receiver_info?.district_name,
        raw: order
      };
    }

    return {
      awb: cleanAwb,
      status: "NOT_FOUND",
      message: v1Json.info || "Nomor AWB / Resi tidak ditemukan di sistem Anteraja"
    };
  } catch (err: any) {
    return {
      awb: cleanAwb,
      status: "ERROR",
      message: err.message || "Gagal memvalidasi AWB"
    };
  }
}

export async function calculateRates(
  token: string,
  origin: string,
  destination: string,
  weight: number,
  length?: number,
  width?: number,
  height?: number
): Promise<{ success: boolean; rates: TariffItem[]; message?: string }> {
  try {
    const params = new URLSearchParams({
      origin,
      destination,
      weight: String(weight || 1.0),
      length: String(length || 10.0),
      width: String(width || 10.0),
      height: String(height || 10.0)
    });

    const resp = await fetch(`${API_URL}/maa-task/rates?${params.toString()}`, {
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "User-Agent": "okhttp/4.9.0"
      }
    });

    const json = await resp.json();
    if (json.status === 200 && Array.isArray(json.content)) {
      return { success: true, rates: json.content };
    }
    return { success: false, rates: [], message: json.info || "Gagal mengambil tarif" };
  } catch (err: any) {
    return { success: false, rates: [], message: err.message };
  }
}

export async function validatePromoCode(
  token: string,
  promoCode: string,
  taskCode?: string
): Promise<PromoResult> {
  try {
    const resp = await fetch(`${API_URL}/maa-task/promo/redeem`, {
      method: "POST",
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "okhttp/4.9.0"
      },
      body: JSON.stringify({
        promo_code: promoCode.trim().toUpperCase(),
        task: taskCode ? [{ task_code: taskCode }] : []
      })
    });

    const json = await resp.json();
    if (json.status === 200 && json.content) {
      return {
        valid: true,
        promoCode: json.content.promo_code || promoCode,
        discountAmount: json.content.total_promo || 0,
        message: "Kode promo berhasil diterapkan"
      };
    }
    return {
      valid: false,
      promoCode,
      discountAmount: 0,
      message: json.info || "Kode promo tidak valid atau telah kedaluwarsa"
    };
  } catch (err: any) {
    return {
      valid: false,
      promoCode,
      discountAmount: 0,
      message: err.message
    };
  }
}

export async function createDropoffOrder(
  token: string,
  staffId: string,
  payload: CreateOrderPayload
): Promise<{ success: boolean; taskCode?: string; waybillNo?: string; deliveryPrice?: number; message?: string }> {
  try {
    const dropoffReq = [
      {
        product_code: payload.productCode || "REG",
        delivery_price: 11500.0,
        parcel_total_weight: payload.weight || 1.0,
        agent_staff_id: staffId,
        shipper_info: {
          name: payload.senderName,
          phone: payload.senderPhone,
          address: payload.senderAddress,
          district_code: payload.senderDistrict,
          postcode: payload.senderPostalCode || "12940",
          geoloc: "-6.2238,106.8286"
        },
        receiver_info: {
          name: payload.receiverName,
          phone: payload.receiverPhone,
          address: payload.receiverAddress,
          district_code: payload.receiverDistrict,
          postcode: payload.receiverPostalCode || "12430",
          geoloc: "-6.2912,106.7972"
        },
        items: [
          {
            item_name: payload.itemName || "Paket Barang",
            item_desc: payload.itemName || "Paket Barang",
            item_category: "Dokumen",
            declared_value: payload.itemValue || 50000,
            weight: payload.weight || 1.0,
            width: payload.width || 10.0,
            height: payload.height || 10.0,
            length: payload.length || 10.0,
            fragile: false
          }
        ],
        note: "Web MAA Manual Order",
        use_insurance: false,
        insurance_item_category: null,
        item_value: 0.0,
        insurance_price: 0.0,
        packing: null,
        packing_price: 0.0,
        flight_number: null
      }
    ];

    const resp = await fetch(`${API_URL}/maa-task/task/dropoff`, {
      method: "POST",
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "okhttp/4.9.0"
      },
      body: JSON.stringify(dropoffReq)
    });

    const json = await resp.json();
    if (json.status === 200 && json.content) {
      return {
        success: true,
        taskCode: json.content.task_code,
        waybillNo: json.content.waybill_no || json.content.task_code,
        deliveryPrice: json.content.total_delivery_price || json.content.delivery_price
      };
    }
    return { success: false, message: json.info || "Gagal membuat task dropoff" };
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function initiatePayment(
  token: string,
  staffId: string,
  taskCode: string,
  amount: number,
  promoCode: string = "",
  paymentCode: string = "006" // 006 = QRIS / GoPay QR
): Promise<PaymentInitiateResult> {
  try {
    const paymentReq = {
      promo_code: promoCode,
      task: [{ task_code: taskCode }],
      cash_received: amount,
      payment_code: paymentCode
    };

    const resp = await fetch(`${API_URL}/maa-task/task/dropoff/payment/initiateInApps?agent_staff_id=${staffId}`, {
      method: "POST",
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "okhttp/4.9.0"
      },
      body: JSON.stringify(paymentReq)
    });

    const json = await resp.json();
    if (json.status === 200 && json.content) {
      const c = json.content;
      return {
        success: true,
        taskCode,
        transactionNo: c.transaction_no || `TMAA-${Date.now()}`,
        totalPayment: c.total_payment || amount,
        paymentUrl: c.payment_url || "",
        paymentCode,
        qrPayload: c.payment_url || c.qr_string || ""
      };
    }
    return {
      success: false,
      taskCode,
      transactionNo: "",
      totalPayment: amount,
      paymentUrl: "",
      paymentCode,
      message: json.info || "Gagal menginisiasi pembayaran QR"
    };
  } catch (err: any) {
    return {
      success: false,
      taskCode,
      transactionNo: "",
      totalPayment: amount,
      paymentUrl: "",
      paymentCode,
      message: err.message
    };
  }
}

export async function checkPaymentStatus(
  token: string,
  taskCode: string
): Promise<{ success: boolean; paid: boolean; message?: string }> {
  try {
    const resp = await fetch(`${API_URL}/maa-task/order/payment/check`, {
      method: "POST",
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "okhttp/4.9.0"
      },
      body: JSON.stringify([{ bookingId: taskCode }])
    });

    const json = await resp.json();
    if (json.status === 0 || json.status === 200) {
      return { success: true, paid: true, message: "Pembayaran telah terkonfirmasi" };
    }
    return { success: true, paid: false, message: json.info || "Menunggu pembayaran" };
  } catch (err: any) {
    return { success: false, paid: false, message: err.message };
  }
}

export async function getShipmentTracking(
  token: string,
  staffId: string,
  awb: string
): Promise<TrackingResult | null> {
  try {
    const cleanAwb = awb.trim();
    const url = `${API_URL}/maa-task/tracking?waybill=${encodeURIComponent(cleanAwb)}&agent_staff_id=${encodeURIComponent(staffId)}`;
    const resp = await fetch(url, {
      headers: {
        "token": token,
        "Authorization": `Bearer ${token}`,
        "User-Agent": "okhttp/4.9.0"
      }
    });

    const json = await resp.json();
    if ((json.status === 0 || json.status === 200) && json.content) {
      const c = json.content;
      const rawHistory = Array.isArray(c.history) ? c.history : [];
      const mappedHistory = rawHistory.map((h: any) => ({
        timestamp: h.timestamp,
        statusCode: String(h.tracking_code || ""),
        statusName: h.hub_name || "Hub Anteraja",
        location: h.hub_name || "",
        message: h.message || "Paket dalam proses operasional"
      }));

      return {
        awb: c.waybill || cleanAwb,
        service: c.service_code || "REG",
        currentStatus: c.status || "ON PROCESS",
        origin: "Jakarta Selatan",
        destination: "Pangkal Pinang",
        shipperName: c.shipper_name || "-",
        receiverName: c.receiver_name || "-",
        history: mappedHistory
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}

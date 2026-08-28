export interface UserProfile {
  username: string;
  name: string;
  phone: string;
  email: string;
  agentStaffId: string;
  agentId: string;
  agentName: string;
  agentShopDistrict: string;
  agentShopName: string;
  outletAddress?: string;
}

export interface SessionData {
  user: UserProfile;
  token: string;
  expiresAt: number;
}

export interface District {
  id: number;
  dist_code: string;
  dist_name: string;
  city_code: string;
  city_name: string;
  province_code: string;
  province_name: string;
  postal_code: string;
  dist_all: string;
}

export interface TariffItem {
  product_code: string;
  product_name: string;
  duration: string;
  delivery_price: number;
  total_delivery_price: number;
  status: string;
}

export interface PromoResult {
  valid: boolean;
  promoCode: string;
  discountAmount: number;
  message: string;
}

export interface ScanResult {
  awb: string;
  status: "SUCCESS" | "ALREADY_CLAIMED" | "NOT_FOUND" | "ERROR";
  message: string;
  orderSource?: string;
  client?: string;
  productCode?: string;
  deliveryPrice?: number;
  isCod?: boolean;
  weight?: number;
  itemDescription?: string;
  senderName?: string;
  senderPhone?: string;
  senderAddress?: string;
  senderDistrict?: string;
  receiverName?: string;
  receiverPhone?: string;
  receiverAddress?: string;
  receiverDistrict?: string;
  raw?: any;
}

export interface CreateOrderPayload {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  senderDistrict: string;
  senderPostalCode: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverDistrict: string;
  receiverPostalCode: string;
  itemName: string;
  itemCategory?: string;
  itemValue?: number;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  productCode: string;
  deliveryPrice?: number;
  promoCode?: string;
  isCod?: boolean;
  codAmount?: number;
}

export interface PaymentInitiateResult {
  success: boolean;
  taskCode: string;
  transactionNo: string;
  totalPayment: number;
  paymentUrl: string;
  paymentCode: string;
  qrPayload?: string;
  message?: string;
}

export interface TrackingEvent {
  timestamp: string;
  statusCode: string;
  statusName: string;
  opcode?: string;
  location?: string;
  message: string;
  heroName?: string;
  heroPhone?: string;
}

export interface TrackingResult {
  awb: string;
  service: string;
  currentStatus: string;
  origin: string;
  destination: string;
  shipperName: string;
  receiverName: string;
  history: TrackingEvent[];
}

export interface MaaTaskItem {
  taskCode: string;
  waybillNo?: string;
  bookingId?: string;
  orderSource?: string;
  productCode: string;
  productName?: string;
  taskStatus: string;
  paymentStatus: string;
  taskType: string;
  deliveryPrice: number;
  parcelTotalWeight: number;
  shipperName: string;
  shipperPhone: string;
  shipperDistrict?: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress?: string;
  receiverDistrict?: string;
  itemName?: string;
  createdAt: string;
  updatedAt?: string;
  raw?: any;
}

export interface TasklistQueryOptions {
  status?: string;
  state?: string;
  key?: string;
  page?: number;
  size?: number;
  tab?: "dropoff" | "titip" | "tertunda" | "delivery" | "all";
}

export interface TasklistResult {
  success: boolean;
  tasks: MaaTaskItem[];
  totalCount: number;
  summary: {
    outstandingPickup: number;
    dropoffCount: number;
    titipPickupCount: number;
    tertundaCount: number;
    deliveryCount: number;
  };
  message?: string;
  raw?: any;
}

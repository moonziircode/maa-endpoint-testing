export interface OpcodeInfo {
  opcode: string;
  status: string;
  stage: "DROPOFF" | "INBOUND" | "OUTBOUND" | "DELIVERY" | "RETURN" | "EXCEPTION";
  description: string;
}

export const OPCODE_MAP: Record<string, OpcodeInfo> = {
  "59": {
    opcode: "59",
    status: "DROPOFF_SUCCESS",
    stage: "DROPOFF",
    description: "Paket telah diterima di Gerai / Mitra Anteraja"
  },
  "54": {
    opcode: "54",
    status: "INBOUND_STAGING",
    stage: "INBOUND",
    description: "Paket telah tiba di Staging Hub Anteraja"
  },
  "52": {
    opcode: "52",
    status: "OUTBOUND_MANIFEST",
    stage: "OUTBOUND",
    description: "Paket sedang dalam perjalanan menuju Hub Tujuan"
  },
  "408": {
    opcode: "408",
    status: "SORTING_PROCESS",
    stage: "INBOUND",
    description: "Paket sedang dalam proses sortir di Sorting Center"
  },
  "205": {
    opcode: "205",
    status: "DELIVERY_ASSIGNED",
    stage: "DELIVERY",
    description: "Paket dibawa Satria untuk diantar ke penerima"
  },
  "206": {
    opcode: "206",
    status: "DELIVERY_PROGRESS",
    stage: "DELIVERY",
    description: "Satria sedang menuju alamat penerima"
  },
  "80": {
    opcode: "80",
    status: "DELIVERY_SUCCESS",
    stage: "DELIVERY",
    description: "Paket telah berhasil diterima oleh penerima"
  },
  "58": {
    opcode: "58",
    status: "PICKUP_SUCCESS",
    stage: "DROPOFF",
    description: "Paket telah di-pickup dari pengirim"
  }
};

export function getOpcodeDescription(code?: string): string {
  if (!code) return "Status operasional tercatat";
  return OPCODE_MAP[code]?.description || `Operasional [Opcode: ${code}]`;
}

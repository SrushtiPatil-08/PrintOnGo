// Client-side order store + pricing + delivery estimation
export type PrintOptions = {
  fileName: string;
  pages: number;
  copies: number;
  color: "bw" | "color";
  sided: "single" | "double";
  size: "A4" | "A3";
  finishing: "none" | "staple" | "bind";
  urgent: boolean;
  autoDetectedPages?: boolean;
};

export type LocationInfo = {
  lat?: number;
  lng?: number;
  label: string; // human-readable address
  distanceKm: number; // distance to nearest print partner
  etaMin: number; // estimated delivery time in minutes
  deliveryFee: number;
  hyperLocal?: boolean;
  outOfBounds?: boolean;
};

export type DeliveryDetails = {
  fullName: string;
  institute: string;
  department: string;
  phone: string;
  address: string;
  time: string;
  location?: LocationInfo;
};

export type Order = {
  id: string;
  createdAt: string;
  options: PrintOptions;
  delivery: DeliveryDetails;
  total: number;
  status: OrderStatus;
};

export const STATUSES = [
  "Order Confirmed",
  "Printing Started",
  "Printing Completed",
  "Picked Up By Delivery Partner",
  "Out For Delivery",
  "Delivered",
] as const;
export type OrderStatus = (typeof STATUSES)[number];

// ---- Pricing ----
export const RATE_BW = 3;     // ₹ per page
export const RATE_COLOR = 10; // ₹ per page

export function bindingCostFor(pages: number): number {
  if (pages <= 0) return 0;
  if (pages <= 50) return 20;
  if (pages <= 100) return 35;
  return 50;
}

export type CostBreakdown = {
  pages: number;
  copies: number;
  printRate: number;
  printCost: number;
  stapleCost: number;
  bindingCost: number;
  subtotal: number;
  deliveryFee: number;
  expressFee: number;
  total: number;
  freeDelivery: boolean;
};

export function calcBreakdown(o: PrintOptions, loc?: LocationInfo): CostBreakdown {
  const printRate = o.color === "color" ? RATE_COLOR : RATE_BW;
  const printCost = o.pages * o.copies * printRate;
  const stapleCost = 0; // free
  const bindingCost = o.finishing === "bind" ? bindingCostFor(o.pages) : 0;
  const subtotal = printCost + bindingCost + stapleCost;
  const baseDelivery = loc ? loc.deliveryFee : 20;
  const freeDelivery = subtotal >= 199; // free delivery threshold
  const deliveryFee = freeDelivery ? 0 : baseDelivery;
  const expressFee = o.urgent ? 15 : 0;
  const total = subtotal + deliveryFee + expressFee;
  return { pages: o.pages, copies: o.copies, printRate, printCost, stapleCost, bindingCost, subtotal, deliveryFee, expressFee, total, freeDelivery };
}

export function calcCost(o: PrintOptions, loc?: LocationInfo): number {
  return calcBreakdown(o, loc).total;
}

// ---- Location / delivery estimation ----
// Primary campus micro-hub: Vartak Polytechnic / Vartak College, Vasai West, Maharashtra
export const PARTNER_COORDS = { lat: 19.3854, lng: 72.8322 };
export const HUB_NAME = "Vartak Polytechnic Campus Hub";
export const HYPERLOCAL_RADIUS_KM = 1.5; // 10-min Blinkit-style zone
export const MAX_DELIVERY_RADIUS_KM = 4;  // hard out-of-bounds cap

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat); const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export type DistanceEstimate = {
  etaMin: number;
  deliveryFee: number;
  band: string;
  hyperLocal: boolean;
  outOfBounds: boolean;
};

export function estimateFromDistance(distanceKm: number): DistanceEstimate {
  if (distanceKm <= HYPERLOCAL_RADIUS_KM) {
    return { etaMin: 10, deliveryFee: 10, band: "Hyper-local · under 10 mins", hyperLocal: true, outOfBounds: false };
  }
  if (distanceKm <= 2.5) {
    return { etaMin: 18, deliveryFee: 20, band: `${distanceKm.toFixed(1)} km · ~15–20 mins`, hyperLocal: false, outOfBounds: false };
  }
  if (distanceKm <= MAX_DELIVERY_RADIUS_KM) {
    return { etaMin: 28, deliveryFee: 30, band: `${distanceKm.toFixed(1)} km · ~20–30 mins`, hyperLocal: false, outOfBounds: false };
  }
  return { etaMin: 0, deliveryFee: 0, band: `Out of bounds (${distanceKm.toFixed(1)} km)`, hyperLocal: false, outOfBounds: true };
}

const KEY = "printongo:current";
const ORDERS_KEY = "printongo:orders";

export function saveDraft(data: Partial<{ options: PrintOptions; delivery: DeliveryDetails }>) {
  if (typeof window === "undefined") return;
  const prev = getDraft();
  sessionStorage.setItem(KEY, JSON.stringify({ ...prev, ...data }));
}
export function getDraft(): Partial<{ options: PrintOptions; delivery: DeliveryDetails }> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(sessionStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
export function clearDraft() { if (typeof window !== "undefined") sessionStorage.removeItem(KEY); }

export function placeOrder(options: PrintOptions, delivery: DeliveryDetails): Order {
  const order: Order = {
    id: "PG" + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    options, delivery,
    total: calcCost(options, delivery.location),
    status: "Order Confirmed",
  };
  const list = getOrders();
  list.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  return order;
}

const DEMO: Order[] = [
  {
    id: "PG100234", createdAt: new Date().toISOString(),
    options: { fileName: "DBMS_Assignment.pdf", pages: 20, copies: 2, color: "bw", sided: "double", size: "A4", finishing: "bind", urgent: false, autoDetectedPages: true },
    delivery: { fullName: "Aarav Sharma", institute: "IIT Delhi", department: "CSE", phone: "9876543210", address: "Hostel 5, Room 214", time: "Evening",
      location: { label: "IIT Delhi, Hauz Khas", distanceKm: 2.4, etaMin: 22, deliveryFee: 25 } },
    total: 145, status: "Out For Delivery",
  },
  {
    id: "PG100235", createdAt: new Date().toISOString(),
    options: { fileName: "Project_Report.docx", pages: 25, copies: 1, color: "color", sided: "single", size: "A4", finishing: "bind", urgent: true, autoDetectedPages: true },
    delivery: { fullName: "Priya Verma", institute: "DU North Campus", department: "Economics", phone: "9123456780", address: "Kamla Nehru Hostel", time: "Morning",
      location: { label: "DU North Campus", distanceKm: 0.8, etaMin: 12, deliveryFee: 15 } },
    total: 285, status: "Printing Started",
  },
  {
    id: "PG100236", createdAt: new Date().toISOString(),
    options: { fileName: "Notes_Unit3.pdf", pages: 15, copies: 5, color: "bw", sided: "double", size: "A4", finishing: "staple", urgent: false, autoDetectedPages: true },
    delivery: { fullName: "Rahul Singh", institute: "NIT Trichy", department: "Mechanical", phone: "9988776655", address: "Garnet Hostel, Block A", time: "Afternoon",
      location: { label: "NIT Trichy Campus", distanceKm: 4.2, etaMin: 32, deliveryFee: 35 } },
    total: 260, status: "Delivered",
  },
];

export function getOrders(): Order[] {
  if (typeof window === "undefined") return DEMO;
  try {
    const stored = localStorage.getItem(ORDERS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  localStorage.setItem(ORDERS_KEY, JSON.stringify(DEMO));
  return DEMO;
}

export function getOrder(id: string): Order | undefined {
  return getOrders().find(o => o.id === id);
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  const list = getOrders().map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
}

// ---- Auto page detection ----
// Robust, browser-native parsing via pdfjs-dist + jszip.
export type PageDetectionResult = {
  pages: number;
  source: "pdf" | "docx-xml" | "pptx-xml" | "image" | "estimate";
};

async function parseOfficeCount(file: File, xmlPath: string, tag: "Pages" | "Slides"): Promise<number | null> {
  try {
    const JSZip = (await import("jszip")).default;
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const entry = zip.file(xmlPath);
    if (!entry) return null;
    const xml = await entry.async("string");
    const m = xml.match(new RegExp(`<${tag}>(\\d+)</${tag}>`));
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > 0) return n;
    }
    return null;
  } catch {
    return null;
  }
}

export async function detectPageCount(file: File): Promise<PageDetectionResult | null> {
  const name = file.name.toLowerCase();
  try {
    if (name.endsWith(".pdf")) {
      const pdfjs: any = await import(/* @vite-ignore */ "pdfjs-dist/build/pdf.mjs" as any);
      try {
        const workerUrl = (await import("pdfjs-dist/build/pdf.worker.mjs?url")).default;
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      } catch {
        pdfjs.GlobalWorkerOptions.workerSrc = "";
      }
      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf, disableWorker: true }).promise;
      return { pages: doc.numPages, source: "pdf" };
    }
    if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp")) {
      return { pages: 1, source: "image" };
    }
    if (name.endsWith(".docx")) {
      const n = await parseOfficeCount(file, "docProps/app.xml", "Pages");
      if (n) return { pages: n, source: "docx-xml" };
      return { pages: Math.max(1, Math.round(file.size / 25000)), source: "estimate" };
    }
    if (name.endsWith(".pptx")) {
      const n = await parseOfficeCount(file, "docProps/app.xml", "Slides");
      if (n) return { pages: n, source: "pptx-xml" };
      return { pages: Math.max(1, Math.round(file.size / 60000)), source: "estimate" };
    }
    if (name.endsWith(".ppt") || name.endsWith(".doc")) {
      // legacy binary — no reliable client parser; conservative estimate
      return { pages: Math.max(1, Math.round(file.size / 50000)), source: "estimate" };
    }
  } catch {
    return null;
  }
  return null;
}


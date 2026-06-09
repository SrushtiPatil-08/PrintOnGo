// Simple client-side order store using sessionStorage + a static demo list
export type PrintOptions = {
  fileName: string;
  service?: "printing" | "xerox";
  pages: number;
  copies: number;
  color: "bw" | "color";
  sided: "single" | "double";
  size: "A4" | "A3";
  binding: boolean;
  urgent: boolean;
};

export type DeliveryDetails = {
  fullName: string;
  institute: string;
  department: string;
  phone: string;
  address: string;
  time: string;
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
  "Order Received",
  "Printing in Progress",
  "Quality Check",
  "Out for Delivery",
  "Delivered",
] as const;
export type OrderStatus = (typeof STATUSES)[number];

export type CostBreakdown = {
  service: "printing" | "xerox";
  printType: string;
  pages: number;
  copies: number;
  printRate: number;
  printCost: number;
  bindingCost: number;
  subtotal: number;
  deliveryFee: number;
  expressFee: number;
  total: number;
  freeDelivery: boolean;
};

export function calcBreakdown(o: PrintOptions): CostBreakdown {
  const service = o.service ?? "printing";
  const printRate = o.color === "color" ? 5 : 1;
  const printType = `${o.color === "bw" ? "B&W" : "Color"} ${service === "xerox" ? "Xerox" : "Printing"}`;
  const printCost = o.pages * o.copies * printRate;
  const bindingCost = o.binding ? 20 : 0;
  const subtotal = printCost + bindingCost;
  const freeDelivery = subtotal >= 50;
  const deliveryFee = freeDelivery ? 0 : 5;
  const expressFee = o.urgent ? 10 : 0;
  const total = subtotal + deliveryFee + expressFee;
  return {
    service,
    printType,
    pages: o.pages,
    copies: o.copies,
    printRate,
    printCost,
    bindingCost,
    subtotal,
    deliveryFee,
    expressFee,
    total,
    freeDelivery,
  };
}

export function calcCost(o: PrintOptions): number {
  return calcBreakdown(o).total;
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
export function clearDraft() {
  if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
}

export function placeOrder(options: PrintOptions, delivery: DeliveryDetails): Order {
  const order: Order = {
    id: "PG" + Date.now().toString().slice(-6),
    createdAt: new Date().toISOString(),
    options, delivery,
    total: calcCost(options),
    status: "Order Received",
  };
  const list = getOrders();
  list.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  return order;
}

const DEMO: Order[] = [
  {
    id: "PG100234", createdAt: new Date().toISOString(),
    options: { fileName: "DBMS_Assignment.pdf", service: "printing", pages: 20, copies: 2, color: "bw", sided: "double", size: "A4", binding: true, urgent: false },
    delivery: { fullName: "Aarav Sharma", institute: "IIT Delhi", department: "CSE", phone: "9876543210", address: "Hostel 5, Room 214", time: "Evening" },
    total: 60, status: "Out for Delivery",
  },
  {
    id: "PG100235", createdAt: new Date().toISOString(),
    options: { fileName: "Project_Report.docx", service: "printing", pages: 25, copies: 1, color: "color", sided: "single", size: "A4", binding: true, urgent: true },
    delivery: { fullName: "Priya Verma", institute: "DU North Campus", department: "Economics", phone: "9123456780", address: "Kamla Nehru Hostel", time: "Morning" },
    total: 155, status: "Printing in Progress",
  },
  {
    id: "PG100236", createdAt: new Date().toISOString(),
    options: { fileName: "Notes_Unit3.pdf", service: "xerox", pages: 15, copies: 5, color: "bw", sided: "double", size: "A4", binding: false, urgent: false },
    delivery: { fullName: "Rahul Singh", institute: "NIT Trichy", department: "Mechanical", phone: "9988776655", address: "Garnet Hostel, Block A", time: "Afternoon" },
    total: 75, status: "Delivered",
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

import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { getOrders, STATUSES, updateOrderStatus, type Order, type OrderStatus } from "@/lib/order-store";
import { Search, Package, IndianRupee, TrendingUp, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin dashboard — PrintOnGo" }] }),
  component: AdminPage,
});

function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { setOrders(getOrders()); }, []);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return orders;
    return orders.filter(o =>
      o.id.toLowerCase().includes(s) ||
      o.delivery.fullName.toLowerCase().includes(s) ||
      o.delivery.institute.toLowerCase().includes(s) ||
      o.options.fileName.toLowerCase().includes(s)
    );
  }, [orders, q]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const delivered = orders.filter(o => o.status === "Delivered").length;

  const setStatus = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
    setOrders(getOrders());
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-7xl py-10">
        <h1 className="text-4xl font-bold mb-1">Admin dashboard</h1>
        <p className="text-muted-foreground mb-6">Demo view — manage incoming print orders. Files are auto-deleted after delivery and cannot be downloaded.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Stat icon={Package} label="Total orders" value={orders.length.toString()} />
          <Stat icon={TrendingUp} label="Delivered" value={delivered.toString()} />
          <Stat icon={IndianRupee} label="Revenue" value={`₹${revenue}`} />
        </div>

        <div className="card-elevated p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by ID, name, institute or file…" className="border-0 shadow-none focus-visible:ring-0 px-0" />
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="px-2 py-3 font-medium">Order ID</th>
                  <th className="px-2 py-3 font-medium">Customer</th>
                  <th className="px-2 py-3 font-medium">Location · ETA</th>
                  <th className="px-2 py-3 font-medium">Pages</th>
                  <th className="px-2 py-3 font-medium">Finish</th>
                  <th className="px-2 py-3 font-medium">Total</th>
                  <th className="px-2 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} className="border-b border-border/60 hover:bg-secondary/40">
                    <td className="px-2 py-3 font-mono text-xs font-semibold">{o.id}</td>
                    <td className="px-2 py-3">
                      <div className="font-medium">{o.delivery.fullName}</div>
                      <div className="text-xs text-muted-foreground">{o.delivery.institute}</div>
                    </td>
                    <td className="px-2 py-3 text-xs">
                      {o.delivery.location ? (
                        <>
                          <div>{o.delivery.location.label}</div>
                          <div className="text-muted-foreground">{o.delivery.location.distanceKm} km · ~{o.delivery.location.etaMin} mins</div>
                        </>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-2 py-3">
                      <div>{o.options.pages} × {o.options.copies}</div>
                      <div className="text-xs text-muted-foreground">{o.options.color === "bw" ? "B&W" : "Color"}</div>
                    </td>
                    <td className="px-2 py-3 text-xs capitalize">
                      {o.options.finishing === "none" ? "—" : o.options.finishing}
                    </td>
                    <td className="px-2 py-3 font-semibold">₹{o.total}</td>
                    <td className="px-2 py-3">
                      <select value={o.status} onChange={e => setStatus(o.id, e.target.value as OrderStatus)}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-xs">
                        {STATUSES.map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No orders match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> Customer files are encrypted & auto-deleted after delivery
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="card-elevated p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
      </div>
    </div>
  );
}

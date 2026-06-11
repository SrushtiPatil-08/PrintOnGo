import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { getOrder, STATUSES, type Order } from "@/lib/order-store";
import { Check, Package, Search, Clock, MapPin } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/track")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Track your order — PrintOnGo" }] }),
  component: TrackPage,
});

function TrackPage() {
  const search = Route.useSearch();
  const [query, setQuery] = useState(search.id ?? "");
  const [order, setOrder] = useState<Order | undefined>();
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (search.id) {
      setOrder(getOrder(search.id));
      setSearched(true);
    }
  }, [search.id]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOrder(getOrder(query.trim()));
    setSearched(true);
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-3xl py-12">
        <h1 className="text-4xl font-bold mb-2">Track your order</h1>
        <p className="text-muted-foreground mb-6">Live progress updates. Try <span className="font-mono font-semibold">PG100234</span>.</p>

        <form onSubmit={onSearch} className="flex gap-2 mb-8">
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. PG100234" className="h-11" />
          <Button type="submit" className="btn-hero h-11"><Search className="w-4 h-4 mr-1" /> Track</Button>
        </form>

        {searched && !order && (
          <div className="card-elevated p-8 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">No order found for "{query}"</p>
            <p className="text-sm text-muted-foreground mt-1">Check the ID or <Link to="/order" className="text-primary underline">place a new order</Link>.</p>
          </div>
        )}

        {order && <OrderTimeline order={order} />}
      </section>
    </SiteLayout>
  );
}

function OrderTimeline({ order }: { order: Order }) {
  const currentIdx = STATUSES.indexOf(order.status);
  const progress = ((currentIdx + 1) / STATUSES.length) * 100;
  const loc = order.delivery.location;
  return (
    <div className="card-elevated p-6 md:p-8">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <div className="text-xs text-muted-foreground">Order ID</div>
          <div className="text-2xl font-display font-bold">{order.id}</div>
          <div className="text-sm text-muted-foreground mt-1">{order.options.fileName}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total</div>
          <div className="text-2xl font-bold text-primary">₹{order.total}</div>
        </div>
      </div>

      {loc && (
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          <div className="rounded-lg border border-border bg-[hsl(210_40%_98%)] p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><Clock className="w-3.5 h-3.5 text-primary" /> Estimated arrival</div>
            <div className="text-base font-semibold mt-0.5 text-primary">~ {loc.etaMin} mins*</div>
          </div>
          <div className="rounded-lg border border-border bg-[hsl(210_40%_98%)] p-3">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><MapPin className="w-3.5 h-3.5 text-primary" /> Distance</div>
            <div className="text-base font-semibold mt-0.5">{loc.distanceKm} km · {loc.label}</div>
          </div>
        </div>
      )}

      <div className="h-2 rounded-full bg-secondary overflow-hidden mb-6">
        <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: "var(--gradient-primary)" }} />
      </div>

      <ol className="space-y-4">
        {STATUSES.map((s, i) => {
          const done = i <= currentIdx;
          const current = i === currentIdx;
          return (
            <li key={s} className="flex items-start gap-3">
              <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${done ? "text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                style={done ? { background: "var(--gradient-primary)" } : undefined}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <div className="flex-1 pt-1">
                <div className={`font-medium ${current ? "text-primary" : done ? "" : "text-muted-foreground"}`}>{s}</div>
                {current && <div className="text-xs text-muted-foreground mt-0.5">In progress…</div>}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="border-t border-border mt-6 pt-4 text-sm text-muted-foreground">
        Delivering to <span className="text-foreground font-medium">{order.delivery.fullName}</span> · {order.delivery.institute}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">*Delivery times vary based on customer location, traffic, print partner availability & order volume.</p>
    </div>
  );
}

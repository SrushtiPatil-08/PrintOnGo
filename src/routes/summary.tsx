import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { calcBreakdown, calcCost, clearDraft, getDraft, placeOrder, spiralBindingCost, type DeliveryDetails, type PrintOptions } from "@/lib/order-store";
import { Stepper } from "./order";
import { FileText, MapPin, Settings2, CheckCircle2, BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/summary")({
  head: () => ({ meta: [{ title: "Order summary — PrintOnGo" }] }),
  component: SummaryPage,
});

function SummaryPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<{ options?: PrintOptions; delivery?: DeliveryDetails }>({});
  useEffect(() => { setData(getDraft()); }, []);

  if (!data.options || !data.delivery) {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 max-w-2xl py-20 text-center">
          <h1 className="text-3xl font-bold mb-3">No order to summarise</h1>
          <Button asChild className="btn-hero"><Link to="/order">Start order</Link></Button>
        </section>
      </SiteLayout>
    );
  }

  const { options, delivery } = data;
  const breakdown = calcBreakdown(options, delivery.location);
  const total = calcCost(options, delivery.location);

  const place = () => {
    const order = placeOrder(options, delivery);
    clearDraft();
    toast.success("Order placed!");
    navigate({ to: "/track", search: { id: order.id } });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-4xl py-12">
        <Stepper step={3} />
        <h1 className="text-4xl font-bold mt-6 mb-2">Order summary</h1>
        <p className="text-muted-foreground mb-8">Review everything and place your order.</p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card icon={FileText} title={options.documents && options.documents.length > 1 ? `${options.documents.length} documents` : "Document"}>
              {options.documents && options.documents.length > 0 ? (
                <ul className="text-sm space-y-1.5">
                  {options.documents.map((d, i) => (
                    <li key={d.id} className="flex justify-between gap-2">
                      <span className="truncate">
                        {i + 1}. <span className="font-medium">{d.fileName}</span>
                        <span className="text-muted-foreground"> — {d.pages} pg × {d.copies} cp · {d.color === "bw" ? "B&W" : "Color"}{d.staple ? " · Stapled" : ""}{d.spiralBinding ? ` · ${d.spiralType === "metal" ? "Metal Wire-O" : "Plastic Spiral"}` : ""}</span>
                      </span>
                      <span className="font-medium shrink-0">₹{d.pages * d.copies * (d.color === "color" ? 10 : 3) + (d.spiralBinding ? spiralBindingCost(d.pages, d.spiralType) : 0)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <div className="text-sm">{options.fileName}</div>
                  {options.autoDetectedPages && (
                    <div className="text-xs text-success font-semibold mt-1 inline-flex items-center gap-1">
                      <BadgeCheck className="w-3.5 h-3.5" /> {options.pages} pages auto-detected
                    </div>
                  )}
                </>
              )}
            </Card>
            <Card icon={Settings2} title="Print options">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{options.pages} total pages · {options.copies} total {options.copies > 1 ? "copies" : "copy"}{options.documents && options.documents.length > 1 ? ` across ${options.documents.length} docs` : ` · ${options.color === "bw" ? "B&W ₹3/pg" : "Color ₹10/pg"}`}</li>
                {!options.documents && options.finishing === "staple" && <li>Stapling — <span className="text-success font-medium">FREE</span></li>}
                {!options.documents && options.finishing === "bind" && <li>Binding — ₹{breakdown.bindingCost}</li>}
                {options.documents?.some(d => d.staple) && <li>Stapling on selected docs — <span className="text-success font-medium">FREE</span></li>}
                {options.documents?.some(d => d.spiralBinding) && <li>Spiral binding — ₹{breakdown.spiralCost}</li>}
                {options.urgent && <li>Express delivery</li>}
              </ul>
            </Card>

            <Card icon={MapPin} title="Delivery">
              <div className="text-sm space-y-1">
                <div className="font-medium">{delivery.fullName} · {delivery.phone}</div>
                <div className="text-muted-foreground">{delivery.institute} — {delivery.department}</div>
                <div className="text-muted-foreground">{delivery.address}</div>
                {delivery.location && (
                  <div className="text-muted-foreground inline-flex items-center gap-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    ETA ~ {delivery.location.etaMin} mins · {delivery.location.distanceKm} km from print partner
                  </div>
                )}
                <div className="text-muted-foreground">Preferred: {delivery.time}</div>
              </div>
            </Card>
            <Card icon={ShieldCheck} title="Document security">
              <p className="text-sm text-muted-foreground">End-to-end encrypted upload. Files accessible only to assigned print partner and auto-deleted within 24 hours of delivery.</p>
            </Card>
          </div>
          <aside>
            <div className="card-elevated p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">Estimated total</div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide">
                  <BadgeCheck className="w-3 h-3" /> Student
                </span>
              </div>
              <div className="text-4xl font-bold text-primary mt-1">₹{total}</div>
              <div className="mt-5 space-y-2 text-sm">
                <Row k="Total pages" v={String(options.pages)} />
                <Row k="Copies" v={String(options.copies)} />
                <Row k="Print type" v={options.color === "bw" ? `B&W ₹3` : `Color ₹10`} />
                <Row k="Print cost" v={`₹${breakdown.printCost}`} />
                {breakdown.spiralCost > 0 && <Row k="Spiral binding" v={`₹${breakdown.spiralCost}`} />}
                <Row k="Stapling" v={options.finishing === "staple" ? <span className="text-success font-semibold">FREE</span> : "—"} />
                <Row k="Binding" v={options.finishing === "bind" ? `₹${breakdown.bindingCost}` : "—"} />
                <Row k="Delivery" v={breakdown.freeDelivery ? <span className="text-success font-semibold">FREE</span> : `₹${breakdown.deliveryFee}`} />
                {options.urgent && <Row k="Express" v={`₹${breakdown.expressFee}`} />}
                {delivery.location && <Row k="ETA" v={<span className="text-primary font-semibold">~ {delivery.location.etaMin} mins*</span>} />}
              </div>
              {breakdown.freeDelivery && (
                <div className="mt-3 text-sm text-success font-medium flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4" /> Free Delivery unlocked!
                </div>
              )}
              <Button className="btn-hero w-full mt-5 h-11" onClick={place}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Place order
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate({ to: "/order" })}>Edit options</Button>
              <p className="text-[11px] text-muted-foreground mt-3">*Delivery times vary based on location, traffic, partner availability & order volume.</p>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}

function Card({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {children}
    </div>
  );
}

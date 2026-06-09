import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { calcCost, clearDraft, getDraft, placeOrder, type DeliveryDetails, type PrintOptions } from "@/lib/order-store";
import { Stepper } from "./order";
import { FileText, MapPin, Settings2, CheckCircle2 } from "lucide-react";
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
  const total = calcCost(options);

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
            <Card icon={FileText} title="Document">
              <div className="text-sm">{options.fileName}</div>
            </Card>
            <Card icon={Settings2} title="Print options">
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>{options.copies} {options.copies > 1 ? "copies" : "copy"} · {options.size} · {options.color === "bw" ? "B&W" : "Color"} · {options.sided === "single" ? "Single-sided" : "Double-sided"}</li>
                {options.binding && <li>Spiral binding</li>}
                {options.urgent && <li>Urgent delivery (under 2 hours)</li>}
              </ul>
            </Card>
            <Card icon={MapPin} title="Delivery">
              <div className="text-sm space-y-1">
                <div className="font-medium">{delivery.fullName} · {delivery.phone}</div>
                <div className="text-muted-foreground">{delivery.institute} — {delivery.department}</div>
                <div className="text-muted-foreground">{delivery.address}</div>
                <div className="text-muted-foreground">Preferred: {delivery.time}</div>
              </div>
            </Card>
          </div>
          <aside>
            <div className="card-elevated p-6 sticky top-24">
              <div className="text-sm text-muted-foreground">Estimated total</div>
              <div className="text-4xl font-bold text-primary mt-1">₹{total}</div>
              <Button className="btn-hero w-full mt-5 h-11" onClick={place}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Place order
              </Button>
              <Button variant="outline" className="w-full mt-2" onClick={() => navigate({ to: "/order" })}>Edit options</Button>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
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

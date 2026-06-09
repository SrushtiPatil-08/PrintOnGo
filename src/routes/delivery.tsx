import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { getDraft, saveDraft, type DeliveryDetails } from "@/lib/order-store";
import { Stepper } from "./order";
import { toast } from "sonner";

export const Route = createFileRoute("/delivery")({
  head: () => ({ meta: [{ title: "Delivery details — PrintOnGo" }] }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const navigate = useNavigate();
  const [d, setD] = useState<DeliveryDetails>({
    fullName: "", institute: "", department: "", phone: "", address: "", time: "Anytime",
  });
  const [hasOptions, setHasOptions] = useState(true);

  useEffect(() => {
    const draft = getDraft();
    if (!draft.options) setHasOptions(false);
    if (draft.delivery) setD(draft.delivery);
  }, []);

  const upd = <K extends keyof DeliveryDetails>(k: K, v: DeliveryDetails[K]) => setD(p => ({ ...p, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(d.phone)) { toast.error("Enter a valid 10-digit phone number"); return; }
    saveDraft({ delivery: d });
    navigate({ to: "/summary" });
  };

  if (!hasOptions) {
    return (
      <SiteLayout>
        <section className="container mx-auto px-4 max-w-2xl py-20 text-center">
          <h1 className="text-3xl font-bold mb-3">No order in progress</h1>
          <p className="text-muted-foreground mb-6">Start by uploading your document.</p>
          <Button asChild className="btn-hero"><Link to="/order">Start order</Link></Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-3xl py-12">
        <Stepper step={2} />
        <h1 className="text-4xl font-bold mt-6 mb-2">Delivery details</h1>
        <p className="text-muted-foreground mb-8">Where should we drop your prints?</p>
        <form onSubmit={submit} className="card-elevated p-6 space-y-5">
          <Field label="Full name"><Input required value={d.fullName} onChange={e => upd("fullName", e.target.value)} maxLength={80} /></Field>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="College / Institute"><Input required value={d.institute} onChange={e => upd("institute", e.target.value)} maxLength={120} /></Field>
            <Field label="Department"><Input required value={d.department} onChange={e => upd("department", e.target.value)} maxLength={80} /></Field>
          </div>
          <Field label="Phone number"><Input required type="tel" value={d.phone} onChange={e => upd("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" /></Field>
          <Field label="Delivery address">
            <Textarea required value={d.address} onChange={e => upd("address", e.target.value)} maxLength={300} placeholder="Hostel name, room number, landmark…" rows={3} />
          </Field>
          <Field label="Preferred delivery time">
            <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" value={d.time} onChange={e => upd("time", e.target.value)}>
              {["Anytime", "Morning (9-12)", "Afternoon (12-4)", "Evening (4-8)", "Night (8-10)"].map(o => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate({ to: "/order" })}>Back</Button>
            <Button type="submit" className="btn-hero flex-1">Review order</Button>
          </div>
        </form>
      </section>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-2 block text-sm">{label}</Label>{children}</div>;
}

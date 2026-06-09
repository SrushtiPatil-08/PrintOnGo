import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import { Upload, FileText, BadgeCheck } from "lucide-react";
import { calcBreakdown, calcCost, getDraft, saveDraft, type PrintOptions } from "@/lib/order-store";
import { toast } from "sonner";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Place an order — PrintOnGo" }] }),
  component: OrderPage,
});

function OrderPage() {
  const navigate = useNavigate();
  const [opts, setOpts] = useState<PrintOptions>({
    fileName: "", pages: 10, copies: 1, color: "bw", sided: "single", size: "A4", binding: false, urgent: false,
  });

  useEffect(() => {
    const d = getDraft();
    if (d.options) setOpts(d.options);
  }, []);

  const breakdown = calcBreakdown(opts);
  const update = <K extends keyof PrintOptions>(k: K, v: PrintOptions[K]) => setOpts(p => ({ ...p, [k]: v }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error("File too large (max 20MB)"); return; }
    update("fileName", f.name);
    toast.success(`Uploaded ${f.name}`);
  };

  const onContinue = () => {
    if (!opts.fileName) { toast.error("Please upload a document first"); return; }
    saveDraft({ options: opts });
    navigate({ to: "/delivery" });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-5xl py-12">
        <Stepper step={1} />
        <h1 className="text-4xl font-bold mt-6 mb-2">Place your order</h1>
        <p className="text-muted-foreground mb-8">Upload your file and pick the print options.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card-elevated p-6">
              <Label className="text-base font-semibold mb-3 block">1. Upload document</Label>
              <label htmlFor="file" className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/30">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">{opts.fileName ? opts.fileName : "Click to upload or drag & drop"}</div>
                <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPT, PNG, JPG — up to 20MB</div>
                <input id="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" className="hidden" onChange={onFile} />
              </label>
              {opts.fileName && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" /> {opts.fileName}
                </div>
              )}
            </div>

            <div className="card-elevated p-6 space-y-6">
              <Label className="text-base font-semibold block">2. Print options</Label>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm">Number of pages</Label>
                  <Input type="number" min={1} max={1000} value={opts.pages}
                    onChange={(e) => update("pages", Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Number of copies</Label>
                  <Input type="number" min={1} max={500} value={opts.copies}
                    onChange={(e) => update("copies", Math.max(1, parseInt(e.target.value) || 1))} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm">Paper size</Label>
                  <RadioGroup value={opts.size} onValueChange={(v) => update("size", v as "A4" | "A3")} className="flex gap-2">
                    {(["A4", "A3"] as const).map(s => (
                      <label key={s} className={`flex-1 border rounded-lg px-4 py-2.5 cursor-pointer text-center text-sm font-medium transition ${opts.size === s ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value={s} className="sr-only" /> {s}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div>
                  <Label className="mb-2 block text-sm">Color</Label>
                  <RadioGroup value={opts.color} onValueChange={(v) => update("color", v as "bw" | "color")} className="flex gap-2">
                    {[{ k: "bw", l: "Black & White" }, { k: "color", l: "Color" }].map(o => (
                      <label key={o.k} className={`flex-1 border rounded-lg px-4 py-2.5 cursor-pointer text-center text-sm font-medium transition ${opts.color === o.k ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value={o.k} className="sr-only" /> {o.l}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm">Sides</Label>
                  <RadioGroup value={opts.sided} onValueChange={(v) => update("sided", v as "single" | "double")} className="flex gap-2">
                    {[{ k: "single", l: "Single-sided" }, { k: "double", l: "Double-sided" }].map(o => (
                      <label key={o.k} className={`flex-1 border rounded-lg px-4 py-2.5 cursor-pointer text-center text-sm font-medium transition ${opts.sided === o.k ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value={o.k} className="sr-only" /> {o.l}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="flex items-end">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" /> Affordable Student Pricing
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <ToggleRow label="Spiral binding" desc="Adds ₹20 — great for reports & projects."
                  checked={opts.binding} onChange={(v) => update("binding", v)} />
                <ToggleRow label="Express delivery" desc="Additional ₹10 — delivered in under 2 hours."
                  checked={opts.urgent} onChange={(v) => update("urgent", v)} />
              </div>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Estimated cost</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide">
                  <BadgeCheck className="w-3 h-3" /> Student Pricing
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <Row k="Pages" v={String(opts.pages)} />
                <Row k="Copies" v={String(opts.copies)} />
                <Row k="Print type" v={opts.color === "bw" ? "B&W Printing" : "Color Printing"} />
                <Row k="Print cost" v={`₹${breakdown.printCost}`} />
                <Row k="Spiral binding" v={opts.binding ? `₹${breakdown.bindingCost}` : "—"} />
                <Row k="Delivery fee" v={breakdown.freeDelivery ? <span className="text-success font-semibold">FREE</span> : `₹${breakdown.deliveryFee}`} />
                {opts.urgent && <Row k="Express delivery" v={`₹${breakdown.expressFee}`} />}
              </div>
              {breakdown.freeDelivery && (
                <div className="mt-3 text-sm text-success font-medium flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4" /> You unlocked Free Delivery!
                </div>
              )}
              <div className="border-t border-border mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">₹{breakdown.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">*Free Standard Delivery on orders above ₹50. Express adds ₹10.</p>
              <Button className="btn-hero w-full mt-5 h-11" onClick={onContinue}>Continue to delivery</Button>
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

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Print options", "Delivery details", "Order summary"];
  return (
    <ol className="flex items-center gap-2 text-sm flex-wrap">
      {steps.map((s, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={s} className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${active ? "bg-primary text-primary-foreground" : done ? "bg-success text-success-foreground" : "bg-secondary text-muted-foreground"}`}>{n}</span>
            <span className={active ? "font-semibold" : "text-muted-foreground"}>{s}</span>
            {n < steps.length && <span className="w-8 h-px bg-border mx-1" />}
          </li>
        );
      })}
    </ol>
  );
}


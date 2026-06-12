import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useEffect, useState } from "react";
import {
  Upload, FileText, BadgeCheck, ShieldCheck, Lock, MapPin, Loader2, Navigation, Clock,
} from "lucide-react";
import {
  calcBreakdown, getDraft, saveDraft, type PrintOptions, type LocationInfo,
  detectPageCount, haversineKm, estimateFromDistance, PARTNER_COORDS, bindingCostFor,
  HUB_NAME, MAX_DELIVERY_RADIUS_KM, HYPERLOCAL_RADIUS_KM,
} from "@/lib/order-store";
import { toast } from "sonner";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Place an order — PrintOnGo" }] }),
  component: OrderPage,
});

function OrderPage() {
  const navigate = useNavigate();
  const [opts, setOpts] = useState<PrintOptions>({
    fileName: "", pages: 1, copies: 1, color: "bw", sided: "single", size: "A4",
    finishing: "none", urgent: false, autoDetectedPages: false,
  });
  const [location, setLocation] = useState<LocationInfo | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [parsing, setParsing] = useState(false);
  const [detectSource, setDetectSource] = useState<string | null>(null);

  useEffect(() => {
    const d = getDraft();
    if (d.options) setOpts(d.options);
    if (d.delivery?.location) setLocation(d.delivery.location);
  }, []);

  const breakdown = calcBreakdown(opts, location);
  const outOfBounds = !!location?.outOfBounds;
  const update = <K extends keyof PrintOptions>(k: K, v: PrintOptions[K]) => setOpts(p => ({ ...p, [k]: v }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 20 * 1024 * 1024) { toast.error("File too large (max 20MB)"); return; }
    update("fileName", f.name);
    setParsing(true);
    setDetectSource(null);
    const result = await detectPageCount(f);
    setParsing(false);
    if (result) {
      setOpts(p => ({ ...p, fileName: f.name, pages: result.pages, autoDetectedPages: result.source !== "estimate" }));
      setDetectSource(result.source);
      const label = result.source === "pptx-xml" ? "slides" : "pages";
      if (result.source === "estimate") {
        toast.message(`~${result.pages} ${label} estimated — please verify`);
      } else {
        toast.success(`Detected ${result.pages} ${label} from ${f.name}`);
      }
    } else {
      setOpts(p => ({ ...p, fileName: f.name, autoDetectedPages: false }));
      toast.error("Couldn't auto-detect — please enter pages manually");
    }
  };

  const applyCoords = (lat: number, lng: number, label: string) => {
    const distanceKm = haversineKm({ lat, lng }, PARTNER_COORDS);
    const est = estimateFromDistance(distanceKm);
    setLocation({
      lat, lng, label,
      distanceKm: Math.round(distanceKm * 10) / 10,
      etaMin: est.etaMin, deliveryFee: est.deliveryFee,
      hyperLocal: est.hyperLocal, outOfBounds: est.outOfBounds,
    });
  };

  const detectLocation = () => {
    if (!("geolocation" in navigator)) { toast.error("Geolocation not supported"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyCoords(pos.coords.latitude, pos.coords.longitude, `Detected · ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`);
        setLocating(false);
        toast.success("Location detected");
      },
      () => { setLocating(false); toast.error("Could not detect location. Enter address manually."); },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const useManual = () => {
    const a = manualAddress.trim();
    if (a.length < 5) { toast.error("Enter a more specific address"); return; }
    // Heuristic: simulate proximity to Vartak campus based on keywords
    const lc = a.toLowerCase();
    let distanceKm = 2.2;
    if (/(vartak|polytechnic|vasai|campus|hostel|college)/.test(lc)) distanceKm = 0.8;
    else if (/(virar|nallasopara|naigaon|bhayander|mira road)/.test(lc)) distanceKm = 4.6;
    const est = estimateFromDistance(distanceKm);
    setLocation({ label: a, distanceKm, etaMin: est.etaMin, deliveryFee: est.deliveryFee, hyperLocal: est.hyperLocal, outOfBounds: est.outOfBounds });
    if (est.outOfBounds) toast.error("Address is outside our delivery zone");
    else toast.success("Address saved");
  };

  const onContinue = () => {
    if (!opts.fileName) { toast.error("Please upload a document first"); return; }
    if (!location) { toast.error("Please set your delivery location"); return; }
    if (location.outOfBounds) { toast.error("Delivery unavailable for this address"); return; }
    saveDraft({ options: opts, delivery: { ...(getDraft().delivery ?? { fullName: "", institute: "", department: "", phone: "", address: "", time: "Anytime" }), location, address: location.label } });
    navigate({ to: "/delivery" });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-5xl py-12">
        <Stepper step={1} />
        <h1 className="text-4xl font-bold mt-6 mb-2">Place your order</h1>
        <p className="text-muted-foreground mb-8">Upload your file, pick options & set your delivery location.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Upload */}
            <div className="card-elevated p-6">
              <Label className="text-base font-semibold mb-3 block">1. Upload document</Label>
              <label htmlFor="file" className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/30">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">{opts.fileName ? opts.fileName : "Click to upload or drag & drop"}</div>
                <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPT, PNG, JPG — up to 20MB</div>
                <input id="file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" className="hidden" onChange={onFile} />
              </label>
              {parsing && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" /> Analyzing document pages…
                </div>
              )}
              {!parsing && opts.fileName && (
                <div className="mt-3 flex items-center justify-between text-sm flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="w-4 h-4" /> {opts.fileName}
                  </div>
                  {opts.autoDetectedPages ? (
                    <span className="inline-flex items-center gap-1 text-xs text-success font-semibold">
                      <BadgeCheck className="w-3.5 h-3.5" /> ✅ {opts.pages} {detectSource === "pptx-xml" ? "slides" : "pages"} detected
                    </span>
                  ) : detectSource === "estimate" ? (
                    <span className="text-xs text-muted-foreground">~{opts.pages} pages estimated — verify below</span>
                  ) : null}
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Pill icon={ShieldCheck} text="End-to-End Encrypted Upload" />
                <Pill icon={Lock} text="Secure Processing" />
                <Pill icon={BadgeCheck} text="Auto-Deleted After Delivery" />
              </div>
            </div>

            {/* 2. Print options */}
            <div className="card-elevated p-6 space-y-6">
              <Label className="text-base font-semibold block">2. Print options</Label>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 block text-sm">
                    Number of pages {opts.autoDetectedPages && <span className="text-success text-[10px] font-semibold ml-1">AUTO</span>}
                  </Label>
                  <Input type="number" min={1} max={1000} value={opts.pages}
                    onChange={(e) => setOpts(p => ({ ...p, pages: Math.max(1, parseInt(e.target.value) || 1), autoDetectedPages: false }))} />
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
                  <Label className="mb-2 block text-sm">Color · ₹{opts.color === "color" ? 10 : 3}/page</Label>
                  <RadioGroup value={opts.color} onValueChange={(v) => update("color", v as "bw" | "color")} className="flex gap-2">
                    {[{ k: "bw", l: "B&W ₹3" }, { k: "color", l: "Color ₹10" }].map(o => (
                      <label key={o.k} className={`flex-1 border rounded-lg px-4 py-2.5 cursor-pointer text-center text-sm font-medium transition ${opts.color === o.k ? "border-primary bg-primary/5" : "border-border"}`}>
                        <RadioGroupItem value={o.k} className="sr-only" /> {o.l}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-sm">Sides</Label>
                <RadioGroup value={opts.sided} onValueChange={(v) => update("sided", v as "single" | "double")} className="flex gap-2 max-w-sm">
                  {[{ k: "single", l: "Single-sided" }, { k: "double", l: "Double-sided" }].map(o => (
                    <label key={o.k} className={`flex-1 border rounded-lg px-4 py-2.5 cursor-pointer text-center text-sm font-medium transition ${opts.sided === o.k ? "border-primary bg-primary/5" : "border-border"}`}>
                      <RadioGroupItem value={o.k} className="sr-only" /> {o.l}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block text-sm">Finishing</Label>
                <div className="grid sm:grid-cols-3 gap-2">
                  {[
                    { k: "none", l: "None", sub: "Loose sheets" },
                    { k: "staple", l: "Staple", sub: "FREE · Included" },
                    { k: "bind", l: "Bind", sub: `₹${bindingCostFor(opts.pages)} for ${opts.pages}p` },
                  ].map(o => (
                    <button
                      type="button"
                      key={o.k}
                      onClick={() => update("finishing", o.k as PrintOptions["finishing"])}
                      className={`text-left border rounded-lg px-3 py-2.5 text-sm transition ${opts.finishing === o.k ? "border-primary bg-primary/5" : "border-border"}`}
                    >
                      <div className="font-medium">{o.l}</div>
                      <div className="text-[11px] text-muted-foreground">{o.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                <ToggleRow label="Express delivery" desc="Additional ₹15 — prioritized printing & dispatch."
                  checked={opts.urgent} onChange={(v) => update("urgent", v)} />
              </div>
            </div>

            {/* 3. Location */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold block">3. Delivery location</Label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold uppercase">
                  <Clock className="w-3 h-3" /> 10-min*
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Hyper-local printing from <span className="font-medium text-foreground">{HUB_NAME}</span>. Orders within {HYPERLOCAL_RADIUS_KM} km arrive in under 10 minutes. Max delivery radius: {MAX_DELIVERY_RADIUS_KM} km.
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <Button type="button" variant="outline" onClick={detectLocation} disabled={locating} className="h-10">
                  {locating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                  Use Current Location
                </Button>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Or enter address manually (hostel, college, area)…" value={manualAddress} onChange={e => setManualAddress(e.target.value)} maxLength={200} />
                <Button type="button" onClick={useManual} variant="secondary">Set</Button>
              </div>

              {location && !location.outOfBounds && (
                <div className="mt-4 grid sm:grid-cols-3 gap-3">
                  <LocStat icon={MapPin} label={`Distance from ${HUB_NAME}`} value={`${location.distanceKm} km`} />
                  <LocStat icon={Clock} label="Estimated delivery time" value={location.hyperLocal ? "Under 10 mins" : `~ ${location.etaMin} mins`} success={location.hyperLocal} />
                  <LocStat icon={BadgeCheck} label="Delivery charges" value={breakdown.freeDelivery ? "FREE" : `₹${location.deliveryFee}`} success={breakdown.freeDelivery} />
                  {location.hyperLocal && (
                    <div className="sm:col-span-3 rounded-lg border border-success/30 bg-success/5 text-success text-xs font-semibold px-3 py-2 inline-flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4" /> Hyper-local zone · delivered in under 10 mins
                    </div>
                  )}
                  <div className="sm:col-span-3 rounded-lg overflow-hidden border border-border bg-secondary/30 h-36 flex items-center justify-center text-xs text-muted-foreground">
                    {location.lat && location.lng ? (
                      <iframe
                        title="Location preview"
                        className="w-full h-full"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&marker=${location.lat},${location.lng}`}
                      />
                    ) : (
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {location.label}</div>
                    )}
                  </div>
                </div>
              )}

              {outOfBounds && (
                <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 text-destructive text-sm px-4 py-3">
                  Sorry! PrintOnGo is currently only operating within a 10–20 min hyper-local radius of university campuses like Vartak Polytechnic.
                </div>
              )}

              <p className="mt-3 text-[11px] text-muted-foreground">
                *Delivery times vary based on customer location, traffic, print partner availability & order volume.
              </p>
            </div>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-1">
            <div className="card-elevated p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Live order summary</h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-semibold uppercase tracking-wide">
                  <BadgeCheck className="w-3 h-3" /> Student
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <Row k="Total pages" v={String(opts.pages)} />
                <Row k="Copies" v={String(opts.copies)} />
                <Row k="Print type" v={opts.color === "bw" ? `B&W · ₹${breakdown.printRate}/pg` : `Color · ₹${breakdown.printRate}/pg`} />
                <Row k="Print cost" v={`₹${breakdown.printCost}`} />
                <Row k="Stapling" v={opts.finishing === "staple" ? <span className="text-success font-semibold">FREE</span> : "—"} />
                <Row k="Binding" v={opts.finishing === "bind" ? `₹${breakdown.bindingCost}` : "—"} />
                <Row
                  k={location ? `Delivery (${location.distanceKm} km)` : "Delivery"}
                  v={breakdown.freeDelivery ? <span className="text-success font-semibold">FREE</span> : `₹${breakdown.deliveryFee}`}
                />
                {opts.urgent && <Row k="Express" v={`₹${breakdown.expressFee}`} />}
                {location && <Row k="ETA" v={<span className="text-primary font-semibold">~ {location.etaMin} mins</span>} />}
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
              <p className="text-xs text-muted-foreground mt-2">B&W ₹3/pg · Color ₹10/pg · Stapling free · Free delivery above ₹199.</p>
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

function Pill({ icon: Icon, text }: { icon: React.ComponentType<{ className?: string }>; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success font-semibold">
      <Icon className="w-3 h-3" /> {text}
    </span>
  );
}

function LocStat({ icon: Icon, label, value, success }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; success?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Icon className="w-3.5 h-3.5 text-primary" /> {label}
      </div>
      <div className={`text-base font-semibold mt-0.5 ${success ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}

export function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Print & location", "Delivery details", "Order summary"];
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

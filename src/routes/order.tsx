import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo, useState } from "react";
import {
  Upload, FileText, BadgeCheck, ShieldCheck, Lock, MapPin, Loader2, Navigation, Clock, Plus, Trash2,
} from "lucide-react";
import {
  calcBreakdown, getDraft, saveDraft, type PrintOptions, type LocationInfo, type DocItem,
  detectPageCount, haversineKm, estimateFromDistance, PARTNER_COORDS,
  HUB_NAME, MAX_DELIVERY_RADIUS_KM, HYPERLOCAL_RADIUS_KM, rateFor,
} from "@/lib/order-store";
import { toast } from "sonner";

export const Route = createFileRoute("/order")({
  head: () => ({ meta: [{ title: "Place an order — PrintOnGo" }] }),
  component: OrderPage,
});

const MAX_SIZE = 20 * 1024 * 1024;
const newId = () => Math.random().toString(36).slice(2, 9);

function OrderPage() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [urgent, setUrgent] = useState(false);
  const [location, setLocation] = useState<LocationInfo | undefined>(undefined);
  const [locating, setLocating] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [parsingIds, setParsingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const d = getDraft();
    if (d.options?.documents?.length) setDocs(d.options.documents);
    if (d.options?.urgent) setUrgent(true);
    if (d.delivery?.location) setLocation(d.delivery.location);
  }, []);

  // Build aggregate PrintOptions for the calculation engine
  const opts: PrintOptions = useMemo(() => {
    const first = docs[0];
    return {
      fileName: docs.length === 0 ? "" : docs.length === 1 ? first.fileName : `${first.fileName} +${docs.length - 1} more`,
      pages: docs.reduce((s, d) => s + (d.pages || 0), 0),
      copies: docs.reduce((s, d) => s + (d.copies || 0), 0),
      color: docs.some(d => d.color === "color") ? "color" : "bw",
      sided: "single",
      size: "A4",
      finishing: docs.some(d => d.staple) ? "staple" : "none",
      urgent,
      autoDetectedPages: docs.every(d => d.autoDetectedPages),
      documents: docs,
    };
  }, [docs, urgent]);

  const breakdown = calcBreakdown(opts, location);
  const outOfBounds = !!location?.outOfBounds;

  const allDetected = docs.length > 0 && docs.every(d => d.pages > 0);
  const anyParsing = Object.values(parsingIds).some(Boolean);
  const canContinue = docs.length > 0 && allDetected && !anyParsing && !!location && !outOfBounds;

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: DocItem[] = [];
    for (const f of Array.from(files)) {
      if (f.size > MAX_SIZE) { toast.error(`${f.name} is over 20MB`); continue; }
      accepted.push({
        id: newId(), fileName: f.name, pages: 0, copies: 1, color: "bw", staple: false,
      });
    }
    if (accepted.length === 0) return;
    setDocs(prev => [...prev, ...accepted]);

    // Parse each file in parallel
    await Promise.all(accepted.map(async (item, idx) => {
      const f = files[idx];
      if (!f || f.name !== item.fileName) return;
      setParsingIds(p => ({ ...p, [item.id]: true }));
      try {
        const result = await detectPageCount(f);
        setDocs(prev => prev.map(d => d.id === item.id
          ? { ...d, pages: result?.pages ?? 1, autoDetectedPages: !!result && result.source !== "estimate", detectSource: result?.source }
          : d));
        if (result) {
          const label = result.source === "pptx-xml" ? "slides" : "pages";
          if (result.source === "estimate") toast.message(`~${result.pages} ${label} estimated for ${f.name}`);
          else toast.success(`Detected ${result.pages} ${label} in ${f.name}`);
        } else {
          toast.error(`Couldn't read ${f.name} — set pages manually`);
        }
      } finally {
        setParsingIds(p => { const n = { ...p }; delete n[item.id]; return n; });
      }
    }));
  };

  const updateDoc = (id: string, patch: Partial<DocItem>) =>
    setDocs(prev => prev.map(d => d.id === id ? { ...d, ...patch } : d));
  const removeDoc = (id: string) => setDocs(prev => prev.filter(d => d.id !== id));

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
    if (docs.length === 0) { toast.error("Upload at least one document"); return; }
    if (!allDetected) { toast.error("Set page count for every document"); return; }
    if (anyParsing) { toast.error("Still analyzing documents…"); return; }
    if (!location) { toast.error("Please set your delivery location"); return; }
    if (location.outOfBounds) { toast.error("Delivery unavailable for this address"); return; }
    const prevDelivery = getDraft().delivery ?? { fullName: "", institute: "", department: "", phone: "", address: "", time: "Anytime" };
    saveDraft({ options: opts, delivery: { ...prevDelivery, location, address: location.label } });
    navigate({ to: "/delivery" });
  };

  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-5xl py-12">
        <Stepper step={1} />
        <h1 className="text-4xl font-bold mt-6 mb-2">Place your order</h1>
        <p className="text-muted-foreground mb-8">Upload one or many documents, configure each, then set your delivery location.</p>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Upload */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold">1. Upload documents</Label>
                {docs.length > 0 && (
                  <span className="text-xs text-muted-foreground">{docs.length} file{docs.length > 1 ? "s" : ""} queued</span>
                )}
              </div>
              <label htmlFor="file" className="block border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors bg-secondary/30">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="font-medium">{docs.length === 0 ? "Click to upload or drag & drop" : "Add more files"}</div>
                <div className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPT, PNG, JPG — up to 20MB each · multiple allowed</div>
                <input id="file" type="file" multiple accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
              </label>

              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <Pill icon={ShieldCheck} text="End-to-End Encrypted Upload" />
                <Pill icon={Lock} text="Secure Processing" />
                <Pill icon={BadgeCheck} text="Auto-Deleted After Delivery" />
              </div>
            </div>

            {/* 2. Per-document print options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">2. Print options (per document)</Label>
                {docs.length > 1 && <span className="text-xs text-muted-foreground">Configure each independently</span>}
              </div>

              {docs.length === 0 && (
                <div className="card-elevated p-8 text-center text-sm text-muted-foreground">
                  <Plus className="w-5 h-5 mx-auto mb-2 opacity-60" />
                  Upload a document above to configure print options.
                </div>
              )}

              {docs.map((d, idx) => {
                const parsing = !!parsingIds[d.id];
                const lineCost = d.pages * d.copies * rateFor(d.color);
                return (
                  <div key={d.id} className="card-elevated p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wide">Doc {idx + 1}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{d.fileName}</span>
                        </div>
                        <div className="mt-1 text-xs">
                          {parsing ? (
                            <span className="inline-flex items-center gap-1 text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Analyzing pages…</span>
                          ) : d.autoDetectedPages ? (
                            <span className="inline-flex items-center gap-1 text-success font-semibold"><BadgeCheck className="w-3 h-3" /> {d.pages} {d.detectSource === "pptx-xml" ? "slides" : "pages"} detected</span>
                          ) : d.pages > 0 ? (
                            <span className="text-muted-foreground">~{d.pages} pages estimated — verify</span>
                          ) : (
                            <span className="text-destructive">Pages not detected</span>
                          )}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeDoc(d.id)} aria-label="Remove file">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block text-sm">Pages {d.autoDetectedPages && <span className="text-success text-[10px] font-semibold ml-1">AUTO</span>}</Label>
                        <Input type="number" min={1} max={2000} value={d.pages || ""}
                          onChange={(e) => updateDoc(d.id, { pages: Math.max(1, parseInt(e.target.value) || 1), autoDetectedPages: false })} />
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm">Copies</Label>
                        <Input type="number" min={1} max={500} value={d.copies}
                          onChange={(e) => updateDoc(d.id, { copies: Math.max(1, parseInt(e.target.value) || 1) })} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label className="mb-2 block text-sm">Color mode</Label>
                        <div className="flex gap-2">
                          {[{ k: "bw", l: "B&W ₹3/pg" }, { k: "color", l: "Color ₹10/pg" }].map(o => (
                            <button type="button" key={o.k} onClick={() => updateDoc(d.id, { color: o.k as "bw" | "color" })}
                              className={`flex-1 border rounded-lg px-3 py-2.5 text-sm font-medium transition ${d.color === o.k ? "border-primary bg-primary/5" : "border-border"}`}>
                              {o.l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm">Finishing</Label>
                        <div className="flex items-center justify-between border rounded-lg px-3 py-2.5">
                          <div>
                            <div className="text-sm font-medium">Staple</div>
                            <div className="text-[11px] text-muted-foreground">Free for students</div>
                          </div>
                          <Switch checked={d.staple} onCheckedChange={(v) => updateDoc(d.id, { staple: v })} />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{d.pages} pg × {d.copies} cp × ₹{rateFor(d.color)}</span>
                      <span className="font-semibold">₹{lineCost}</span>
                    </div>
                  </div>
                );
              })}

              {docs.length > 0 && (
                <div className="card-elevated p-4">
                  <ToggleRow label="Express delivery" desc="Additional ₹15 — prioritized printing & dispatch."
                    checked={urgent} onChange={setUrgent} />
                </div>
              )}
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

              {docs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add documents to see your total.</p>
              ) : (
                <>
                  <div className="space-y-2 text-sm max-h-48 overflow-auto pr-1">
                    {docs.map((d, i) => (
                      <div key={d.id} className="flex justify-between gap-2">
                        <span className="text-muted-foreground truncate">
                          {i + 1}. {d.fileName.length > 18 ? d.fileName.slice(0, 16) + "…" : d.fileName}
                          <span className="ml-1 text-[11px]">({d.color === "bw" ? "B&W" : "Color"}{d.staple ? " · Stp" : ""})</span>
                        </span>
                        <span className="font-medium shrink-0">₹{d.pages * d.copies * rateFor(d.color)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border my-3" />
                  <div className="space-y-2 text-sm">
                    <Row k="Total pages" v={String(breakdown.pages)} />
                    <Row k="Total copies" v={String(breakdown.copies)} />
                    <Row k="Print cost" v={`₹${breakdown.printCost}`} />
                    <Row
                      k={location ? `Delivery (${location.distanceKm} km)` : "Delivery"}
                      v={breakdown.freeDelivery ? <span className="text-success font-semibold">FREE</span> : `₹${breakdown.deliveryFee}`}
                    />
                    {urgent && <Row k="Express" v={`₹${breakdown.expressFee}`} />}
                    {location && <Row k="ETA" v={<span className="text-primary font-semibold">~ {location.etaMin} mins</span>} />}
                  </div>
                </>
              )}

              {breakdown.freeDelivery && docs.length > 0 && (
                <div className="mt-3 text-sm text-success font-medium flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4" /> You unlocked Free Delivery!
                </div>
              )}
              <div className="border-t border-border mt-4 pt-4 flex justify-between items-baseline">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-3xl font-bold text-primary">₹{breakdown.total}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">B&W ₹3/pg · Color ₹10/pg · Stapling free · Free delivery above ₹199.</p>
              <Button className="btn-hero w-full mt-5 h-11" onClick={onContinue} disabled={!canContinue}>
                {outOfBounds ? "Out of delivery zone"
                  : docs.length === 0 ? "Upload a document"
                  : !allDetected || anyParsing ? "Set pages for all docs"
                  : !location ? "Set delivery location"
                  : "Continue to delivery"}
              </Button>
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

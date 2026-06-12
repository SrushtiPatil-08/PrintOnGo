import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import {
  Upload, Settings2, Truck, Clock, Wallet, Sparkles, ShieldCheck, ArrowRight, Quote, Star,
  BadgeCheck, MapPin, FileText, Lock, Trash2, Files, Printer,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrintOnGo — Upload. Print. Deliver." },
      { name: "description", content: "Upload documents, print securely, and get them delivered to your hostel, classroom or home — in as little as 10 minutes." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-soft)" }} />
        <div className="absolute top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: "var(--gradient-primary)" }} />
        <div className="container mx-auto px-4 max-w-7xl py-20 md:py-28 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> Built for students. Loved by 10,000+
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" /> Affordable Student Pricing
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6">
              Upload. Print.{" "}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: "var(--gradient-primary)" }}>Deliver.</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Upload your documents securely. We auto-detect pages, calculate costs, print professionally and deliver to your location — fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-hero h-12 px-6 text-base">
                <Link to="/order">Order Now <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/track">Track Order</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 text-xs">
              <Badge icon={MapPin} label="Location-Based Express Delivery" />
              <Badge icon={Clock} label="Delivery in as little as 10 minutes*" />
              <Badge icon={Truck} label="Live Order Tracking" />
              <Badge icon={ShieldCheck} label="Secure Document Printing" />
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              *Delivery times vary based on customer location, traffic, print partner availability & order volume.
            </p>
          </div>

          {/* Hero visual — illustration removed; replaced with floating doc/print/delivery elements */}
          <div className="relative h-[460px] hidden lg:block">
            <div className="absolute inset-0 blur-3xl opacity-30 rounded-full" style={{ background: "var(--gradient-primary)" }} />
            <FloatCard className="top-8 left-6 w-56 animate-fade-in" icon={FileText} title="DBMS_Assignment.pdf" sub="20 pages · auto-detected" />
            <FloatCard className="top-32 right-4 w-60" icon={Printer} title="Printing in progress" sub="Color · A4 · 2 copies" tone="success" />
            <FloatCard className="bottom-28 left-2 w-56" icon={MapPin} title="2.4 km away" sub="ETA ~ 18 mins" tone="primary" />
            <FloatCard className="bottom-6 right-10 w-60" icon={ShieldCheck} title="End-to-End Encrypted" sub="Auto-deleted after delivery" />
            <FloatCard className="top-[46%] left-[42%] w-48" icon={Files} title="Cost calculated" sub="₹3 B&W · ₹10 Color" tone="primary" />
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "10K+", l: "Happy students" },
            { v: "50+", l: "Campuses served" },
            { v: "~10 min*", l: "Express delivery" },
            { v: "₹3", l: "B&W / page" },
          ].map((s) => (
            <div key={s.l} className="card-elevated p-6 text-center">
              <div className="text-3xl font-display font-bold text-primary">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps. Zero queues.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: Upload, t: "Upload Document", d: "Drop your PDF, DOCX, PPT or images. Pages are auto-detected instantly." },
            { i: Settings2, t: "Choose Options", d: "B&W ₹3/page, Color ₹10/page. Add stapling (free) or binding." },
            { i: Truck, t: "Location-Based Delivery", d: "We print and deliver to your location — in as little as 10 minutes*." },
          ].map((s, idx) => (
            <div key={s.t} className="card-elevated p-8 relative overflow-hidden group hover:shadow-glow transition-all">
              <div className="absolute -top-6 -right-6 text-[120px] font-display font-bold text-primary/5">{idx + 1}</div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <s.i className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.t}</h3>
              <p className="text-muted-foreground text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY TRUST */}
      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="card-elevated p-10 md:p-14 bg-[hsl(210_40%_98%)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-semibold mb-3">
              <Lock className="w-3.5 h-3.5" /> Your Documents Are Safe
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Enterprise-grade document security</h2>
            <p className="text-muted-foreground">Encrypted in transit, accessible only to assigned print partners, and auto-deleted after delivery.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { i: ShieldCheck, t: "End-to-End Encryption", d: "Uploads encrypted in transit and at rest." },
              { i: Lock, t: "Secure Cloud Storage", d: "Access restricted to assigned printer." },
              { i: Trash2, t: "Auto File Deletion", d: "Files deleted within 24h of delivery." },
              { i: BadgeCheck, t: "Privacy Protected", d: "Trusted by students & professionals." },
            ].map((s) => (
              <div key={s.t} className="bg-background rounded-2xl border border-border p-5">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-primary bg-primary/10 mb-3">
                  <s.i className="w-5 h-5" />
                </div>
                <div className="font-semibold mb-1 text-sm">{s.t}</div>
                <p className="text-xs text-muted-foreground">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="rounded-3xl p-10 md:p-16 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
          <h2 className="text-4xl font-bold mb-10 max-w-2xl">Why students choose PrintOnGo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { i: Clock, t: "No queues", d: "Skip the wait at the print shop." },
              { i: MapPin, t: "Location-based", d: "Dynamic ETA based on distance." },
              { i: Wallet, t: "Affordable", d: "B&W ₹3, Color ₹10 — transparent." },
              { i: ShieldCheck, t: "Secure", d: "Encrypted, auto-deleted documents." },
            ].map(b => (
              <div key={b.t} className="bg-white/10 backdrop-blur p-5 rounded-2xl border border-white/15">
                <b.i className="w-6 h-6 mb-3" />
                <div className="font-semibold mb-1">{b.t}</div>
                <div className="text-sm opacity-80">{b.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">Students love it</h2>
          <p className="text-muted-foreground text-lg">Real stories from real campuses.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Ananya R.", c: "IIT Bombay", q: "Submitted my final-year report without leaving the hostel. Lifesaver during deadlines." },
            { n: "Karthik V.", c: "VIT Vellore", q: "Spiral binding delivered in minutes. Pricing is super reasonable." },
            { n: "Sneha M.", c: "Delhi University", q: "I print all my study notes through PrintOnGo now. Quality is premium." },
          ].map(t => (
            <div key={t.n} className="card-elevated p-6">
              <Quote className="w-6 h-6 text-primary mb-3" />
              <p className="text-foreground/90 mb-4">"{t.q}"</p>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm">{t.n}</div>
                  <div className="text-xs text-muted-foreground">{t.c}</div>
                </div>
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="card-elevated p-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Ready to print smarter?</h2>
          <p className="text-muted-foreground mb-6">Place your first order in under a minute.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="btn-hero h-12 px-8">
              <Link to="/order">Start your order <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              <Clock className="w-4 h-4" /> Delivery in as little as 10 minutes*
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Badge({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground/80 font-medium">
      <Icon className="w-3.5 h-3.5 text-primary" /> <span>{label}</span>
    </div>
  );
}

function FloatCard({
  className = "", icon: Icon, title, sub, tone = "default",
}: { className?: string; icon: React.ComponentType<{ className?: string }>; title: string; sub: string; tone?: "default" | "primary" | "success" }) {
  const toneCls =
    tone === "primary" ? "bg-primary/10 text-primary" :
    tone === "success" ? "bg-success/10 text-success" :
    "bg-secondary text-foreground";
  return (
    <div className={`absolute card-elevated p-3 rounded-xl bg-background/95 backdrop-blur border border-border flex items-center gap-3 ${className}`}>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${toneCls}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{title}</div>
        <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
      </div>
    </div>
  );
}

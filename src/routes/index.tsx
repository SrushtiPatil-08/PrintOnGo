import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Upload, Settings2, Truck, Clock, Wallet, Sparkles, ShieldCheck, ArrowRight, Quote, Star, BadgeCheck, Package } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PrintOnGo — Upload. Print. Deliver." },
      { name: "description", content: "Upload your documents, choose print options, and get them delivered to your college, hostel or home." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
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
              Skip the queue at the print shop. PrintOnGo gets your assignments, notes and reports printed and dropped at your hostel, classroom or doorstep — fast.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-hero h-12 px-6 text-base">
                <Link to="/order">Order Now <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/track">Track Order</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Secure uploads</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> 2-hour delivery</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 blur-3xl opacity-40 rounded-full" style={{ background: "var(--gradient-primary)" }} />
            <img src={heroImg} alt="Student uploading documents to PrintOnGo" width={1280} height={960} className="relative rounded-3xl shadow-2xl border border-border" />
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { v: "10K+", l: "Happy students" },
            { v: "50+", l: "Campuses served" },
            { v: "2 hrs", l: "Avg delivery" },
            { v: "₹1", l: "Per page from" },
          ].map((s) => (
            <div key={s.l} className="card-elevated p-6 text-center">
              <div className="text-3xl font-display font-bold text-primary">{s.v}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How it works</h2>
          <p className="text-muted-foreground text-lg">Three simple steps. Zero queues.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: Upload, t: "Upload Document", d: "Drop your PDF, DOCX, PPT or images. Securely uploaded in seconds." },
            { i: Settings2, t: "Choose Print Options", d: "Color, B&W, copies, A4/A3, double-sided, spiral binding — you decide." },
            { i: Truck, t: "Get It Delivered", d: "We print, quality-check and deliver to your hostel, class or home." },
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

      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="rounded-3xl p-10 md:p-16 text-primary-foreground relative overflow-hidden" style={{ background: "var(--gradient-primary)" }}>
          <h2 className="text-4xl font-bold mb-10 max-w-2xl">Why students choose PrintOnGo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {[
              { i: Clock, t: "No queues", d: "Skip the wait at the print shop." },
              { i: Truck, t: "Fast delivery", d: "From 2 hours, right to your door." },
              { i: Wallet, t: "Affordable", d: "Pay from ₹1/page with bulk discounts." },
              { i: ShieldCheck, t: "Easy ordering", d: "From upload to delivery in 3 taps." },
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

      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-3">Students love it</h2>
          <p className="text-muted-foreground text-lg">Real stories from real campuses.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { n: "Ananya R.", c: "IIT Bombay", q: "Submitted my final-year report without leaving the hostel. Lifesaver during deadlines." },
            { n: "Karthik V.", c: "VIT Vellore", q: "Spiral binding done and delivered in 2 hours. The pricing is also super reasonable." },
            { n: "Sneha M.", c: "Delhi University", q: "I print all my study notes through PrintOnGo now. Quality is genuinely premium." },
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

      <section className="container mx-auto px-4 max-w-7xl section-pad">
        <div className="card-elevated p-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Ready to print smarter?</h2>
          <p className="text-muted-foreground mb-6">Place your first order in under a minute.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="btn-hero h-12 px-8">
              <Link to="/order">Start your order <ArrowRight className="ml-1 w-4 h-4" /></Link>
            </Button>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-semibold">
              <Package className="w-4 h-4" /> Free Delivery Above ₹50
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}


import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Target, Heart, Rocket, ShieldCheck, Lock, Trash2 } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — PrintOnGo" }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-4xl py-16">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium mb-4">Our story</div>
          <h1 className="text-5xl font-bold mb-4">Printing, reimagined for students.</h1>
          <p className="text-lg text-muted-foreground">PrintOnGo was born in a college hostel after a missed submission because the campus print shop had an endless queue.</p>
        </div>
        <div className="card-elevated p-8 mb-8">
          <h2 className="text-2xl font-bold mb-3">Our mission</h2>
          <p className="text-muted-foreground">Give every student in India fast, affordable, and secure printing — wherever they are. Documents printed and delivered in as little as 10 minutes* through a location-based printing network.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { i: Target, t: "Student-first", d: "Built around real student workflows and deadlines." },
            { i: Rocket, t: "Fast by design", d: "Location-based express delivery from your nearest partner." },
            { i: Heart, t: "Honest pricing", d: "B&W ₹3/page, Color ₹10/page. No hidden fees." },
          ].map(v => (
            <div key={v.t} className="card-elevated p-6">
              <v.i className="w-6 h-6 text-primary mb-3" />
              <div className="font-semibold mb-1">{v.t}</div>
              <p className="text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>

        <div className="card-elevated p-8 mb-8 bg-[hsl(210_40%_98%)]">
          <h2 className="text-2xl font-bold mb-4">Your documents are safe</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { i: ShieldCheck, t: "End-to-End Encrypted", d: "Encrypted upload and storage." },
              { i: Lock, t: "Secure Processing", d: "Authorized partners only." },
              { i: Trash2, t: "Auto-Deleted", d: "Removed within 24h of delivery." },
            ].map(v => (
              <div key={v.t} className="bg-background rounded-xl border border-border p-5">
                <v.i className="w-5 h-5 text-primary mb-2" />
                <div className="font-semibold text-sm">{v.t}</div>
                <p className="text-xs text-muted-foreground mt-1">{v.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Button asChild className="btn-hero h-11 px-6"><Link to="/order">Try PrintOnGo</Link></Button>
        </div>
        <p className="text-[11px] text-muted-foreground text-center mt-6">
          *Delivery times vary based on location, traffic, print partner availability & order volume.
        </p>
      </section>
    </SiteLayout>
  );
}

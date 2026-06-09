import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Target, Heart, Rocket } from "lucide-react";

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
          <p className="text-lg text-muted-foreground">PrintOnGo was born in a college hostel after a missed submission deadline because the campus print shop had a 2-hour queue.</p>
        </div>
        <div className="card-elevated p-8 mb-8">
          <h2 className="text-2xl font-bold mb-3">Our mission</h2>
          <p className="text-muted-foreground">To give every student in India fast, affordable and stress-free access to printing — wherever they are. No queues, no last-minute panic, no compromises on quality.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            { i: Target, t: "Student-first", d: "Built around real student workflows and deadlines." },
            { i: Rocket, t: "Fast by design", d: "Two-hour delivery from upload to doorstep." },
            { i: Heart, t: "Honest pricing", d: "Transparent rates from ₹2/page. Bulk discounts." },
          ].map(v => (
            <div key={v.t} className="card-elevated p-6">
              <v.i className="w-6 h-6 text-primary mb-3" />
              <div className="font-semibold mb-1">{v.t}</div>
              <p className="text-sm text-muted-foreground">{v.d}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Button asChild className="btn-hero h-11 px-6"><Link to="/order">Try PrintOnGo</Link></Button>
        </div>
      </section>
    </SiteLayout>
  );
}

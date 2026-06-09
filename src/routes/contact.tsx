import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(5).max(1000),
});

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact us — PrintOnGo" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { toast.error(r.error.issues[0]?.message ?? "Invalid input"); return; }
    toast.success("Message sent! We'll reply within 24 hours.");
    setForm({ name: "", email: "", message: "" });
  };
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-5xl py-16">
        <h1 className="text-5xl font-bold mb-3">Get in touch</h1>
        <p className="text-muted-foreground mb-10">We typically reply within 24 hours.</p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Info icon={Mail} label="Email" v="hello@printongo.in" />
            <Info icon={Phone} label="Phone" v="+91 98765 43210" />
            <Info icon={MapPin} label="HQ" v="Bengaluru, India" />
          </div>
          <form onSubmit={submit} className="card-elevated p-6 md:col-span-2 space-y-4">
            <div><Label className="mb-2 block">Your name</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} maxLength={80} required /></div>
            <div><Label className="mb-2 block">Email</Label><Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} maxLength={200} required /></div>
            <div><Label className="mb-2 block">Message</Label><Textarea rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} maxLength={1000} required /></div>
            <Button type="submit" className="btn-hero w-full h-11">Send message</Button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}

function Info({ icon: Icon, label, v }: { icon: React.ComponentType<{ className?: string }>; label: string; v: string }) {
  return (
    <div className="card-elevated p-5 flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-primary-foreground shrink-0" style={{ background: "var(--gradient-primary)" }}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{v}</div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "What file types can I upload?", a: "PDF, DOCX, PPT/PPTX and common image formats (PNG, JPG). Maximum file size is 20MB." },
  { q: "How fast is delivery?", a: "Standard delivery is within 6 hours. With urgent delivery, your order arrives in under 2 hours within partner campuses." },
  { q: "How is the price calculated?", a: "B&W starts at ₹2/page, color at ₹8/page. Add-ons like spiral binding (₹30) and urgent delivery (₹50) are optional. The estimate updates live as you change options." },
  { q: "Where do you deliver?", a: "Currently on 50+ campuses across India including IITs, NITs, DU, VIT and major coaching institutes. Hostel, classroom and home delivery supported." },
  { q: "Is my document safe?", a: "Yes. Uploads are encrypted, accessible only to the assigned print partner, and securely deleted after 7 days." },
  { q: "Can I cancel an order?", a: "Yes, until the order moves to 'Printing in Progress'. After that, the order is locked to ensure on-time delivery." },
];

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — PrintOnGo" }] }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 max-w-3xl py-16">
        <h1 className="text-5xl font-bold text-center mb-3">Questions, answered.</h1>
        <p className="text-center text-muted-foreground mb-10">Everything you need to know about PrintOnGo.</p>
        <div className="card-elevated p-2 md:p-4">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`q${i}`}>
                <AccordionTrigger className="text-left font-medium px-4">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground px-4">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </SiteLayout>
  );
}

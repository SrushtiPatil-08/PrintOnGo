import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQS = [
  { q: "What file types can I upload?", a: "PDF, DOCX, PPT/PPTX and common image formats (PNG, JPG). Maximum file size is 20MB. Pages are auto-detected on upload." },
  { q: "How fast is delivery?", a: "Delivery is location-based and dynamically calculated. Orders are delivered in as little as 10 minutes*. Times vary based on customer location, traffic, print partner availability and order volume." },
  { q: "How is the price calculated?", a: "Black & White printing is ₹3 per page and Color printing is ₹10 per page. Stapling is free. Binding costs ₹20 (up to 50 pages), ₹35 (51–100 pages) or ₹50 (above 100 pages). Delivery fees depend on distance from the nearest print partner." },
  { q: "Where do you deliver?", a: "Currently on 50+ campuses across India including IITs, NITs, DU, VIT and major coaching institutes. Hostel, classroom, and home delivery supported." },
  { q: "Is my document safe?", a: "Yes. Uploads are end-to-end encrypted, accessible only to the assigned print partner, and automatically deleted within 24 hours of delivery. No document is publicly accessible." },
  { q: "How is page count detected?", a: "Page count is detected automatically from your uploaded PDF, DOCX, PPT or image. You can fine-tune the count manually if needed." },
  { q: "Can I cancel an order?", a: "Yes, until the order moves to 'Printing Started'. After that, the order is locked to ensure on-time delivery." },
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
        <p className="text-[11px] text-muted-foreground text-center mt-6">
          *Delivery times vary based on customer location, traffic conditions, print partner availability, document size, and order volume.
        </p>
      </section>
    </SiteLayout>
  );
}

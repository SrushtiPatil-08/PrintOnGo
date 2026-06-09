import { Link } from "@tanstack/react-router";
import { Printer, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/", label: "Home" },
  { to: "/order", label: "Order" },
  { to: "/track", label: "Track" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Admin" },
];

export function SiteLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
        <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
              <Printer className="w-5 h-5" />
            </span>
            <span className="font-display font-bold text-xl">PrintOnGo</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md"
                activeProps={{ className: "text-foreground bg-secondary" }}
                activeOptions={{ exact: n.to === "/" }}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button asChild className="btn-hero">
              <Link to="/order">Order Now</Link>
            </Button>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background animate-fade-in">
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {nav.map(n => (
                <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-secondary">
                  {n.label}
                </Link>
              ))}
              <Button asChild className="btn-hero mt-2">
                <Link to="/order" onClick={() => setOpen(false)}>Order Now</Link>
              </Button>
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-secondary/40 mt-12">
        <div className="container mx-auto px-4 max-w-7xl py-12 grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
                <Printer className="w-5 h-5" />
              </span>
              <span className="font-display font-bold text-xl">PrintOnGo</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">Upload. Print. Deliver. India's smartest student printing and document delivery platform.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/order" className="hover:text-foreground">Place Order</Link></li>
              <li><Link to="/track" className="hover:text-foreground">Track Order</Link></li>
              <li><Link to="/admin" className="hover:text-foreground">Admin</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About</Link></li>
              <li><Link to="/faq" className="hover:text-foreground">FAQ</Link></li>
              <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="container mx-auto px-4 max-w-7xl py-4 text-xs text-muted-foreground flex justify-between">
            <span>© {new Date().getFullYear()} PrintOnGo. All rights reserved.</span>
            <span>Made for students, with ❤️</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

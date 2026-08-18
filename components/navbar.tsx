"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

function PeptideIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Peptide backbone: three amino acid nodes connected by bonds */}
      <circle cx="4" cy="12" r="2.5" />
      <line x1="6.5" y1="12" x2="9.5" y2="12" />
      <circle cx="12" cy="12" r="2.5" />
      <line x1="14.5" y1="12" x2="17.5" y2="12" />
      <circle cx="20" cy="12" r="2.5" />
      {/* Side chains */}
      <line x1="4" y1="9.5" x2="4" y2="6" />
      <line x1="12" y1="14.5" x2="12" y2="18" />
      <line x1="20" y1="9.5" x2="20" y2="6" />
    </svg>
  );
}
import { useState } from "react";

const links = [
  { href: "/", label: "Predictor" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur-md">
      <div className="flex w-full items-center justify-between px-4 py-3.5 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <PeptideIcon className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">
            ACPLearn
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-4 py-2.5 text-base font-medium transition-colors lg:px-5 lg:text-lg",
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav
          className="border-t border-border bg-card px-4 py-3 sm:px-6 md:hidden"
          aria-label="Mobile navigation"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block rounded-lg px-4 py-3 text-lg font-medium transition-colors",
                pathname === link.href
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

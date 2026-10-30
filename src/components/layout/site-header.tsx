"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/find-coaching", label: "Find Coaching" },
  { href: "/find-tutors", label: "Find Tutors" },
  { href: "/compare", label: "Compare" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-institutes", label: "For Institutes" },
  { href: "/for-tutors", label: "For Tutors" },
  { href: "/pricing", label: "Pricing" },
];

export function Logo({ name }: { name: string }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
        <GraduationCap className="size-5" />
      </span>
      {name}
    </Link>
  );
}

export function SiteHeader({ brand }: { brand: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo name={brand} />
        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-body hover:bg-primary-soft hover:text-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost"><Link href="/login">Log in</Link></Button>
          <Button asChild><Link href="/register">Sign up</Link></Button>
        </div>
        <button
          type="button"
          className="rounded-lg p-2 text-ink hover:bg-canvas lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-surface px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-body hover:bg-primary-soft">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" className="flex-1"><Link href="/login">Log in</Link></Button>
            <Button asChild className="flex-1"><Link href="/register">Sign up</Link></Button>
          </div>
        </nav>
      )}
    </header>
  );
}

import Link from "next/link";
import { Logo } from "./site-header";

const cols = [
  {
    title: "Students & parents",
    links: [
      { href: "/find-coaching", label: "Find coaching" },
      { href: "/find-tutors", label: "Find tutors" },
      { href: "/compare", label: "Compare institutes" },
      { href: "/how-it-works", label: "How it works" },
    ],
  },
  {
    title: "For providers",
    links: [
      { href: "/for-institutes", label: "List your institute" },
      { href: "/for-tutors", label: "Become a tutor" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Support & legal",
    links: [
      { href: "/contact", label: "Contact & support" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms of use" },
    ],
  },
];

export function SiteFooter({ brand, email }: { brand: string; email: string }) {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo name={brand} />
          <p className="mt-3 max-w-xs text-sm text-muted">
            A discovery marketplace for coaching institutes and personal tutors in India.
          </p>
          <p className="mt-3 text-sm text-muted">{email}</p>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="text-sm font-semibold text-ink">{c.title}</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand}. Working name, prototype build. Listings shown are fictional demo data.
      </div>
    </footer>
  );
}

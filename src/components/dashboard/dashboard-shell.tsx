"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, BadgeCheck, BadgePercent, BarChart3, Bell, Bookmark, BookOpen, Briefcase, Building, CalendarCheck, Clock,
  CreditCard, Database, Flag, GitCompare, GraduationCap, Heart, IndianRupee, Inbox, LayoutDashboard, Lock, MapPin,
  Megaphone, Menu, MessageSquare, PackageCheck, Undo2, ScrollText, Search, Settings, ShieldCheck, ShoppingCart, Star,
  User, Users, X, type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/site-header";
import { cn } from "@/lib/utils";

const icons: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard, user: User, search: Search, "graduation-cap": GraduationCap, "git-compare": GitCompare,
  heart: Heart, bookmark: Bookmark, "message-square": MessageSquare, "calendar-check": CalendarCheck, bell: Bell,
  "shield-check": ShieldCheck, settings: Settings, building: Building, "book-open": BookOpen, users: Users, inbox: Inbox,
  "package-check": PackageCheck, star: Star, "bar-chart-3": BarChart3, "shopping-cart": ShoppingCart, "credit-card": CreditCard,
  "badge-percent": BadgePercent, award: Award, briefcase: Briefcase, "map-pin": MapPin, "indian-rupee": IndianRupee, clock: Clock,
  "badge-check": BadgeCheck, database: Database, "undo-2": Undo2, flag: Flag, megaphone: Megaphone, lock: Lock, "scroll-text": ScrollText,
};

export interface ShellNavItem {
  label: string;
  href: string;
  icon: string;
}

export function DashboardShell({
  brand, portalTitle, nav, children, preview = true, userLabel, signOutAction,
}: {
  brand: string; portalTitle: string; nav: ShellNavItem[]; children: React.ReactNode;
  preview?: boolean; userLabel?: string; signOutAction?: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  const list = (
    <nav aria-label={`${portalTitle} navigation`} className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-0.5">
        {nav.map((n) => {
          const Icon = icons[n.icon] ?? LayoutDashboard;
          const active = pathname === n.href;
          return (
            <li key={n.href + n.label}>
              <Link
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                  active ? "bg-primary-soft text-primary" : "text-body hover:bg-canvas hover:text-ink",
                )}
              >
                <Icon className="size-4 shrink-0" /> {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface lg:flex">
        <div className="border-b border-line px-5 py-4">
          <Logo name={brand} />
          <p className="mt-1 text-xs text-muted">{portalTitle}</p>
        </div>
        {list}
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-surface/95 px-4 backdrop-blur lg:px-8">
          <button type="button" className="rounded-lg p-2 text-ink hover:bg-canvas lg:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <p className="hidden text-sm font-medium text-ink lg:block">{portalTitle} portal</p>
          <div className="flex items-center gap-3">
            {preview && <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-amber-900">Preview mode · demo data</span>}
            {userLabel && <span className="hidden text-xs text-muted sm:inline">{userLabel}</span>}
            {signOutAction && (
              <form action={signOutAction}>
                <button type="submit" className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-ink hover:bg-canvas">Sign out</button>
              </form>
            )}
          </div>
        </header>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <Logo name={brand} />
                <button type="button" aria-label="Close" onClick={() => setOpen(false)}><X className="size-5" /></button>
              </div>
              {list}
            </div>
          </div>
        )}
        <main id="main" className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}

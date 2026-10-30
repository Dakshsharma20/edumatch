import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireRole } from "@/lib/auth/session";
import { signOut } from "@/lib/auth/actions";
import { siteConfig } from "@/lib/config";
import { navItems, portalMeta, sectionHref, type Portal } from "@/lib/nav";

/**
 * Shared server layout for each portal. `requireRole` runs on the server before anything renders:
 * wrong or missing role means a redirect (or 404 in production without a database), never a hidden button.
 */
export async function PortalLayout({ portal, children }: { portal: Portal; children: React.ReactNode }) {
  const { preview, user } = await requireRole(portal);
  const nav = navItems[portal].map((n) => ({ label: n.label, href: sectionHref(portal, n), icon: n.icon }));
  return (
    <DashboardShell
      brand={siteConfig.name}
      portalTitle={portalMeta[portal].title}
      nav={nav}
      preview={preview}
      userLabel={user?.email ?? undefined}
      signOutAction={preview ? undefined : signOut}
    >
      {children}
    </DashboardShell>
  );
}

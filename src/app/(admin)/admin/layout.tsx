import type { Metadata } from "next";
import { PortalLayout } from "@/components/dashboard/portal-layout";

export const metadata: Metadata = { title: { default: "Admin portal", template: "%s | Admin portal" }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="admin">{children}</PortalLayout>;
}

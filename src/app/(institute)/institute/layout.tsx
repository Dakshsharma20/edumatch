import type { Metadata } from "next";
import { PortalLayout } from "@/components/dashboard/portal-layout";

export const metadata: Metadata = { title: { default: "Institute portal", template: "%s | Institute portal" }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="institute">{children}</PortalLayout>;
}

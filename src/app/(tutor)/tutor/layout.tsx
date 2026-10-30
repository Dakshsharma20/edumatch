import type { Metadata } from "next";
import { PortalLayout } from "@/components/dashboard/portal-layout";

export const metadata: Metadata = { title: { default: "Tutor portal", template: "%s | Tutor portal" }, robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <PortalLayout portal="tutor">{children}</PortalLayout>;
}

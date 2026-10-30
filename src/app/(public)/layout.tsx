import { CompareBar } from "@/components/listing/list-actions";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/config";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader brand={siteConfig.name} />
      <main id="main">{children}</main>
      <SiteFooter brand={siteConfig.name} email={siteConfig.supportEmail} />
      <CompareBar />
    </>
  );
}

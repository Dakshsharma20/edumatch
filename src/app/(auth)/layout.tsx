import { Logo } from "@/components/layout/site-header";
import { siteConfig } from "@/lib/config";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center bg-canvas px-4 py-10">
      <Logo name={siteConfig.name} />
      <main id="main" className="mt-8 w-full max-w-2xl">{children}</main>
    </div>
  );
}

import { notFound } from "next/navigation";
import { SectionPage } from "@/components/dashboard/section-page";
import { navItems } from "@/lib/nav";

type Props = { params: Promise<{ section: string }> };

export function generateStaticParams() {
  return navItems.student.filter((n) => !n.external && n.slug !== "dashboard").map((n) => ({ section: n.slug }));
}

export default async function Page({ params }: Props) {
  const { section } = await params;
  const item = navItems.student.find((n) => !n.external && n.slug === section && n.slug !== "dashboard");
  if (!item) notFound();
  return <SectionPage portal="student" item={item} />;
}

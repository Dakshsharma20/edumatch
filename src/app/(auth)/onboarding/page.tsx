import type { Metadata } from "next";
import Link from "next/link";
import { InstituteWizard } from "@/components/onboarding/institute-wizard";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = { title: "Onboarding", robots: { index: false } };

export default function OnboardingPage() {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <h1 className="mb-1 text-2xl font-bold">Institute onboarding</h1>
      <p className="mb-6 text-sm text-muted">
        Eight short steps. Save a draft any time. Tutor and student onboarding are added with the backend stage; meanwhile{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">create an account</Link>.
      </p>
      <InstituteWizard />
      <Card className="mt-6 p-4 text-xs text-muted">Drafts are stored in this browser only until accounts are connected.</Card>
    </div>
  );
}

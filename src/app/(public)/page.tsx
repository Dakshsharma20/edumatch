import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BookOpen, Building2, FileCheck2, GitCompare, GraduationCap, Handshake, Lock,
  Scale, Search, ShieldCheck, UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/feedback";
import { Container, Section } from "@/components/layout/page-section";
import { InstituteCard, TutorCard } from "@/components/listing/listing-cards";
import { FaqList } from "@/components/marketing/faq";
import { HeroSearch } from "@/components/marketing/hero-search";
import { listInstitutes, listTutors } from "@/lib/data/listings";
import { categories, demoCities, demoExams, demoSubjects } from "@/lib/demo/listings";

const steps = [
  { icon: Search, title: "Search", text: "Filter by exam, city, budget and learning mode." },
  { icon: Scale, title: "Compare", text: "Put up to four institutes side by side on the same fields." },
  { icon: Handshake, title: "Connect with consent", text: "Share your contact details only with providers you choose." },
  { icon: GraduationCap, title: "Start learning", text: "Book a demo class, then decide with confidence." },
];

const faqs = [
  { q: "Is it free for students and parents?", a: "Searching, comparing and sending enquiries is intended to be free for students. Providers pay for subscriptions and for consented enquiries." },
  { q: "Who sees my phone number?", a: "Only the specific institute or tutor you choose to contact, and only after you give explicit, purpose-specific consent. Creating an account never shares your number." },
  { q: "What does the verified badge mean?", a: "A listing is marked verified only after our team has reviewed submitted documents. Until then it is labelled as not verified or pending review, and fields are marked provider-supplied." },
  { q: "Does advertising change the comparison?", a: "No. Sponsored listings are labelled and never alter organic search or comparison results." },
  { q: "Are the listings on this page real?", a: "No. This prototype shows clearly labelled fictional demo listings for design preview." },
];

export default async function HomePage() {
  const [institutes, tutors] = await Promise.all([listInstitutes(3), listTutors(3)]);
  const compareSample = (await listInstitutes(2)).map((i) => i.slug).join(",");

  return (
    <>
      <section className="border-b border-line bg-surface">
        <Container className="grid gap-10 py-14 lg:grid-cols-5 lg:py-20">
          <div className="lg:col-span-2">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary-soft px-3 py-1 text-xs font-semibold text-secondary">
              <BadgeCheck className="size-3.5" /> Built for students and parents in India
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Find the Right Coaching. Compare Better. Learn Smarter.</h1>
            <p className="mt-4 text-lg text-muted">
              Discover trusted coaching institutes and personal tutors based on your goals, budget, location, and learning preferences.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/find-coaching">Find Coaching</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/for-institutes">List Your Institute</Link></Button>
            </div>
            <p className="mt-4 text-sm text-muted">
              Teach privately? <Link href="/for-tutors" className="font-medium text-primary hover:underline">Join as a personal tutor <ArrowRight className="inline size-3.5" /></Link>
            </p>
          </div>
          <div className="lg:col-span-3 lg:pt-6">
            <HeroSearch cities={demoCities} exams={demoExams} subjects={demoSubjects} />
            {institutes.some((i) => i.isDemo) && <DemoNotice className="mt-3">Listings and fees on this site are fictional samples. No listing is verified.</DemoNotice>}
          </div>
        </Container>
      </section>

      <Section title="Popular coaching categories" subtitle="Start from the exam or stage you are preparing for.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.name} href={`/find-coaching?exam=${encodeURIComponent(c.exam)}`}>
              <Card className="flex h-full items-center gap-4 p-5 transition-colors hover:border-primary">
                <span className="rounded-xl bg-primary-soft p-3 text-primary"><BookOpen className="size-5" /></span>
                <span>
                  <span className="block font-semibold text-ink">{c.name}</span>
                  <span className="text-sm text-muted">{c.blurb}</span>
                </span>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2" aria-label="Popular courses">
          {demoExams.map((e) => (
            <Link key={e} href={`/find-coaching?exam=${encodeURIComponent(e)}`} className="rounded-full border border-line-strong bg-surface px-3 py-1.5 text-sm hover:border-primary hover:text-primary">
              {e}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        title="Featured institutes"
        subtitle="Sample listings showing how profiles, fees and verification status appear."
        className="bg-surface"
        action={<Button asChild variant="outline"><Link href="/find-coaching">View all</Link></Button>}
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {institutes.map((i) => <InstituteCard key={i.id} institute={i} />)}
        </div>
        <p className="mt-4 text-xs text-muted">Featured placement, when introduced, will be clearly labelled as sponsored. Listings marked “Demo listing” are fictional.</p>
      </Section>

      <Section title="Recommended personal tutors" subtitle="One-to-one learning, online or at home.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tutors.map((t) => <TutorCard key={t.id} tutor={t} />)}
        </div>
      </Section>

      <Section title="Compare coaching on equal terms" subtitle="Same fields for every institute: fees, duration, batch size, faculty experience, mode, refund policy and verification status." className="bg-surface">
        <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-secondary-soft p-3 text-secondary"><GitCompare className="size-6" /></span>
            <p className="max-w-xl text-sm">
              Select up to four institutes to compare. Missing information is shown as “Not provided”, never guessed, and payment never affects the order.
            </p>
          </div>
          <Button asChild><Link href={`/compare?ids=${compareSample}`}>See a sample comparison</Link></Button>
        </Card>
      </Section>

      <Section title="How it works">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <li key={s.title}>
              <Card className="h-full p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary-soft text-primary"><s.icon className="size-5" /></span>
                <p className="mt-3 text-xs font-semibold text-muted">STEP {idx + 1}</p>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm text-muted">{s.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Built for everyone in the journey" className="bg-surface">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { icon: UserRound, title: "For students & parents", points: ["Compare on the same fields", "Share contact details only with providers you pick", "Withdraw consent any time"], href: "/how-it-works", cta: "How it works" },
            { icon: Building2, title: "For coaching institutes", points: ["Profile, courses and batch management", "Consented enquiries to follow up", "Verification review before any badge"], href: "/for-institutes", cta: "List your institute" },
            { icon: GraduationCap, title: "For personal tutors", points: ["Your own tutor dashboard", "Set fees, subjects and service areas", "Receive demo requests"], href: "/for-tutors", cta: "Join as a tutor" },
          ].map((b) => (
            <Card key={b.title} className="flex flex-col p-6">
              <b.icon className="size-6 text-primary" />
              <h3 className="mt-3 text-lg font-semibold text-ink">{b.title}</h3>
              <ul className="mt-3 flex-1 space-y-2 text-sm">
                {b.points.map((p) => <li key={p} className="flex gap-2"><BadgeCheck className="mt-0.5 size-4 shrink-0 text-secondary" />{p}</li>)}
              </ul>
              <Button asChild variant="outline" className="mt-5 self-start"><Link href={b.href}>{b.cta}</Link></Button>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Trust and verification" subtitle="We separate what has been checked from what providers tell us.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: FileCheck2, title: "Document review", text: "A verified badge appears only after an administrator reviews submitted documents." },
            { icon: ShieldCheck, title: "Clear labelling", text: "Every field is tagged as verified or provider-supplied so you know what to double-check." },
            { icon: Lock, title: "Consent first", text: "Your contact details are shared only with your explicit, purpose-specific permission." },
          ].map((t) => (
            <Card key={t.title} className="p-5">
              <t.icon className="size-6 text-secondary" />
              <h3 className="mt-3 font-semibold text-ink">{t.title}</h3>
              <p className="mt-1 text-sm text-muted">{t.text}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Frequently asked questions" className="bg-surface">
        <div className="max-w-3xl"><FaqList items={faqs} /></div>
      </Section>
    </>
  );
}

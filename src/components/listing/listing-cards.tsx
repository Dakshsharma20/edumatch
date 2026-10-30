import Link from "next/link";
import { Clock, Languages, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { instituteTotalFee, minInstituteFee, maxFacultyExperience } from "@/lib/data/listings";
import { formatINR, initials } from "@/lib/utils";
import type { Institute, Tutor } from "@/types";
import { CompareToggle, FavouriteToggle } from "./list-actions";
import { DemoBadge, VerificationBadge } from "./verification-badge";

export function Avatar({ name, tone = "primary" }: { name: string; tone?: "primary" | "secondary" }) {
  return (
    <div
      aria-hidden
      className={`flex size-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
        tone === "primary" ? "bg-primary-soft text-primary" : "bg-secondary-soft text-secondary"
      }`}
    >
      {initials(name.replace("Demo ", ""))}
    </div>
  );
}

function RatingLine({ rating }: { rating: Institute["rating"] }) {
  return rating ? (
    <span className="text-sm text-body">
      ★ {rating.average.toFixed(1)} ({rating.count} reviews)
    </span>
  ) : (
    <span className="text-sm text-muted">No reviews yet</span>
  );
}

export function InstituteCard({ institute: i }: { institute: Institute }) {
  const course = i.courses[0];
  return (
    <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-soft">
      <div className="flex items-start gap-3">
        <Avatar name={i.name} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">
            <Link href={`/coaching/${i.slug}`} className="hover:text-primary">
              {i.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" /> {i.locality}, {i.city}
          </p>
        </div>
        <FavouriteToggle id={i.slug} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {i.isDemo && <DemoBadge />}
        <VerificationBadge status={i.verification.status} />
        {i.modes.map((m) => (
          <Badge key={m} variant="outline" className="capitalize">
            {m}
          </Badge>
        ))}
      </div>
      <p className="text-sm">{i.tagline}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Fees from (total)</dt>
          <dd className="font-semibold text-ink">{formatINR(minInstituteFee(i))}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Top faculty experience</dt>
          <dd className="font-semibold text-ink">{maxFacultyExperience(i)} yrs</dd>
        </div>
        <div className="flex items-center gap-1 text-muted">
          <Users className="size-3.5" /> Batch up to {Math.max(...i.courses.map((c) => c.batchSize))}
        </div>
        <div className="flex items-center gap-1 text-muted">
          <Languages className="size-3.5" /> {i.languages.join(", ")}
        </div>
      </dl>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <RatingLine rating={i.rating} />
        <div className="flex gap-2">
          <CompareToggle slug={i.slug} />
          <Button asChild size="sm">
            <Link href={`/coaching/${i.slug}`}>View details</Link>
          </Button>
        </div>
      </div>
      <span className="sr-only">First course: {course?.name}, total {formatINR(instituteTotalFee(i))}</span>
    </Card>
  );
}

export function TutorCard({ tutor: t }: { tutor: Tutor }) {
  return (
    <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-soft">
      <div className="flex items-start gap-3">
        <Avatar name={t.name} tone="secondary" />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-ink">
            <Link href={`/tutors/${t.slug}`} className="hover:text-primary">
              {t.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" /> {t.city}
          </p>
        </div>
        <FavouriteToggle id={t.slug} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {t.isDemo && <DemoBadge />}
        <VerificationBadge status={t.verification.status} />
        {t.modes.map((m) => (
          <Badge key={m} variant="outline">
            {m === "home" ? "Home tuition" : "Online"}
          </Badge>
        ))}
      </div>
      <p className="text-sm">{t.headline}</p>
      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-muted">Monthly fee</dt>
          <dd className="font-semibold text-ink">{formatINR(t.monthlyFeeINR)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">Hourly fee</dt>
          <dd className="font-semibold text-ink">{formatINR(t.hourlyFeeINR)}</dd>
        </div>
        <div className="flex items-center gap-1 text-muted">
          <Clock className="size-3.5" /> {t.experienceYears} yrs (self-reported)
        </div>
        <div className="flex items-center gap-1 text-muted">
          <Languages className="size-3.5" /> {t.languages.join(", ")}
        </div>
      </dl>
      <div className="flex items-center justify-between border-t border-line pt-3">
        <RatingLine rating={t.rating} />
        <Button asChild size="sm">
          <Link href={`/tutors/${t.slug}`}>View profile</Link>
        </Button>
      </div>
    </Card>
  );
}

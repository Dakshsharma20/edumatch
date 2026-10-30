import { StatusBanner } from "@/components/ui/feedback";
import { CourseManager, type CourseRow } from "@/components/dashboard/course-manager";
import { DashHeader } from "@/components/dashboard/widgets";
import { getCurrentUser } from "@/lib/auth/session";
import { col } from "@/lib/db/collections";
import { getDb } from "@/lib/db/mongo";
import { myInstituteId } from "@/lib/institute/scope";

export const metadata = { title: "Courses and batches" };

export default async function InstituteCoursesPage() {
  const db = await getDb();
  const user = db ? await getCurrentUser() : null;
  let courses: CourseRow[] = [];
  let hasInstitute = false;

  if (db && user) {
    // Always scoped to the signed-in user's own institute.
    const instituteId = await myInstituteId(db, user.id);
    if (instituteId) {
      hasInstitute = true;
      const docs = await col(db).courses.find({ instituteId }).sort({ createdAt: 1 }).toArray();
      courses = docs.map((c) => ({
        id: c._id, name: c.name, exam: c.exam ?? null, durationMonths: c.durationMonths ?? null, tuitionFeeINR: c.tuitionFeeInr,
        otherFeesINR: c.otherFeesInr, mode: c.mode, published: c.published, timings: c.batches.map((b) => b.timing),
      }));
    }
  }

  return (
    <>
      <DashHeader title="Courses and batches" description="Create courses, set fees and timings, and publish when ready." />
      {!db && <StatusBanner tone="warning" title="Backend not connected">The database is not configured, so courses cannot be loaded or saved yet.</StatusBanner>}
      {db && !hasInstitute && <StatusBanner tone="warning" title="Complete onboarding first">Submit your institute application before adding courses.</StatusBanner>}
      <CourseManager courses={courses} canEdit={!!db && hasInstitute} />
    </>
  );
}

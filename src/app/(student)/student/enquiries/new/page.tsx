import { DashHeader } from "@/components/dashboard/widgets";
import { EnquiryForm } from "@/components/student/enquiry-form";
import { demoCities, demoExams } from "@/lib/demo/listings";

export const metadata = { title: "New enquiry" };

export default function NewEnquiryPage() {
  return (
    <>
      <DashHeader title="New enquiry" description="Tell us what you are looking for. Nothing is shared until you agree below." />
      <EnquiryForm cities={demoCities} courses={demoExams} />
    </>
  );
}

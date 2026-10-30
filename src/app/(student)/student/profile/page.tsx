import { DashHeader, Panel } from "@/components/dashboard/widgets";
import { PreferencesForm } from "@/components/dashboard/preferences-form";

export const metadata = { title: "My profile" };

export default function StudentProfilePage() {
  return (
    <>
      <DashHeader title="My profile" description="Your learning preferences help you search faster. They are not shared with any provider." />
      <Panel title="Learning preferences"><PreferencesForm /></Panel>
    </>
  );
}

import { siteConfig } from "@/lib/config";

import { MAX_PROVIDERS_PER_ENQUIRY } from "./constants";
export { MAX_PROVIDERS_PER_ENQUIRY };

/**
 * The exact text shown next to the consent checkbox. The same string is stored in consent_records.disclosure_text,
 * so we can prove what each student agreed to. Have counsel review before launch.
 */
export const LEAD_DISCLOSURE = [
  "What is shared: your name, mobile number, email (only if you entered it), city, course or subject, level, budget range, preferred learning mode and preferred timing.",
  `Who receives it: coaching institutes and personal tutors that match your enquiry and choose to receive it. Each enquiry is shared with at most ${MAX_PROVIDERS_PER_ENQUIRY} providers.`,
  "Why: so they can contact you about the course or subject you asked about, in the way you chose. Your details are not used for anything else.",
  "Your control: you can withdraw consent at any time from Privacy & Consent. Withdrawal stops any further sharing and removes providers' access to your enquiry on our platform. A provider that has already downloaded your details may still hold them, so ask them directly or contact support to request deletion.",
].join("\n");

export const MARKETING_DISCLOSURE = `Optional and separate: send me occasional updates and offers from ${siteConfig.name}. Not required to submit an enquiry.`;
export const POLICY_VERSION = siteConfig.policyVersion;

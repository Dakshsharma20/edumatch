import type { Faculty, Faq, Institute, Tutor } from "@/types";

/**
 * FICTIONAL DEMO DATA.
 * Every institute, tutor, fee and address below is invented for UI preview.
 * No ratings or reviews are fabricated: `rating` is null until real reviews exist.
 * No listing is marked "verified": verification only happens through admin review (Stage 2+).
 * Real listings come from MongoDB (see src/lib/data/listings.ts).
 */

const standardRefund =
  "Demo text: refund terms are set by each institute. Confirm the written refund policy before paying any fee.";

const commonFaqs: Faq[] = [
  { q: "Can I attend a demo class before enrolling?", a: "Demo availability is shown on each course. Confirm timings with the institute." },
  { q: "How do I confirm the fees?", a: "Fees shown are supplied by the institute and not independently verified. Ask for a written fee schedule." },
];

function faculty(id: string, name: string, qualification: string, experienceYears: number, subjects: string[]): Faculty {
  return { id, name, qualification, experienceYears, subjects };
}

export const demoInstitutes: Institute[] = [
  {
    id: "inst-1",
    slug: "demo-vidya-sagar-academy-bhopal",
    name: "Demo Vidya Sagar Academy",
    tagline: "Fictional JEE & NEET coaching for UI preview",
    city: "Bhopal",
    locality: "Arera Colony",
    address: "Demo address, Arera Colony, Bhopal, Madhya Pradesh",
    categories: ["Engineering Entrance", "Medical Entrance"],
    modes: ["offline", "hybrid"],
    languages: ["English", "Hindi"],
    about:
      "This is a fictional institute created to preview the listing layout. Its description, faculty and fees are sample content and do not describe a real organisation.",
    facilities: ["Air-conditioned classrooms", "Library", "Doubt-clearing hours", "Weekly tests"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-1a", name: "JEE Main & Advanced – 2-Year Programme", exam: "JEE Main & Advanced", level: "Class 11–12",
        durationMonths: 24, tuitionFeeINR: 165000, otherFeesINR: 12000, mode: "offline",
        batchTimings: ["Weekdays 4:00 PM – 7:00 PM", "Weekends 9:00 AM – 1:00 PM"], batchSize: 40, demoEnabled: true,
      },
      {
        id: "c-1b", name: "NEET – 1-Year Classroom Programme", exam: "NEET", level: "Class 12 / Dropper",
        durationMonths: 12, tuitionFeeINR: 98000, otherFeesINR: 8000, mode: "hybrid",
        batchTimings: ["Weekdays 8:00 AM – 12:00 PM"], batchSize: 50, demoEnabled: true,
      },
    ],
    faculty: [
      faculty("f-1", "Dr. A. Sharma (demo)", "M.Sc. Physics (supplied by institute)", 12, ["Physics"]),
      faculty("f-2", "R. Verma (demo)", "M.Sc. Chemistry (supplied by institute)", 9, ["Chemistry"]),
    ],
    faqs: commonFaqs,
    lastUpdated: "2026-09-12",
    verification: { status: "not_verified", note: "Demo listing. No documents have been reviewed." },
    rating: null,
    demoAvailable: true,
    isDemo: true,
  },
  {
    id: "inst-2",
    slug: "demo-nalanda-classes-indore",
    name: "Demo Nalanda Classes",
    tagline: "Fictional foundation & board coaching",
    city: "Indore",
    locality: "Vijay Nagar",
    address: "Demo address, Vijay Nagar, Indore, Madhya Pradesh",
    categories: ["School Boards", "Foundation"],
    modes: ["offline"],
    languages: ["Hindi", "English"],
    about: "Fictional listing for layout testing. Not a real institute.",
    facilities: ["Smart classrooms", "Printed notes", "Parent-teacher meetings"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-2a", name: "CBSE Class 10 – Science & Maths", exam: "CBSE Board", level: "Class 10",
        durationMonths: 10, tuitionFeeINR: 28000, otherFeesINR: 2000, mode: "offline",
        batchTimings: ["Weekdays 5:00 PM – 7:00 PM"], batchSize: 25, demoEnabled: true,
      },
      {
        id: "c-2b", name: "Foundation – Class 8 & 9", exam: "Foundation", level: "Class 8–9",
        durationMonths: 10, tuitionFeeINR: 24000, otherFeesINR: 1500, mode: "offline",
        batchTimings: ["Weekends 10:00 AM – 1:00 PM"], batchSize: 30, demoEnabled: false,
      },
    ],
    faculty: [faculty("f-3", "S. Joshi (demo)", "B.Ed., M.Sc. Maths (supplied by institute)", 7, ["Mathematics", "Science"])],
    faqs: commonFaqs,
    lastUpdated: "2026-08-30",
    verification: { status: "pending_review", note: "Demo listing shown as 'pending review' to preview that state." },
    rating: null,
    demoAvailable: true,
    isDemo: true,
  },
  {
    id: "inst-3",
    slug: "demo-civil-path-institute-delhi",
    name: "Demo Civil Path Institute",
    tagline: "Fictional UPSC & state PSC preparation",
    city: "Delhi",
    locality: "Old Rajinder Nagar",
    address: "Demo address, Old Rajinder Nagar, New Delhi",
    categories: ["Government Exams"],
    modes: ["offline", "online", "hybrid"],
    languages: ["English", "Hindi"],
    about: "Sample listing created for UI preview only.",
    facilities: ["Test series", "Library access", "Mentorship sessions", "Recorded lectures"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-3a", name: "UPSC CSE – Prelims + Mains Integrated", exam: "UPSC CSE", level: "Graduate",
        durationMonths: 14, tuitionFeeINR: 150000, otherFeesINR: 10000, mode: "hybrid",
        batchTimings: ["Weekdays 9:00 AM – 1:00 PM", "Evening 6:00 PM – 9:00 PM"], batchSize: 80, demoEnabled: true,
      },
    ],
    faculty: [
      faculty("f-4", "P. Nair (demo)", "M.A. Public Administration (supplied by institute)", 15, ["Polity", "Governance"]),
      faculty("f-5", "K. Singh (demo)", "M.A. History (supplied by institute)", 11, ["History"]),
    ],
    faqs: commonFaqs,
    lastUpdated: "2026-10-02",
    verification: { status: "not_verified", note: "Demo listing. No documents have been reviewed." },
    rating: null,
    demoAvailable: true,
    isDemo: true,
  },
  {
    id: "inst-4",
    slug: "demo-codecraft-learning-pune",
    name: "Demo CodeCraft Learning",
    tagline: "Fictional online coding & aptitude coaching",
    city: "Pune",
    locality: "Kothrud",
    address: "Demo address, Kothrud, Pune, Maharashtra",
    categories: ["Skill Courses", "Engineering Entrance"],
    modes: ["online"],
    languages: ["English"],
    about: "Fictional online institute used to preview online-only listings.",
    facilities: ["Live classes", "Recorded sessions", "Practice portal"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-4a", name: "GATE CSE – Online Batch", exam: "GATE", level: "Graduate",
        durationMonths: 8, tuitionFeeINR: 32000, otherFeesINR: 0, mode: "online",
        batchTimings: ["Weekdays 7:00 PM – 9:00 PM"], batchSize: 100, demoEnabled: true,
      },
    ],
    faculty: [faculty("f-6", "M. Kulkarni (demo)", "M.Tech CSE (supplied by institute)", 8, ["Algorithms", "Databases"])],
    faqs: commonFaqs,
    lastUpdated: "2026-09-25",
    verification: { status: "not_verified", note: "Demo listing. No documents have been reviewed." },
    rating: null,
    demoAvailable: true,
    isDemo: true,
  },
  {
    id: "inst-5",
    slug: "demo-medprep-centre-kota",
    name: "Demo MedPrep Centre",
    tagline: "Fictional NEET dropper programme",
    city: "Kota",
    locality: "Rajeev Gandhi Nagar",
    address: "Demo address, Rajeev Gandhi Nagar, Kota, Rajasthan",
    categories: ["Medical Entrance"],
    modes: ["offline", "hybrid"],
    languages: ["Hindi", "English"],
    about: "Sample record for UI preview. Not an actual coaching centre.",
    facilities: ["Hostel tie-up (demo)", "Daily practice papers", "Counselling"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-5a", name: "NEET Dropper – Intensive", exam: "NEET", level: "Dropper",
        durationMonths: 12, tuitionFeeINR: 120000, otherFeesINR: 15000, mode: "offline",
        batchTimings: ["Weekdays 8:00 AM – 2:00 PM"], batchSize: 60, demoEnabled: false,
      },
    ],
    faculty: [faculty("f-7", "Dr. T. Meena (demo)", "M.Sc. Zoology (supplied by institute)", 14, ["Biology"])],
    faqs: commonFaqs,
    lastUpdated: "2026-07-19",
    verification: { status: "not_verified", note: "Demo listing. No documents have been reviewed." },
    rating: null,
    demoAvailable: false,
    isDemo: true,
  },
  {
    id: "inst-6",
    slug: "demo-bright-minds-bengaluru",
    name: "Demo Bright Minds Academy",
    tagline: "Fictional CBSE/ICSE tuition centre",
    city: "Bengaluru",
    locality: "Indiranagar",
    address: "Demo address, Indiranagar, Bengaluru, Karnataka",
    categories: ["School Boards"],
    modes: ["offline", "online"],
    languages: ["English", "Kannada"],
    about: "Fictional listing for layout testing.",
    facilities: ["Small batches", "Weekly assessments", "Parent portal (demo)"],
    refundPolicy: standardRefund,
    courses: [
      {
        id: "c-6a", name: "CBSE/ICSE Class 9–10 – All Subjects", exam: "CBSE Board", level: "Class 9–10",
        durationMonths: 10, tuitionFeeINR: 42000, otherFeesINR: 3000, mode: "hybrid",
        batchTimings: ["Weekdays 4:30 PM – 7:30 PM"], batchSize: 15, demoEnabled: true,
      },
    ],
    faculty: [faculty("f-8", "L. Rao (demo)", "B.Ed. (supplied by institute)", 6, ["Science", "English"])],
    faqs: commonFaqs,
    lastUpdated: "2026-10-10",
    verification: { status: "not_verified", note: "Demo listing. No documents have been reviewed." },
    rating: null,
    demoAvailable: true,
    isDemo: true,
  },
];

export const demoTutors: Tutor[] = [
  {
    id: "tut-1", slug: "demo-ananya-iyer-maths", name: "Ananya Iyer (demo)", headline: "Fictional Maths tutor for Class 9–12",
    city: "Bhopal", serviceLocalities: ["Arera Colony", "Shahpura"], subjects: ["Mathematics"], levels: ["Class 9–10", "Class 11–12"],
    modes: ["online", "home"], languages: ["English", "Hindi"], experienceYears: 8,
    qualifications: ["M.Sc. Mathematics (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview. Not a real person.",
    hourlyFeeINR: 600, monthlyFeeINR: 6000, availability: ["Weekdays 5 PM – 8 PM", "Sunday 10 AM – 1 PM"], demoAvailable: true,
    lastUpdated: "2026-09-30", verification: { status: "not_verified", note: "Demo profile. No credentials reviewed." }, rating: null, isDemo: true,
  },
  {
    id: "tut-2", slug: "demo-rohit-mehra-physics", name: "Rohit Mehra (demo)", headline: "Fictional Physics tutor for JEE/NEET",
    city: "Indore", serviceLocalities: ["Vijay Nagar", "Palasia"], subjects: ["Physics"], levels: ["Class 11–12", "Dropper"],
    modes: ["online"], languages: ["Hindi", "English"], experienceYears: 11,
    qualifications: ["B.Tech, M.Sc. Physics (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview.",
    hourlyFeeINR: 900, monthlyFeeINR: 9500, availability: ["Weekdays 6 PM – 9 PM"], demoAvailable: true,
    lastUpdated: "2026-08-21", verification: { status: "pending_review", note: "Demo profile shown as 'pending review'." }, rating: null, isDemo: true,
  },
  {
    id: "tut-3", slug: "demo-sneha-kulkarni-english", name: "Sneha Kulkarni (demo)", headline: "Fictional English & spoken-skills tutor",
    city: "Pune", serviceLocalities: ["Kothrud", "Baner"], subjects: ["English"], levels: ["Class 6–8", "Class 9–10", "Adult"],
    modes: ["online", "home"], languages: ["English", "Marathi", "Hindi"], experienceYears: 5,
    qualifications: ["M.A. English (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview.",
    hourlyFeeINR: 500, monthlyFeeINR: 5000, availability: ["Weekdays 4 PM – 7 PM"], demoAvailable: false,
    lastUpdated: "2026-10-05", verification: { status: "not_verified", note: "Demo profile. No credentials reviewed." }, rating: null, isDemo: true,
  },
  {
    id: "tut-4", slug: "demo-imran-khan-chemistry", name: "Imran Khan (demo)", headline: "Fictional Chemistry tutor for boards & NEET",
    city: "Delhi", serviceLocalities: ["Laxmi Nagar", "Mayur Vihar"], subjects: ["Chemistry"], levels: ["Class 11–12"],
    modes: ["home", "online"], languages: ["Hindi", "English", "Urdu"], experienceYears: 13,
    qualifications: ["M.Sc. Chemistry, B.Ed. (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview.",
    hourlyFeeINR: 800, monthlyFeeINR: 8500, availability: ["Weekdays 3 PM – 6 PM", "Saturday 9 AM – 12 PM"], demoAvailable: true,
    lastUpdated: "2026-09-02", verification: { status: "not_verified", note: "Demo profile. No credentials reviewed." }, rating: null, isDemo: true,
  },
  {
    id: "tut-5", slug: "demo-priya-nair-biology", name: "Priya Nair (demo)", headline: "Fictional Biology tutor for NEET",
    city: "Bengaluru", serviceLocalities: ["Indiranagar", "Koramangala"], subjects: ["Biology"], levels: ["Class 11–12", "Dropper"],
    modes: ["online"], languages: ["English", "Malayalam", "Kannada"], experienceYears: 7,
    qualifications: ["M.Sc. Zoology (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview.",
    hourlyFeeINR: 700, monthlyFeeINR: 7000, availability: ["Weekdays 7 PM – 9 PM"], demoAvailable: true,
    lastUpdated: "2026-10-14", verification: { status: "not_verified", note: "Demo profile. No credentials reviewed." }, rating: null, isDemo: true,
  },
  {
    id: "tut-6", slug: "demo-vikram-singh-accounts", name: "Vikram Singh (demo)", headline: "Fictional Accountancy & Economics tutor",
    city: "Bhopal", serviceLocalities: ["MP Nagar", "Kolar"], subjects: ["Accountancy", "Economics"], levels: ["Class 11–12", "B.Com"],
    modes: ["home", "online"], languages: ["Hindi", "English"], experienceYears: 9,
    qualifications: ["M.Com, CA Inter (supplied by tutor, not verified)"],
    about: "Sample tutor profile for UI preview.",
    hourlyFeeINR: 550, monthlyFeeINR: 5500, availability: ["Weekdays 5 PM – 8 PM"], demoAvailable: true,
    lastUpdated: "2026-09-18", verification: { status: "not_verified", note: "Demo profile. No credentials reviewed." }, rating: null, isDemo: true,
  },
];

export const demoCities = ["Bhopal", "Indore", "Delhi", "Pune", "Bengaluru", "Kota", "Mumbai", "Hyderabad", "Jaipur", "Lucknow"];

export const demoExams = [
  "JEE Main & Advanced",
  "NEET",
  "UPSC CSE",
  "GATE",
  "CBSE Board",
  "Foundation",
];

export const demoSubjects = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Accountancy", "Economics"];

export const levels = ["Class 6–8", "Class 8–9", "Class 9–10", "Class 11–12", "Class 12 / Dropper", "Dropper", "Graduate", "B.Com", "Adult"];

export const languagesList = ["English", "Hindi", "Marathi", "Kannada", "Malayalam", "Urdu", "Tamil", "Telugu", "Bengali"];

export const categories = [
  { name: "Engineering Entrance", blurb: "JEE, BITSAT, state CETs", exam: "JEE Main & Advanced" },
  { name: "Medical Entrance", blurb: "NEET UG and droppers", exam: "NEET" },
  { name: "Government Exams", blurb: "UPSC, SSC, state PSC", exam: "UPSC CSE" },
  { name: "School Boards", blurb: "CBSE, ICSE, state boards", exam: "CBSE Board" },
  { name: "Postgraduate Entrance", blurb: "GATE, CAT and more", exam: "GATE" },
  { name: "Foundation", blurb: "Class 6–10 olympiad & foundation", exam: "Foundation" },
];

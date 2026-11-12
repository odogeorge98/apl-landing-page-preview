export const NAV_LINKS = [
  { label: "Platform", href: "/#platform" },
  { label: "For institutions", href: "/#institutions" },
  { label: "Discoveries", href: "/discoveries" },
  { label: "About", href: "/about" },
  { label: "FAQs", href: "/#faqs" },
];

export const HERO_SLIDES = [
  {
    label: "Platform",
    tag: "Built for Nigerian tertiary education",
    title: ["One platform.", "Every academic journey."],
    body: "Connect your people, records and results. From admission to graduation, keep every journey in view.",
    cta: { label: "Explore the platform", href: "#platform" },
    note: "Product concept · Fictional university data shown below",
    image: "/assets/landing/students-walking.jpg",
  },
  {
    label: "For institutions",
    tag: "Your institution. Your identity.",
    title: ["Your institution.", "Your own space."],
    body: "Your people, records and identity. Connected in one institutional home.",
    cta: { label: "Explore institution spaces", href: "#institutions" },
    image: "/assets/landing/library.jpg",
  },
  {
    label: "Learning & discovery",
    tag: "Knowledge for the next chapter",
    title: ["Stay curious.", "Go further."],
    body: "Explore resources and journals. Keep your next discovery close.",
    cta: { label: "Explore Discoveries", href: "#discoveries" },
    note: "Product concept · Built for Nigerian tertiary education",
    image: "/assets/landing/courtyard.jpg",
  },
] as const;

export const TRUST = [
  "Institution-owned identity",
  "Role-aware workspaces",
  "Governed academic records",
  "Connected student journeys",
];

export const CAPABILITIES = [
  { icon: "folder", title: "One reliable record", body: "Keep admissions, student records and graduation connected." },
  { icon: "chart", title: "Results, made clear", body: "Review, approve and publish results with confidence." },
  { icon: "users", title: "A space for everyone", body: "Focused workspaces for staff, students and authorized guardians." },
  { icon: "cap", title: "Ready for what’s next", body: "Manage graduation and NYSC readiness in one place." },
];

export const TEAMS = [
  { title: "Institution teams", body: "Govern records, results, programmes and university communication." },
  { title: "Academic staff", body: "Manage courses, reviews and results." },
  { title: "Students & families", body: "See progress. Stay connected. Access stays authorized." },
];

export const MILESTONES = [
  { title: "Admit", body: "Validate admission lists and establish student records." },
  { title: "Enrol", body: "Organize programmes, courses and academic sessions." },
  { title: "Progress", body: "Check results and resolve issues before publication." },
  { title: "Graduate", body: "Confirm graduation records and NYSC eligibility lists." },
];

export const IDENTITY = [
  { icon: "lock", title: "Scoped access", body: "Permissions belong to the account, not a role picker." },
  { icon: "history", title: "Accountable changes", body: "Governed profile corrections retain a before-and-after history." },
  { icon: "heart", title: "Authorized family access", body: "Guardians see linked wards — not unrestricted university records." },
];

export const DISCOVER = [
  {
    tag: "Institution spotlight",
    title: "Ìmọ University, Ibadan",
    body: "Science, technology and the humanities. Explore 24 undergraduate programmes.",
    image: "/assets/landing/courtyard.jpg",
  },
  {
    tag: "Campus news",
    title: "A new chapter in student research",
    body: "The fictional Ìmọ University opens its 2026 undergraduate research exhibition.",
    image: "/assets/landing/library.jpg",
  },
  {
    tag: "Nigerian scholars",
    title: "Meet the minds moving forward",
    body: "Discover fictional scholar profiles, research interests and academic journeys.",
    image: "/assets/landing/students-walking.jpg",
  },
];

export const PLANS = [
  {
    name: "Beginners",
    badge: "Starter workflows",
    price: "₦1,250,000",
    blurb: "Core admissions, records and reporting for smaller institutions.",
    features: [
      "1 branded institution workspace",
      "Academics: admissions lists, student records and results review",
      "Access: administrator, staff and student workspaces",
      "Onboarding: student-data import and staff rollout guidance",
      "Support: email and self-service documentation",
    ],
  },
  {
    name: "Starter",
    badge: "Most popular",
    featured: true,
    price: "₦3,500,000",
    blurb: "Connected operations and role-based access for growing institutions.",
    features: [
      "3 branded institution workspaces",
      "Academics: admissions, records, results, graduation and NYSC lists",
      "Admin, staff, student and guardian roles",
      "Priority onboarding and rollout support",
      "Finance: fee-ledger and virtual-account setup guidance; standard API guidance",
      "Email and phone support",
    ],
  },
  {
    name: "Premium",
    badge: "Enterprise scale",
    price: "₦6,500,000",
    blurb: "Advanced governance, integrations and support for larger institutions.",
    features: [
      "Unlimited branded institution workspaces",
      "Academics: full student lifecycle and custom approval workflows",
      "Advanced role governance and audit trails",
      "Dedicated onboarding, training and rollout support",
      "Finance: reconciliation setup; priority API and SSO integration support",
      "Priority phone, email and SLA support",
    ],
  },
];

export const FEE_ROWS = [
  ["Up to ₦500M", "2.5%", "Annual tuition", "Annual", "₦500M × 2.5% = ₦12.5M"],
  ["Over ₦500M to ₦1.5B", "2.0%", "Annual tuition", "Annual", "₦1B × 2% = ₦20M"],
  ["Over ₦1.5B", "1.5%", "Annual tuition", "Annual", "₦2B × 1.5% = ₦30M"],
];

export const FAQS = [
  { q: "Who is Academic Pavilion for?", a: "Nigerian tertiary institutions, academic teams, students and authorized guardians." },
  { q: "How do I sign in to my institution?", a: "Use your institution’s APL address and issued credentials. Your assigned role controls access. No shared logins or role picker." },
  { q: "Can parents see every student's results?", a: "No. Guardians see only institution-authorized wards. The institution can review or revoke that access." },
  { q: "Are payments and integrations connected?", a: "These are proposed workflows, not out-of-the-box features. Finance and integrations need institution-specific setup and scoping." },
  { q: "How does the institution onboard?", a: "We work with your institution's registrar and IT lead to configure your workspace, import existing student data and establish role permissions. A dedicated rollout session is included with every demo agreement." },
  { q: "Is Academic Pavilion live for students now?", a: "APL is a product design concept. Pilots are being scoped, and all shown data is illustrative. Book a demo to discuss timing." },
];

const FEATURES_COL = {
  title: "Features",
  links: [
    { label: "Academic records", href: "/#platform" },
    { label: "Results & graduation", href: "/#platform" },
    { label: "Role workspaces", href: "/#institutions" },
    { label: "Institution onboarding", href: "/#demo" },
  ],
};
const APL_COL = {
  title: "Academic Pavilion",
  links: [
    { label: "About APL", href: "/about" },
    { label: "Contact enquiry", href: "/#demo" },
    { label: "FAQs", href: "/#faqs" },
    { label: "Privacy & access", href: "/#top" },
  ],
};
export const FOOTER_COLUMNS = {
  home: [
    FEATURES_COL,
    {
      title: "Discover",
      links: [
        { label: "Universities", href: "/discoveries" },
        { label: "Programmes & professors", href: "/discoveries" },
        { label: "Nigerian scholars", href: "/discoveries" },
        { label: "University news", href: "/discoveries" },
      ],
    },
    APL_COL,
  ],
  inner: [
    FEATURES_COL,
    {
      title: "Discover",
      links: [
        { label: "Learning materials", href: "/discoveries" },
        { label: "Journals", href: "/discoveries#journals" },
        { label: "Nigerian scholars", href: "/discoveries" },
        { label: "University news", href: "/discoveries" },
      ],
    },
    APL_COL,
  ],
};

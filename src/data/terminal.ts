/**
 * Content for the developer-console skin. Kept apart from `portfolio.ts`
 * because it is written as terminal output - commands, trees and log lines -
 * rather than as marketing copy.
 */

export const shell = {
  user: "gowtham",
  host: "portfolio",
  path: "~",
} as const;

export const prompt = `${shell.user}@${shell.host}:${shell.path}$`;

export const identity = {
  fullName: "Gowtham Kumar",
  title: "Full-Stack Product Engineer",
  rhythm: ["Build", "Solve", "Ship"],
  mission:
    "Build practical solutions that solve real problems using modern technologies and AI tools.",
  stackLine: "React | Next.js | TypeScript | Firebase | Node.js",
  portraitAlt: "Gowtham Kumar",
  aside: ["Code", "Ideas", "Products", "Impact"],
  creed: ["Discipline", "Creates", "Freedom."],
  remote: ["Work", "From Anywhere", "Build Everywhere"],
  /** The strip along the foot of the portrait. */
  ticker: ["Always Learning", "Always Building", "Better Tomorrow"],
} as const;

export const infoLines = [
  { key: "Location", value: "India (Open to Remote)" },
  { key: "Focus", value: "Web Applications | SaaS | AI-Powered Products" },
  { key: "Stack", value: "React, Next.js, TypeScript, Firebase, Node.js" },
  { key: "Passion", value: "Turning ideas into real-world products" },
] as const;

export type Listing = {
  id: string;
  name: string;
  description: string;
  stack: string;
  status: "Live" | "In Progress";
  href: string;
};

export const listing: Listing[] = [
  {
    id: "01",
    name: "srirealtime/",
    description: "Enterprise systems, AI automation, digital engineering",
    stack: "React, Vite",
    status: "Live",
    href: "https://srirealtime.com",
  },
  {
    id: "02",
    name: "pasumai-trade/",
    description: "Farmer-to-buyer marketplace for produce",
    stack: "Next.js, Firebase",
    status: "Live",
    href: "https://pasumaitrade.com",
  },
  {
    id: "03",
    name: "pasumaivelanmai/",
    description: "Agriculture digitised, field to market",
    stack: "Next.js",
    status: "Live",
    href: "https://pasumaivelanmai.com",
  },
  {
    id: "04",
    name: "bugloop/",
    description: "Multi-tenant bug tracker built on triage",
    stack: "Next.js",
    status: "Live",
    href: "https://bugloop.srirealtime.com",
  },
  {
    id: "05",
    name: "chatbot-console/",
    description: "One embeddable chat widget, many tenants",
    stack: "Next.js",
    status: "Live",
    href: "https://chat.srirealtime.com",
  },
  {
    id: "06",
    name: "buildr/",
    description: "Site reporting, attendance and labour cost",
    stack: "Next.js",
    status: "Live",
    href: "https://3-7-64-138.sslip.io/login",
  },
  {
    id: "07",
    name: "rk-badaga-matrimony/",
    description: "Matrimony for the Nilgiris, consent first",
    stack: "Next.js",
    status: "Live",
    href: "https://rkbadagamatrimony.com",
  },
  {
    id: "08",
    name: "drape/",
    description: "Saree storefront, collections by weave",
    stack: "Next.js, Firebase",
    status: "Live",
    href: "https://ecomm-henna-nine.vercel.app",
  },
  {
    id: "09",
    name: "thara-sports/",
    description: "Sports retail organised by sport, not SKU",
    stack: "Next.js, Firebase",
    status: "Live",
    href: "https://thara-sports.vercel.app",
  },
  {
    id: "10",
    name: "school-erp-lms/",
    description: "School ERP and LMS, office to classroom",
    stack: "Next.js, Firebase",
    status: "In Progress",
    href: "#",
  },
  {
    id: "11",
    name: "question-paper-builder/",
    description: "Question papers out of PDF and DOCX sources",
    stack: "React, Firebase, AI",
    status: "In Progress",
    href: "#",
  },
];

/**
 * The stack as a directory tree, grouped the way the product skin's marquee
 * orders it - frontend, mobile, backend, data, AI, cloud. The two skins are
 * describing one person, so a tool that appears in `techStack` should be
 * findable here too.
 */
export const skillTree = [
  {
    group: "Frontend",
    items: ["React", "Next.js", "TypeScript", "Angular", "Vue.js", "Tailwind CSS", "Vite"],
  },
  {
    group: "Mobile",
    items: ["Flutter", "React Native"],
  },
  {
    group: "Backend",
    items: ["Node.js", "Express", "FastAPI", "Django", "REST APIs", "GraphQL"],
  },
  {
    group: "Data",
    items: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "Firebase (Auth, Firestore, Functions)",
    ],
  },
  {
    group: "AI",
    items: [
      "Claude",
      "OpenAI",
      "Gemini",
      "LangChain",
      "Hugging Face",
      "TensorFlow",
      "PyTorch",
      "scikit-learn",
    ],
  },
  {
    group: "Cloud & DevOps",
    items: [
      "AWS",
      "Azure",
      "Docker",
      "Kubernetes",
      "Terraform",
      "GitHub Actions",
      "Vercel / Firebase Hosting",
      "Git",
    ],
  },
] as const;

/**
 * `cat updates.log`. Newest first, and dated absolutely - a log that says
 * "last week" is a log that quietly rots.
 */
export const updates = [
  { date: "2026-09-21", entry: "Console runs full width; ls projects/ spans the window" },
  { date: "2026-09-21", entry: "Accent themes, rainbow included" },
  { date: "2026-09-20", entry: "Project cards now carry live screenshots" },
  { date: "2026-09-19", entry: "Ten shipped products on the listing, all linked" },
  { date: "2026-09-18", entry: "Working on new SaaS idea" },
  { date: "2026-09-16", entry: "G0 answers questions from the command line" },
  { date: "2026-09-12", entry: "Deployed portfolio v2" },
  { date: "2026-09-05", entry: "Added new case study: BUILDR" },
  { date: "2026-08-28", entry: "Improved UI & animations" },
  { date: "2026-08-20", entry: "Exploring product opportunities" },
] as const;

export const terminalNav = [
  { id: "01", label: "Home", href: "#home" },
  { id: "02", label: "Projects", href: "#projects" },
  { id: "03", label: "Skills", href: "#skills" },
  { id: "04", label: "About", href: "#about" },
  { id: "05", label: "Contact", href: "#contact" },
] as const;

export const closing = {
  quote: "Still building...",
  line: "Open to interesting projects, collaborations and opportunities.",
  cta: "Let's Connect",
  footer: "Build a better tomorrow.",
} as const;

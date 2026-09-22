/**
 * Single source of truth for everything the portfolio renders.
 * Swap these values for your own - no component needs editing.
 */

export const profile = {
  name: "Gowtham Kumar",
  initial: "G",
  motto: "BUILD · SOLVE · SHIP",
  eyebrow: "Architecture . Decisions . Ownership",
  role: "Full Stack Developer",
  fullName: "Gowtham Kumar",
  /** Two lines under the name; the second one carries the accent colour. */
  roleLines: ["Full-Stack Developer", "Product Engineer"],
  headline: ["I Build Products,", "Not Just Code."],
  intro:
    "Full-stack developer turning ideas into real-world applications with React, Next.js, TypeScript and Firebase - and owning the architecture and the decisions behind them.",
  email: "gowthamkumarselvarajofficial@gmail.com",
  /** Shown as written; `whatsapp` below is the same number, dialled. */
  phone: "+91 75388 91944",
  whatsapp: "https://wa.me/917538891944",
  /**
   * The file as it sits in `public/`. Keep the two in step - nothing fails
   * loudly when they drift, the link just quietly 404s.
   */
  resumeUrl: "/gowthamkumar_resume.pdf",
  socials: [
    { label: "GitHub", href: "https://github.com/topgun2603/", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/gowtham-kumar-aa9b87290/", icon: "linkedin" },
    { label: "Email", href: "mailto:gowthamkumarselvarajofficial@gmail.com", icon: "mail" },
    // wa.me takes the number in full international form, no + and no spaces.
    { label: "WhatsApp", href: "https://wa.me/917538891944", icon: "whatsapp" },
  ],
  footerNote: "Build a better tomorrow.",
} as const;

/** The four claims beside the portrait in the hero. */
export const heroHighlights = [
  { title: ["Full-Stack", "Delivery"], icon: "stack" },
  { title: ["Fast", "Performance"], icon: "gauge" },
  { title: ["Mobile", "Friendly"], icon: "phone" },
  { title: ["End-To-End", "Ownership"], icon: "sparkles" },
] as const;

export const locations = ["India", "Remote", "Worldwide"] as const;

/**
 * What I actually do. Written from this stack - React, Next.js, TypeScript,
 * Firebase, Node.js - rather than borrowed from a template.
 */
export const services = [
  {
    title: "Web Applications",
    blurb: "Responsive React and Next.js apps, built to ship and to maintain.",
    icon: "code",
    accent: "text-sky-400",
  },
  {
    title: "SaaS Products",
    blurb: "Multi-tenant products with auth, roles and a data model that holds.",
    icon: "saas",
    accent: "text-violet-400",
  },
  {
    title: "AI-Powered Features",
    blurb: "LLM features grounded in real data, that decline rather than guess.",
    icon: "ai",
    accent: "text-emerald-400",
  },
  {
    title: "APIs & Backends",
    blurb: "Node.js services, REST APIs and realtime data on Firebase.",
    icon: "server",
    accent: "text-amber-400",
  },
  {
    title: "Databases",
    blurb: "Firestore and PostgreSQL schemas designed to survive growth.",
    icon: "database",
    accent: "text-rose-400",
  },
  {
    title: "Performance & SEO",
    blurb: "Core Web Vitals, rendering strategy and crawlable by default.",
    icon: "speed",
    accent: "text-cyan-400",
  },
] as const;

/** Short claims under the About paragraph, two per row. */
export const aboutPoints = [
  { title: "Available Worldwide", icon: "globe" },
  { title: "Open To Freelance", icon: "clock" },
  { title: "Clean, Modern Builds", icon: "pen" },
  { title: "Ships On Time", icon: "calendar" },
] as const;

/** The chalkboard behind the desk in the hero. */
export const wallProcess = ["Idea", "Plan", "Build", "Test", "Deploy", "Repeat"] as const;

export const wallQuote = "Good Ideas Build Better Lives.";
export const wallPoster = ["Discipline", "Creates", "Freedom."] as const;

/** One screenshot in a project's carousel. */
export type Shot = {
  /** Under `public/shots`, all 1280x720 webp - see the README. */
  src: string;
  caption: string;
};

export type Project = {
  name: string;
  /** The product's own one-liner. */
  tagline: string;
  /** The two letters on the plate, as each product brands itself. */
  monogram: string;
  /** What kind of thing it is - also what the stat row counts as a domain. */
  sector: string;
  blurb: string;
  /**
   * What the deployed site actually serves, read off the live response rather
   * than remembered. Keep it that way: an invented stack is the one claim on a
   * portfolio a technical visitor can check in ten seconds.
   */
  stack: string[];
  /** The live URL, or null when there is nothing public to send anyone to. */
  href: string | null;
  /**
   * Screenshots of the running product. An empty list is fine - the card drops
   * the carousel rather than showing a placeholder, because a grey rectangle
   * saying "no image" is worse than no image.
   */
  shots: Shot[];
  /** Shown first and given the full width - the parent platform, not a product. */
  featured?: true;
};

/**
 * Real, shipped work. Every `href` here is a running deployment, and the copy
 * is each product's own - taken from what it says about itself, not written up
 * from memory.
 */
export const projects: Project[] = [
  {
    name: "SRI REAL TIME",
    tagline: "Enterprise systems, AI automation and digital engineering",
    monogram: "SR",
    sector: "Company Platform",
    blurb:
      "The company platform itself - ERP, CRM, SCM, MIS, e-commerce, mobile and web, presented as one engineering practice. Every product below ships under it.",
    stack: ["React", "Vite", "Motion"],
    href: "https://srirealtime.com",
    shots: [
      { src: "/shots/srirealtime-home.webp", caption: "The landing page" },
      {
        src: "/shots/srirealtime-projects.webp",
        caption: "Platforms we have shipped",
      },
      { src: "/shots/srirealtime-services.webp", caption: "The service lines" },
    ],
    featured: true,
  },
  {
    name: "Pasumai Trade",
    tagline: "Empowering farmers",
    monogram: "PT",
    sector: "Marketplace",
    blurb:
      "A direct farmer-to-buyer marketplace for produce across India. Growers set their own price and negotiate without intermediaries, while escrow, quality verification and transport are handled on the platform.",
    stack: ["Next.js", "Firebase"],
    href: "https://pasumaitrade.com",
    shots: [
      {
        src: "/shots/pasumai-trade-home.webp",
        caption: "The farmer and buyer landing page",
      },
      {
        src: "/shots/pasumai-trade-prices.webp",
        caption: "Today's settled prices, grade by grade",
      },
      {
        src: "/shots/pasumai-trade-plans.webp",
        caption: "Subscription terms, one price list",
      },
    ],
  },
  {
    name: "Pasumaivelanmai",
    tagline: "Agriculture, digitised end to end",
    monogram: "PV",
    sector: "Agri Platform",
    blurb:
      "The field-to-market journey in one place: schemes with who qualifies and what to bring, inputs, live market rates, a manufacturer seller console and a growers' community.",
    stack: ["Next.js"],
    href: "https://pasumaivelanmai.com",
    shots: [
      {
        src: "/shots/pasumaivelanmai-home.webp",
        caption: "The farmer-facing landing page",
      },
      {
        src: "/shots/pasumaivelanmai-platform.webp",
        caption: "Schemes, inputs, market rates and community in one place",
      },
      {
        src: "/shots/pasumaivelanmai-schemes.webp",
        caption: "Every scheme with who qualifies and what to bring",
      },
      {
        src: "/shots/pasumaivelanmai-manufacturers.webp",
        caption: "The manufacturer seller console",
      },
    ],
  },
  {
    name: "Bugloop",
    tagline: "Track. Fix. Move forward.",
    monogram: "BL",
    sector: "Issue Tracking",
    blurb:
      "A multi-tenant bug tracker built around the triage workflow rather than a generic board: report, triage, assign, fix, verify, close.",
    stack: ["Next.js"],
    href: "https://bugloop.srirealtime.com",
    shots: [
      {
        src: "/shots/bugloop-login.webp",
        caption: "Sign in, with the triage loop spelled out on it",
      },
    ],
  },
  {
    name: "Chatbot Console",
    tagline: "One chatbot, every product we ship",
    monogram: "CB",
    sector: "SaaS",
    blurb:
      "A single embeddable widget serving many tenants from one codebase. Add a product, get an embed key, point it at a page or a file - branding, voice and knowledge stay configuration rather than a fork.",
    stack: ["Next.js"],
    href: "https://chat.srirealtime.com",
    shots: [
      {
        src: "/shots/chatbot-console.webp",
        caption: "The operator sign-in and embed tag",
      },
    ],
  },
  {
    name: "BUILDR",
    tagline: "Every site. Every day. Every rupee.",
    monogram: "BR",
    sector: "Construction",
    blurb:
      "Daily reports, named attendance and wage sheets, from the site to the builder's screen before the morning tea is finished. Reports save on the phone with no signal and sync when the bars come back.",
    stack: ["Next.js"],
    href: "https://3-7-64-138.sslip.io/login",
    shots: [
      {
        src: "/shots/buildr-login.webp",
        caption: "Sign in by mobile number - no password to remember",
      },
    ],
  },
  {
    name: "RK Badaga Matrimony",
    tagline: "Matchmaking with consent built in",
    monogram: "RK",
    sector: "Matrimony",
    blurb:
      "A matrimony platform for Badaga families across the Nilgiris. Every profile is read by a person before it goes live, and phone numbers stay hidden until both sides accept. English and Tamil throughout.",
    stack: ["Next.js"],
    href: "https://rkbadagamatrimony.com",
    shots: [
      {
        src: "/shots/rk-badaga-home.webp",
        caption: "The landing page, in English and Tamil",
      },
      {
        src: "/shots/rk-badaga-subscription.webp",
        caption: "Listing is free; only browsing is paid",
      },
    ],
  },
  {
    name: "Drape",
    tagline: "Sarees for every story",
    monogram: "DR",
    sector: "E-commerce",
    blurb:
      "A saree storefront organised the way the garment is actually bought - collections split by weave, with fabric, occasion and price filters over them, and checkout behind it.",
    stack: ["Next.js", "Firebase"],
    href: "https://ecomm-henna-nine.vercel.app",
    shots: [
      { src: "/shots/drape-home.webp", caption: "The storefront landing page" },
      {
        src: "/shots/drape-collections.webp",
        caption: "Collections, browsable by weave",
      },
      {
        src: "/shots/drape-shop.webp",
        caption: "The catalogue with fabric and occasion filters",
      },
      {
        src: "/shots/drape-product.webp",
        caption: "A product page, with colour and size",
      },
    ],
  },
  {
    name: "Thara Sports",
    tagline: "Gear for every game",
    monogram: "TS",
    sector: "E-commerce",
    blurb:
      "A sports retailer online, carrying the counter with it: equipment organised by sport rather than by SKU, custom team jerseys ordered by name and number, and shop stock and exchange terms in the same place.",
    stack: ["Next.js", "Firebase"],
    href: "https://thara-sports.vercel.app",
    shots: [
      {
        src: "/shots/thara-sports-home.webp",
        caption: "The storefront landing page",
      },
      {
        src: "/shots/thara-sports-collections.webp",
        caption: "Collections, browsable by sport",
      },
      {
        src: "/shots/thara-sports-featured.webp",
        caption: "The featured equipment grid",
      },
      {
        src: "/shots/thara-sports-product.webp",
        caption: "Custom team jersey, sized and personalised",
      },
    ],
  },
  {
    name: "School ERP & LMS",
    tagline: "One system for the office and the classroom",
    monogram: "SE",
    sector: "Education ERP",
    blurb:
      "A complete school platform: admissions, students, staff, timetables, attendance, fees and reporting on the administration side, with courses, materials, assignments and results on the learning side. In build.",
    // Not fingerprinted like the live ones - nothing is deployed to read yet,
    // so this is the intent rather than an observation. Correct it when it ships.
    stack: ["Next.js", "Firebase"],
    href: null,
    shots: [],
  },
  {
    name: "Question Paper Builder",
    tagline: "Papers out of the documents you already have",
    monogram: "QP",
    sector: "Education SaaS",
    blurb:
      "Generates question papers from PDF and DOCX sources in several formats, with the AI processing doing the extraction and the teacher keeping the last word.",
    stack: ["React", "Firebase", "AI"],
    // Nothing public to link to yet; the card says so rather than linking to "#".
    href: null,
    shots: [],
  },
];

/**
 * Counted from the work above rather than typed in, so a number on the page can
 * never quietly contradict the list right beside it.
 */
export const stats = [
  { value: `${projects.length}`, label: "Products Built", icon: "trophy" },
  {
    value: `${new Set(projects.map((p) => p.sector)).size}`,
    label: "Product Domains",
    icon: "layers",
  },
  {
    value: `${projects.filter((p) => p.href).length}`,
    label: "Live In Production",
    icon: "rocket",
  },
  { value: "100%", label: "Hands-on Development", icon: "star" },
] as const;

/**
 * The About panel.
 *
 * Ownership first, tooling second. An earlier draft opened on which AI
 * assistants get used, which made the assistants the headline of an
 * engineering identity - the interesting claim is not that he uses AI, it is
 * that he answers for what ships.
 */
export const aiStatement = {
  title: "Engineered By Me. Built Faster With AI.",
  paragraphs: [
    "I own the architecture, the decisions and the product - how a system is put together, where the data lives, what ships and what does not. That part does not get delegated.",
    "AI is how I move faster through the work that is typing rather than thinking. It drafts, I decide: I define the problem, choose the shape of the solution, review what comes back, and carry it through to release.",
  ],
} as const;

export const workflow = [
  { title: "Idea", icon: "idea" },
  { title: "Plan", icon: "plan" },
  { title: "Build", note: "(with AI)", icon: "build" },
  { title: "Test", icon: "test" },
  { title: "Deploy", icon: "deploy" },
  { title: "Improve", icon: "improve" },
] as const;

/**
 * The stack, grouped by layer - frontend, backend, data, AI, cloud. The order
 * matters: the marquee splits this list down the middle into two rows, so
 * keeping related tools adjacent keeps each row coherent as it scrolls.
 */
export const techStack = [
  "react",
  "nextjs",
  "angular",
  "vue",
  "typescript",
  "tailwind",
  "material",
  "vite",
  "flutter",
  "reactnative",

  "nodejs",
  "express",
  "fastapi",
  "django",
  "graphql",

  "postgres",
  "mysql",
  "mongodb",
  "redis",
  "sqlite",
  "firebase",

  "claude",
  "openai",
  "gemini",
  "tensorflow",
  "pytorch",
  "scikit",
  "langchain",
  "huggingface",

  "aws",
  "azure",
  "docker",
  "kubernetes",
  "githubactions",
  "terraform",
] as const;

export const cta = {
  eyebrow: "Let's build something meaningful",
  title: "Have a Project in Mind?",
  body: "I'm always open to interesting projects, collaborations and opportunities. Let's create something that makes an impact.",
  aside: ["Work", "From Anywhere", "Build Everywhere"],
} as const;

export const navigation = [
  { id: "hero", label: "Home", href: "#hero" },
  { id: "work", label: "Projects", href: "#work" },
  { id: "about", label: "About", href: "#about" },
  { id: "skills", label: "Skills", href: "#skills" },
  { id: "blog", label: "Blog", href: "/blog" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

/**
 * The sections the torch can uncover. The intro's progress hint counts these,
 * so adding a section to the page means adding its id here.
 */
export const discoveryZones = ["hero", "about", "work", "contact"] as const;

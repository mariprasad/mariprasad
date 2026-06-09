export type Role = { company: string; title: string; period: string; blurb: string };

export type Project = {
  name: string;
  org: string;
  period: string;
  blurb: string;
  stack: string[];
  url?: string; // only set when the work is publicly viewable
};

export const FEATURED = {
  title: "LLM Flight-Search Pipeline",
  company: "Techtree Labs",
  blurb:
    "A server-side flight-search pipeline using the OpenAI API with JSON-schema structured outputs, Zod validation, and anti-hallucination grounding against a live airport API.",
  stack: ["Next.js", "Node.js", "OpenAI API", "Zod", "PostgreSQL"],
  url: "https://utravel.com",
};

// Selected work. Most of the last few years lives in private Azure DevOps repos,
// so these are described rather than linked; `url` is set only where it's public.
export const PROJECTS: Project[] = [
  {
    name: "utravel.com",
    org: "Techtree Labs",
    period: "2024 – present",
    blurb:
      "Full-stack work across the travel platform — React/Next.js frontends and Node.js API routes — including the LLM flight-search pipeline featured above.",
    stack: ["Next.js", "Node.js", "OpenAI API", "PostgreSQL"],
    url: "https://utravel.com",
  },
  {
    name: "Karnataka Govt · MGNREGA services",
    org: "Techtree Labs",
    period: "2024 – present",
    blurb:
      "End-to-end React/Next.js + Node.js features for the state's MGNREGA rural-employment program — public-sector scale, real citizens, real accountability.",
    stack: ["Next.js", "React", "Node.js", "PostgreSQL"],
  },
  {
    name: "Thrillark",
    org: "Thrillark",
    period: "2020 – 2021",
    blurb:
      "Travel-activity booking platform: responsive, reusable React UI for browsing and booking experiences.",
    stack: ["React", "Sass"],
    url: "https://www.thrillark.com",
  },
  {
    name: "YouKraft marketplace",
    org: "YouKraft",
    period: "2021 – 2022",
    blurb:
      "Led a marketplace platform with role-based admin systems — GraphQL APIs and a Prisma + PostgreSQL data layer behind a Next.js frontend.",
    stack: ["Next.js", "GraphQL", "Prisma", "PostgreSQL"],
  },
  {
    name: "Analytics dashboards",
    org: "Crain Communications",
    period: "2016 – 2019",
    blurb:
      "Complex data-visualization interfaces and analytics dashboards for a major New York publisher, built with D3.js.",
    stack: ["React", "AngularJS", "D3.js"],
  },
  {
    name: "Campaign & acquisition apps",
    org: "Global Citizen",
    period: "2015 – 2016",
    blurb:
      "Campaign and acquisition-focused web applications supporting global advocacy drives, integrated with a Django backend.",
    stack: ["JavaScript", "Django"],
  },
];

export const EXPERIENCE: Role[] = [
  { company: "Techtree Labs", title: "Full-Stack / Founding Engineer", period: "Apr 2024 – present", blurb: "End-to-end React/Next.js + Node features for Karnataka Govt MGNREGA and utravel.com; shipped the LLM flight-search pipeline." },
  { company: "YouKraft", title: "Tech Lead", period: "Sep 2021 – Dec 2022", blurb: "Marketplace platform with role-based admin, GraphQL APIs, Prisma + PostgreSQL, Next.js frontend." },
  { company: "Thrillark", title: "Frontend Developer", period: "Jan 2020 – May 2021", blurb: "Travel activity booking UIs with React + Sass." },
  { company: "Crain Communications", title: "Senior Frontend Developer", period: "Jul 2016 – Oct 2019", blurb: "Analytics dashboards and D3.js data-viz, NYC." },
  { company: "Global Citizen", title: "Frontend Developer", period: "Jun 2015 – Jul 2016", blurb: "Campaign web apps on a Django backend, NYC." },
];

export const RESUME_URL = "/Mariprasad_Ramakrishna_Resume.pdf";

export type Role = { company: string; title: string; period: string; blurb: string };

export type Project = {
  name: string;
  org: string;
  period: string;
  blurb: string;
  stack: string[];
  url?: string; // only set when the work is publicly viewable
};

// Selected work. Most of the last few years lives in private Azure DevOps repos,
// so these are described rather than linked; `url` is set only where it's public.
export const PROJECTS: Project[] = [
  {
    name: "utravel.com",
    org: "Techtree Labs",
    period: "2024 – present",
    blurb:
      "Full-stack work across the travel platform — React/Next.js frontends and Node.js API routes — plus an LLM flight-search pipeline (OpenAI structured outputs, Zod validation, grounded against a live airport API) that's still in the works, not yet live.",
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
];

export const EXPERIENCE: Role[] = [
  { company: "Techtree Labs", title: "Full-Stack / Founding Engineer", period: "Apr 2024 – present", blurb: "End-to-end React/Next.js + Node features for Karnataka Govt MGNREGA and utravel.com; built an LLM flight-search pipeline (not yet live)." },
  { company: "YouKraft", title: "Tech Lead", period: "Sep 2021 – Dec 2022", blurb: "Marketplace platform with role-based admin, GraphQL APIs, Prisma + PostgreSQL, Next.js frontend." },
  { company: "Thrillark", title: "Frontend Developer", period: "Jan 2020 – May 2021", blurb: "Travel activity booking UIs with React + Sass." },
];

export const RESUME_URL = "/Mariprasad_Ramakrishna_Resume.pdf";

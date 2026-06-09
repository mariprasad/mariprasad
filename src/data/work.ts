export type Role = { company: string; title: string; period: string; blurb: string };

export const FEATURED = {
  title: "LLM Flight-Search Pipeline",
  company: "Techtree Labs",
  blurb:
    "A server-side flight-search pipeline using the OpenAI API with JSON-schema structured outputs, Zod validation, and anti-hallucination grounding against a live airport API.",
  stack: ["Next.js", "Node.js", "OpenAI API", "Zod", "PostgreSQL"],
};

export const EXPERIENCE: Role[] = [
  { company: "Techtree Labs", title: "Full-Stack / Founding Engineer", period: "Apr 2024 – present", blurb: "End-to-end React/Next.js + Node features for Karnataka Govt MGNREGA and utravel.com; shipped the LLM flight-search pipeline." },
  { company: "YouKraft", title: "Tech Lead", period: "Sep 2021 – Dec 2022", blurb: "Marketplace platform with role-based admin, GraphQL APIs, Prisma + PostgreSQL, Next.js frontend." },
  { company: "Thrillark", title: "Frontend Developer", period: "Jan 2020 – May 2021", blurb: "Travel activity booking UIs with React + Sass." },
  { company: "Crain Communications", title: "Senior Frontend Developer", period: "Jul 2016 – Oct 2019", blurb: "Analytics dashboards and D3.js data-viz, NYC." },
  { company: "Global Citizen", title: "Frontend Developer", period: "Jun 2015 – Jul 2016", blurb: "Campaign web apps on a Django backend, NYC." },
];

export const RESUME_URL = "/Mariprasad_Ramakrishna_Resume.pdf";

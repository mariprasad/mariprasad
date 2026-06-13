// Animated placeholder for a recipe with no photos yet — a sourdough boule
// baking: crust caramelising, steam drifting up, a warm oven glow underneath.
// Pure CSS animation (no JS); honours reduced-motion.
export default function BakingLoaf({ label = "Proofing" }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 250" className="h-full w-full" role="img" aria-label={`${label} — illustration of a sourdough loaf baking`}>
        <defs>
          <linearGradient id="bl-crust" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7b877" />
            <stop offset="55%" stopColor="#c47a3d" />
            <stop offset="100%" stopColor="#a85c2b" />
          </linearGradient>
          <radialGradient id="bl-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--color-terracotta)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <style>{`
          .bl * { transform-box: fill-box; transform-origin: center; }
          @media (prefers-reduced-motion: no-preference) {
            .bl-loaf  { animation: bl-spring 6s ease-in-out infinite; }
            .bl-bake  { animation: bl-bake 6s ease-in-out infinite; }
            .bl-glow  { animation: bl-pulse 3s ease-in-out infinite; }
            .bl-s1 { animation: bl-rise 3.4s ease-in-out infinite; }
            .bl-s2 { animation: bl-rise 3.4s ease-in-out .7s infinite; }
            .bl-s3 { animation: bl-rise 3.4s ease-in-out 1.5s infinite; }
            .bl-d1 { animation: bl-dot 1.6s steps(1) infinite; }
            .bl-d2 { animation: bl-dot 1.6s steps(1) .25s infinite; }
            .bl-d3 { animation: bl-dot 1.6s steps(1) .5s infinite; }
          }
          @keyframes bl-dot { 0%,75%,100% { opacity: 0 } 35% { opacity: 1 } }
          @keyframes bl-spring { 0%,100% { transform: scale(1) } 50% { transform: scale(1.035) } }
          @keyframes bl-bake   { 0%,100% { opacity: 0 } 55% { opacity: .38 } }
          @keyframes bl-pulse  { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
          @keyframes bl-rise   { 0% { opacity: 0; transform: translateY(8px) scaleX(1) }
                                 35% { opacity: .55 }
                                 100% { opacity: 0; transform: translateY(-26px) scaleX(1.5) } }
        `}</style>

        <g className="bl">
          {/* steam */}
          <g fill="none" stroke="var(--color-ink-soft)" strokeWidth="3" strokeLinecap="round">
            <path className="bl-s1" d="M80 96 q-7 -10 0 -20 q7 -10 0 -20" />
            <path className="bl-s2" d="M100 96 q-7 -10 0 -20 q7 -10 0 -20" />
            <path className="bl-s3" d="M120 96 q-7 -10 0 -20 q7 -10 0 -20" />
          </g>

          {/* oven glow */}
          <ellipse className="bl-glow" cx="100" cy="196" rx="78" ry="30" fill="url(#bl-glow)" />

          <g className="bl-loaf">
            {/* boule */}
            <path
              d="M38 168 q-4 -56 62 -56 q66 0 62 56 q-62 16 -124 0 Z"
              fill="url(#bl-crust)"
              stroke="#7a3d1a"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* the bake wash — deepens the crust on a slow loop */}
            <path
              className="bl-bake"
              d="M38 168 q-4 -56 62 -56 q66 0 62 56 q-62 16 -124 0 Z"
              fill="#5a2c10"
            />
            {/* scoring: a curved ear + a couple of expansion cracks */}
            <g fill="none" stroke="#6b3410" strokeWidth="3" strokeLinecap="round">
              <path d="M68 130 q32 -16 64 4" />
              <path d="M74 148 q12 -6 22 0" />
              <path d="M108 150 q12 -6 22 -2" />
            </g>
            {/* the raised "ear" highlight */}
            <path d="M68 130 q32 -16 64 4" fill="none" stroke="#f0d9a8" strokeWidth="2" transform="translate(0 -3)" />
            {/* flour dusting */}
            <g fill="#f3e7cf" opacity="0.6">
              <circle cx="62" cy="124" r="1.6" />
              <circle cx="92" cy="118" r="1.6" />
              <circle cx="120" cy="126" r="1.6" />
              <circle cx="138" cy="140" r="1.6" />
            </g>
          </g>

          {/* board */}
          <rect x="30" y="176" width="140" height="12" rx="6" fill="var(--color-paper)" stroke="var(--color-ink-soft)" strokeWidth="1.5" />
        </g>
      </svg>
      <span className="label absolute bottom-3 text-pine">
        {label}
        <span className="bl-d1">.</span><span className="bl-d2">.</span><span className="bl-d3">.</span>
      </span>
    </div>
  );
}

// Animated placeholder for a recipe with no photos yet — a floured sourdough
// boule baking: crust caramelising, an ear-slash and grigne on top, steam
// drifting up, a warm oven glow underneath. Pure CSS animation; reduced-motion safe.
export default function BakingLoaf({ label = "Proofing" }: { label?: string }) {
  // Round, slightly settled artisan boule (organic — not a perfect circle).
  const BODY =
    "M100 84 C142 82 172 108 172 142 C173 170 146 188 100 188 C56 188 29 171 30 142 C30 109 58 86 100 84 Z";
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 250" className="h-full w-full" role="img" aria-label={`${label} — illustration of a sourdough loaf baking`}>
        <defs>
          <linearGradient id="bl-crust" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d99a52" />
            <stop offset="55%" stopColor="#bb6f33" />
            <stop offset="100%" stopColor="#8f4f22" />
          </linearGradient>
          <radialGradient id="bl-flour" cx="0.5" cy="0.42" r="0.62">
            <stop offset="0%" stopColor="#efe2c4" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#e6d3ad" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#e6d3ad" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bl-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="var(--color-terracotta)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--color-terracotta)" stopOpacity="0" />
          </radialGradient>
          <clipPath id="bl-clip"><path d={BODY} /></clipPath>
        </defs>
        <style>{`
          .bl * { transform-box: fill-box; transform-origin: center; }
          @media (prefers-reduced-motion: no-preference) {
            .bl-loaf { animation: bl-spring 6s ease-in-out infinite; }
            .bl-bake { animation: bl-bake 6s ease-in-out infinite; }
            .bl-glow { animation: bl-pulse 3s ease-in-out infinite; }
            .bl-s1 { animation: bl-rise 3.4s ease-in-out infinite; }
            .bl-s2 { animation: bl-rise 3.4s ease-in-out .7s infinite; }
            .bl-s3 { animation: bl-rise 3.4s ease-in-out 1.5s infinite; }
            .bl-d1 { animation: bl-dot 1.6s steps(1) infinite; }
            .bl-d2 { animation: bl-dot 1.6s steps(1) .25s infinite; }
            .bl-d3 { animation: bl-dot 1.6s steps(1) .5s infinite; }
          }
          @keyframes bl-spring { 0%,100% { transform: scale(1) } 50% { transform: scale(1.03) } }
          @keyframes bl-bake   { 0%,100% { opacity: 0 } 55% { opacity: .32 } }
          @keyframes bl-pulse  { 0%,100% { opacity: .5 } 50% { opacity: 1 } }
          @keyframes bl-rise   { 0% { opacity: 0; transform: translateY(8px) scaleX(1) }
                                 35% { opacity: .55 }
                                 100% { opacity: 0; transform: translateY(-26px) scaleX(1.5) } }
          @keyframes bl-dot    { 0%,75%,100% { opacity: 0 } 35% { opacity: 1 } }
        `}</style>

        <g className="bl">
          {/* steam */}
          <g fill="none" stroke="var(--color-ink-soft)" strokeWidth="3" strokeLinecap="round">
            <path className="bl-s1" d="M82 92 q-7 -10 0 -20 q7 -10 0 -20" />
            <path className="bl-s2" d="M100 92 q-7 -10 0 -20 q7 -10 0 -20" />
            <path className="bl-s3" d="M118 92 q-7 -10 0 -20 q7 -10 0 -20" />
          </g>

          {/* oven glow + cast shadow on the board */}
          <ellipse className="bl-glow" cx="100" cy="194" rx="80" ry="26" fill="url(#bl-glow)" />
          <ellipse cx="100" cy="187" rx="70" ry="9" fill="var(--color-ink)" opacity="0.12" />

          <g className="bl-loaf">
            {/* crust */}
            <path d={BODY} fill="url(#bl-crust)" stroke="#5e3318" strokeWidth="3" strokeLinejoin="round" />

            <g clipPath="url(#bl-clip)">
              {/* deep-bake wash — crust darkens on a slow loop */}
              <path className="bl-bake" d={BODY} fill="#4a2810" />
              {/* dusting of flour across the top */}
              <ellipse cx="100" cy="116" rx="64" ry="34" fill="url(#bl-flour)" />

              {/* the ear: one bold diagonal slash, shaded so a flap reads as raised.
                  Diagonal (not horizontal) so it never looks like a mouth. */}
              <path d="M66 104 Q104 132 138 178" fill="none" stroke="#3f2110" strokeWidth="6" strokeLinecap="round" />
              <path d="M61 108 Q99 136 133 182" fill="none" stroke="#f4e8cc" strokeWidth="3.5" strokeLinecap="round" opacity="0.9" />
              <path d="M71 101 Q109 129 143 175" fill="none" stroke="#a35e2c" strokeWidth="3" strokeLinecap="round" opacity="0.6" />

              {/* grigne — two short cracks branching off, same diagonal */}
              <g fill="none" stroke="#3f2110" strokeWidth="3" strokeLinecap="round" opacity="0.8">
                <path d="M96 110 q16 8 24 26" />
                <path d="M52 132 q14 6 22 22" />
              </g>

              {/* flour speckles on the golden crust */}
              <g fill="#f4e8cc" opacity="0.55">
                <circle cx="124" cy="112" r="1.6" />
                <circle cx="100" cy="104" r="1.4" />
                <circle cx="142" cy="128" r="1.4" />
                <circle cx="80" cy="150" r="1.3" />
                <circle cx="150" cy="150" r="1.3" />
              </g>
            </g>
          </g>

          {/* board */}
          <rect x="26" y="184" width="148" height="12" rx="6" fill="var(--color-paper)" stroke="var(--color-ink-soft)" strokeWidth="1.5" />
        </g>
      </svg>
      <span className="label absolute bottom-3 text-pine">
        {label}
        <span className="bl-d1">.</span><span className="bl-d2">.</span><span className="bl-d3">.</span>
      </span>
    </div>
  );
}

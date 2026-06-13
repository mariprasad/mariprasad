// Animated placeholder for a recipe with no photos yet — a little baker resting
// his chin on his palm, blinking and drumming his fingers while he waits for the
// bake to happen. Pure CSS/SMIL animation (no JS); honours reduced-motion.
export default function WaitingBaker({ label = "Coming soon" }: { label?: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg viewBox="0 0 200 250" className="h-full w-full" role="img" aria-label={`${label} — illustration of a baker waiting`}>
        <style>{`
          .wb * { transform-box: fill-box; transform-origin: center; }
          @media (prefers-reduced-motion: no-preference) {
            .wb-body  { animation: wb-bob 5s ease-in-out infinite; }
            .wb-eyes  { animation: wb-blink 4.5s infinite; }
            .wb-brow  { animation: wb-bob 5s ease-in-out infinite; }
            .wb-f1 { animation: wb-tap .9s ease-in-out infinite; }
            .wb-f2 { animation: wb-tap .9s ease-in-out .12s infinite; }
            .wb-f3 { animation: wb-tap .9s ease-in-out .24s infinite; }
            .wb-f4 { animation: wb-tap .9s ease-in-out .36s infinite; }
            .wb-steam { animation: wb-rise 3.2s ease-in-out infinite; }
          }
          @keyframes wb-bob   { 0%,100% { transform: translateY(0) } 50% { transform: translateY(3px) } }
          @keyframes wb-blink { 0%,93%,100% { transform: scaleY(1) } 96% { transform: scaleY(.1) } }
          @keyframes wb-tap   { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-3px) } }
          @keyframes wb-rise  { 0% { opacity: 0; transform: translateY(4px) } 40% { opacity: .5 } 100% { opacity: 0; transform: translateY(-9px) } }
        `}</style>
        <g className="wb"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* steam from a resting loaf, drifting up */}
          <g className="wb-steam" stroke="var(--color-ink-soft)" strokeWidth="2.5" opacity="0.5">
            <path d="M150 150 q5 -6 0 -12" />
            <path d="M160 152 q5 -6 0 -12" />
          </g>
          {/* a little loaf on the counter */}
          <path d="M138 168 q17 -20 34 0 z" fill="var(--color-terracotta)" />

          <g className="wb-body">
            {/* torso / apron */}
            <path d="M62 200 V150 a38 40 0 0 1 76 0 V200 Z" fill="var(--color-pine)" />
            <path d="M88 116 h24 v22 a12 12 0 0 1 -24 0 Z" fill="#efe4cf" /> {/* neck */}

            {/* supporting forearm: elbow on counter up to the chin */}
            <path d="M150 196 L122 130" stroke="#efe4cf" strokeWidth="16" />
            <path d="M150 196 L122 130" strokeWidth="3" />

            {/* head + face, tilted to lean its weight onto the palm */}
            <g transform="rotate(8 96 116)">
              <circle cx="92" cy="92" r="33" fill="#efe4cf" />

              {/* toque */}
              <rect x="66" y="58" width="52" height="15" rx="4" fill="var(--color-paper)" />
              <path d="M70 60 a13 13 0 0 1 6 -22 a14 14 0 0 1 24 -3 a13 13 0 0 1 14 25 Z" fill="var(--color-paper)" />
              <path d="M66 73 h52" stroke="var(--color-terracotta)" strokeWidth="3" />

              {/* face */}
              <g className="wb-eyes" fill="var(--color-ink)" stroke="none">
                <ellipse cx="83" cy="92" rx="3.2" ry="4.2" />
                <ellipse cx="101" cy="92" rx="3.2" ry="4.2" />
              </g>
              <path className="wb-brow" d="M97 82 q5 -3 9 0" strokeWidth="2.5" /> {/* one raised brow */}
              <path d="M78 83 q5 -2 9 0" strokeWidth="2.5" />
              <path d="M82 108 q6 3 12 -1" strokeWidth="2.5" /> {/* small bored mouth */}
              {/* squished cheek where the palm pushes up */}
              <circle cx="106" cy="104" r="4.5" fill="var(--color-terracotta)" stroke="none" opacity="0.45" />
            </g>

            {/* cupped hand under the chin: palm + thumb up the cheek */}
            <path d="M101 122 q15 -4 21 6 q5 11 -5 16 q-13 5 -19 -5 q-3 -11 3 -17 Z" fill="#efe4cf" />
            <path d="M104 120 q9 -7 16 -3" strokeWidth="3" /> {/* thumb */}
          </g>

          {/* counter (in front, hides the torso base) */}
          <rect x="6" y="196" width="188" height="54" rx="6" fill="var(--color-paper)" />
          <path d="M6 200 H194" strokeWidth="2.5" stroke="var(--color-ink-soft)" />

          {/* the other hand, drumming on the counter */}
          <path d="M48 200 q14 -6 26 0" stroke="#efe4cf" strokeWidth="14" /> {/* back of hand */}
          <g stroke="#efe4cf" strokeWidth="5">
            <path className="wb-f1" d="M52 198 v8" />
            <path className="wb-f2" d="M60 196 v10" />
            <path className="wb-f3" d="M68 196 v10" />
            <path className="wb-f4" d="M76 198 v8" />
          </g>

          {/* elbow resting on the counter */}
          <circle cx="150" cy="197" r="9" fill="#efe4cf" />
        </g>
      </svg>
      <span className="label absolute bottom-3 text-pine">{label}</span>
    </div>
  );
}

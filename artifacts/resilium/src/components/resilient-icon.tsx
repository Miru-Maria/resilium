export function ResilientIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Muscular arms ── sweep from lower corners up to cradle the brain */}
      {/* Left arm — control points push outward (left) to suggest bicep swell */}
      <path
        d="M 3.5 21.5 C 0.5 18.5, 0 13.5, 1.5 9.5 C 2.5 7, 5 5.5, 7.5 4.5"
        stroke="currentColor"
        strokeWidth="2.0"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right arm — mirror */}
      <path
        d="M 20.5 21.5 C 23.5 18.5, 24 13.5, 22.5 9.5 C 21.5 7, 19 5.5, 16.5 4.5"
        stroke="currentColor"
        strokeWidth="2.0"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── Brain — two hemispheres, narrower to sit inside the arms ── */}
      {/* Left hemisphere */}
      <path
        d="M 12 3.5
           C 10.5 3.5, 8.5 4, 7.5 5.5
           C 6.5 7, 6.5 9.5, 7.5 11
           C 8 12, 8.5 12.5, 9 13.5
           L 12 13.5 L 12 3.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Right hemisphere */}
      <path
        d="M 12 3.5
           C 13.5 3.5, 15.5 4, 16.5 5.5
           C 17.5 7, 17.5 9.5, 16.5 11
           C 16 12, 15.5 12.5, 15 13.5
           L 12 13.5 L 12 3.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Longitudinal fissure */}
      <line
        x1="12" y1="3.5"
        x2="12" y2="13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />

      {/* ── Left gyri — horizontal fold arcs ── */}
      <path d="M 8 6.5 Q 9.5 5.5, 11 6.5"
        stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M 7 9.5 Q 8.5 8.5, 10.5 9.5"
        stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M 7.5 12 Q 9 11, 10.5 12"
        stroke="currentColor" strokeWidth="1.0" fill="none" strokeLinecap="round"/>

      {/* ── Right gyri — mirror ── */}
      <path d="M 16 6.5 Q 14.5 5.5, 13 6.5"
        stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M 17 9.5 Q 15.5 8.5, 13.5 9.5"
        stroke="currentColor" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
      <path d="M 16.5 12 Q 15 11, 13.5 12"
        stroke="currentColor" strokeWidth="1.0" fill="none" strokeLinecap="round"/>

      {/* ── Brainstem — short arch between brain and arms ── */}
      <path
        d="M 9.5 13.5 Q 9.5 15.5, 12 15.5 Q 14.5 15.5, 14.5 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

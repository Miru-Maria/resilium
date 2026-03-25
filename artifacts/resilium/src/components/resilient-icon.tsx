export function ResilientIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Left hemisphere — main mass */}
      <path
        d="M12 4
           C 10 4, 7.5 4.5, 6 6.5
           C 4.5 8.5, 4.5 11, 5.5 13
           C 6.5 15, 8 16, 8.5 17.5
           L 12 17.5 L 12 4 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Right hemisphere — main mass */}
      <path
        d="M12 4
           C 14 4, 16.5 4.5, 18 6.5
           C 19.5 8.5, 19.5 11, 18.5 13
           C 17.5 15, 16 16, 15.5 17.5
           L 12 17.5 L 12 4 Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      {/* Longitudinal fissure — corpus callosum center division */}
      <line
        x1="12" y1="4"
        x2="12" y2="17.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Left gyri — fold lines */}
      <path
        d="M 7 7.5 Q 9 6, 11 7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 5.5 11 Q 7.5 9.5, 10.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 6.5 14 Q 8 13, 10 14"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right gyri — fold lines (mirror) */}
      <path
        d="M 17 7.5 Q 15 6, 13 7.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 18.5 11 Q 16.5 9.5, 13.5 10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 17.5 14 Q 16 13, 14 14"
        stroke="currentColor"
        strokeWidth="1.1"
        fill="none"
        strokeLinecap="round"
      />
      {/* Brainstem */}
      <path
        d="M 9.5 17.5 Q 9.5 20, 12 20 Q 14.5 20, 14.5 17.5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

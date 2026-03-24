export function ResilientIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M1.5 17.5 L7 7.5 L10 11.5 L14 4 L18.5 17.5 Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path
        d="M1.5 17.5 L7 7.5 L10 11.5 L14 4 L18.5 17.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <line
        x1="14"
        y1="4"
        x2="14"
        y2="1.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 1.2 L17 2.6 L14 4"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

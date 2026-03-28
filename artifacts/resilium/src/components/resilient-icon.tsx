export function ResilientIcon({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Resilium"
      className={className}
      style={{
        filter: [
          "invert(58%) sepia(58%) saturate(700%) hue-rotate(334deg) brightness(97%) contrast(97%)",
          "drop-shadow(0 0 6px rgba(224, 128, 64, 0.75))",
          "drop-shadow(0 0 14px rgba(224, 128, 64, 0.45))",
        ].join(" "),
      }}
    />
  );
}

export function ResilientIcon({ className }: { className?: string }) {
  return (
    <img
      src="/logo.png"
      alt="Resilium"
      className={className}
      style={{
        filter:
          "invert(58%) sepia(58%) saturate(700%) hue-rotate(334deg) brightness(97%) contrast(97%)",
      }}
    />
  );
}

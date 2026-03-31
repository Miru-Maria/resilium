import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-6"
      style={{ background: "#0D1225" }}
    >
      <AlertTriangle className="w-14 h-14 mb-6" style={{ color: "#E08040" }} />

      <p
        className="text-sm font-semibold tracking-widest uppercase mb-3"
        style={{ color: "#E08040", letterSpacing: "0.18em" }}
      >
        404
      </p>

      <h1
        className="text-4xl font-black text-center mb-4"
        style={{ color: "#EAD9BE", fontFamily: "var(--font-display, 'Plus Jakarta Sans', sans-serif)" }}
      >
        Page not found
      </h1>

      <p
        className="text-center text-base max-w-sm mb-10"
        style={{ color: "#8A7A6A", lineHeight: 1.7 }}
      >
        The page you're looking for doesn't exist or has been moved. Head back home to check your resilience score.
      </p>

      <Link href="/">
        <Button
          size="lg"
          className="rounded-full gap-2"
          style={{ background: "#E08040", color: "#0D1225", fontWeight: 700 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resilium
        </Button>
      </Link>
    </div>
  );
}

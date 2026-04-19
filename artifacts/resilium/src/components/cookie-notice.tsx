import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { X } from "lucide-react";

const STORAGE_KEY = "resilium_cookie_notice_v1";

const EXCLUDED_PATHS = ["/admin", "/consent", "/sign-in", "/sign-up"];

export function CookieNotice() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const excluded = EXCLUDED_PATHS.some(p => location.startsWith(p));
    if (excluded) {
      setVisible(false);
      return;
    }
    try {
      setVisible(!localStorage.getItem(STORAGE_KEY));
    } catch {
      setVisible(true);
    }
  }, [location]);

  const dismiss = () => {
    setVisible(false);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-2xl mx-auto bg-card/95 backdrop-blur border border-border rounded-2xl shadow-xl px-5 py-4 flex items-center gap-4 pointer-events-auto">
        <p className="flex-1 text-sm text-muted-foreground leading-relaxed">
          Resilium uses essential cookies for login and session security only — no tracking or advertising.{" "}
          <Link
            href="/privacy"
            className="text-primary underline-offset-2 hover:underline font-medium"
          >
            Privacy Policy
          </Link>
        </p>
        <button
          onClick={dismiss}
          className="shrink-0 text-sm font-semibold text-foreground bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
        >
          Got it
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss cookie notice"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

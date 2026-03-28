import React from "react";
import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 py-6 px-6 z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Resilium. All rights reserved.</span>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:text-primary underline underline-offset-4 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-primary underline underline-offset-4 transition-colors">
            Terms &amp; Conditions
          </Link>
          <Link href="/refund" className="hover:text-primary underline underline-offset-4 transition-colors">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

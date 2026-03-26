import React from "react";
import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 py-6 px-6 z-10">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>&copy; {new Date().getFullYear()} Resilium. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/about" className="hover:text-primary underline underline-offset-4 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-primary underline underline-offset-4 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { Link } from "wouter";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/60 py-6 px-6 z-10">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-sm text-muted-foreground">
        <a
          href="https://www.producthunt.com/products/resilium-score-your-preparedness/reviews/new?utm_source=badge-product_review&utm_medium=badge&utm_source=badge-resilium&#0045;score&#0045;your&#0045;preparedness"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="https://api.producthunt.com/widgets/embed-image/v1/product_review.svg?product_id=1214726&theme=dark"
            alt="Resilium – Score Your Preparedness | Product Hunt"
            style={{ width: 200, height: 43 }}
            width="200"
            height="43"
          />
        </a>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <span>&copy; {new Date().getFullYear()} Resilium. All rights reserved. Operated by Resilium SRL.</span>
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
      </div>
    </footer>
  );
}

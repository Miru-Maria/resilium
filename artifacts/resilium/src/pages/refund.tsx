import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";

const LAST_UPDATED = "March 27, 2026";
const CONTACT_EMAIL = "contact_resilium@pm.me";

export default function RefundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full py-6 px-6 lg:px-12 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-3">Refund Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          We want you to be satisfied with Resilium. This Refund Policy explains when and how you can request a refund for a paid subscription.
        </p>

        <Section title="1. Free Starter Plan">
          <p>
            The Starter plan is free and does not involve any charges. No refunds are applicable for the free tier.
          </p>
        </Section>

        <Section title="2. Pro Subscription — 14-Day Refund Window">
          <p>
            If you are not satisfied with your Pro subscription, you may request a full refund within <strong>14 days</strong> of your initial purchase date. This applies to both monthly and annual plans.
          </p>
          <p>
            After 14 days from the initial purchase, subscriptions are non-refundable. Renewals (monthly or annual) are also non-refundable once they have been processed.
          </p>
        </Section>

        <Section title="3. Annual Plan — Early Cancellation">
          <p>
            If you subscribed to an annual plan and wish to cancel before the renewal date, you will retain access to Pro features until the end of your paid period. Annual subscriptions are not prorated — we do not issue partial refunds for unused months after the 14-day window has passed.
          </p>
          <p>
            If you are within the 14-day refund window, you may request a full refund regardless of how much of the annual period has been used.
          </p>
        </Section>

        <Section title="4. How to Request a Refund">
          <p>
            To request a refund, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
            {" "}with the following information:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>The email address associated with your Resilium account</li>
            <li>The date of your subscription purchase</li>
            <li>The reason for your refund request (optional but helpful)</li>
          </ul>
          <p>
            We will respond within 5 business days. Approved refunds are processed back to your original payment method via Paddle, our payment processor, and typically appear within 5–10 business days depending on your bank.
          </p>
        </Section>

        <Section title="5. Exceptional Circumstances">
          <p>
            We review refund requests outside the standard 14-day window on a case-by-case basis. If you experienced a technical issue that prevented you from using the service, or if there were exceptional circumstances, please contact us and we will do our best to find a fair resolution.
          </p>
        </Section>

        <Section title="6. Consumer Rights (EU / UK)">
          <p>
            If you are based in the European Union or the United Kingdom, you may have additional statutory rights under consumer protection legislation, including the EU Consumer Rights Directive and the UK Consumer Contracts Regulations 2013.
          </p>
          <p>
            In particular, EU and UK consumers generally have a right of withdrawal within 14 days of purchasing a digital service. However, this right may be waived if you have explicitly consented to the immediate supply of a digital service and acknowledged that the right of withdrawal is forfeited once the service has been fully delivered.
          </p>
          <p>
            Regardless of the above, Resilium honours a 14-day full refund window for all customers, consistent with these consumer protection standards.
          </p>
        </Section>

        <Section title="7. Chargebacks">
          <p>
            Filing a chargeback dispute with your bank or card provider without first contacting us for a resolution is a violation of our Terms and Conditions and may result in the suspension of your account. We ask that you contact us first — we are committed to resolving issues fairly and promptly.
          </p>
        </Section>

        <div className="pt-4 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Questions about refunds? Contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-display font-bold">{title}</h2>
      <div className="space-y-3 text-foreground/80 leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold">
        {children}
      </div>
    </section>
  );
}

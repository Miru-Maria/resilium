import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";

const LAST_UPDATED = "March 24, 2026";
const CONTACT_EMAIL = "contact_resilium@pm.me";

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-display font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Resilium is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what information is collected, how it is used, and what rights you have under applicable data protection laws including the General Data Protection Regulation (GDPR).
        </p>

        <Section title="1. Who Is Responsible for Your Data">
          <p>
            Resilium is an independent platform operated by a sole individual. Resilium acts as the <strong>data controller</strong> for the personal data you provide when using this service.
          </p>
          <p>
            If you have any questions about this policy or your data, you can reach me at:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

        <Section title="2. Data Collected">
          <p>When you complete the Resilium resilience assessment, the following information is collected:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Geographic location (country or region)</li>
            <li>Income stability category</li>
            <li>Approximate savings runway (in months)</li>
            <li>Whether you have financial or physical dependents</li>
            <li>Self-reported practical skills</li>
            <li>General health status and mobility level</li>
            <li>Housing situation</li>
            <li>Emergency preparedness status</li>
            <li>Self-rated psychological resilience</li>
            <li>Primary risk concerns selected by you</li>
            <li>Preferred currency (USD, EUR, or RON) for contextual advice</li>
          </ul>
          <p>
            Resilium does not collect your name, email address, government ID, precise address, or financial account details as part of the assessment. Technical data such as browser type, device type, and IP address may be collected for security and performance purposes.
          </p>
        </Section>

        <Section title="3. How Your Data Is Used">
          <p>Your data is processed for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>To provide the service:</strong> Generating your personalized resilience report and action plan.</li>
            <li><strong>To improve the platform:</strong> Analyzing aggregated, anonymized usage patterns to improve accuracy of the models and recommendations.</li>
            <li><strong>For security and fraud prevention:</strong> Detecting and preventing misuse of the platform.</li>
          </ul>
          <p>Your data is not used for advertising and is not sold to third parties.</p>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <p>Resilium relies on the following legal bases under applicable data protection law:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Performance of a contract:</strong> Processing is necessary to generate your resilience report as requested.</li>
            <li><strong>Legitimate interests:</strong> There is a legitimate interest in maintaining platform security and improving the service, provided this does not override your rights.</li>
            <li><strong>Consent:</strong> Where health-related information is processed (e.g., health status), this relies on your explicit consent provided by voluntarily completing the assessment.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            Your assessment data is stored for <strong>12 months</strong> from the date of submission, after which it is automatically and permanently deleted. Anonymized and aggregated statistics derived from your data may be retained indefinitely for research and improvement purposes.
          </p>
          <p>
            Anonymous assessments (completed without signing in) are deleted after <strong>30 days</strong> if not claimed by a user account. You may request deletion of your data at any time — see the "Your Rights" section below.
          </p>
        </Section>

        <Section title="6. Third-Party Sharing">
          <p>
            Your personal data is not sold, rented, or shared with third parties for their own marketing or commercial purposes.
          </p>
          <p>Data may be shared with carefully vetted sub-processors who help operate the service, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Cloud infrastructure providers</strong> (hosting and database services)</li>
            <li><strong>AI model providers</strong> used to generate report content (data is transmitted securely and not used to train third-party models)</li>
          </ul>
          <p>
            All sub-processors are bound by data processing agreements and must comply with applicable data protection requirements. Data may also be disclosed if required by law or to protect the rights and safety of users or the public.
          </p>
        </Section>

        <Section title="7. International Transfers">
          <p>
            If any sub-processors are located outside your country of residence, appropriate safeguards are in place — such as Standard Contractual Clauses (SCCs) — to protect your data during transfer and storage.
          </p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your jurisdiction, you may have the following rights regarding your personal data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of access:</strong> You can request a copy of the personal data Resilium holds about you.</li>
            <li><strong>Right to rectification:</strong> You can request correction of inaccurate or incomplete data.</li>
            <li><strong>Right to erasure:</strong> You can request deletion of your personal data ("right to be forgotten").</li>
            <li><strong>Right to data portability:</strong> You can request your data in a structured, machine-readable format.</li>
            <li><strong>Right to object:</strong> You can object to processing based on legitimate interests.</li>
            <li><strong>Right to restrict processing:</strong> You can request a pause on processing of your data in certain circumstances.</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p>
            To exercise any of these rights, contact me at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
            . I will respond within 30 days. You also have the right to lodge a complaint with your national or regional data protection authority.
          </p>
        </Section>

        <Section title="9. Cookies and Tracking">
          <p>
            Resilium uses only essential cookies required for the platform to function (e.g., session management). No tracking or advertising cookies are used. No third-party analytics scripts are embedded that would track you across websites.
          </p>
        </Section>

        <Section title="10. Data Security">
          <p>
            Appropriate technical and organizational measures are in place to protect your data, including encryption in transit (TLS), access controls, and regular security reviews. In the unlikely event of a data breach that poses a risk to your rights and freedoms, you will be notified along with the relevant supervisory authority as required by applicable law.
          </p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>
            Resilium is not directed at children under the age of 16. Personal data from minors is not knowingly collected. If you believe a minor has provided their data through this platform, please contact me immediately at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            This Privacy Policy may be updated from time to time. When changes are made, the "Last updated" date at the top of this page will reflect that. I encourage you to review this page periodically. Continued use of the service after changes constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <div className="pt-4 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Questions? Contact me at{" "}
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

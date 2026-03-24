import React from "react";
import { Link } from "wouter";
import { SiteFooter } from "@/components/site-footer";
import { ResilientIcon } from "@/components/resilient-icon";

const LAST_UPDATED = "March 24, 2026";
const DPO_EMAIL = "privacy@resilium.app";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="w-full py-6 px-6 lg:px-12 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <ResilientIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 space-y-10">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          Resilium ("we", "us", or "our") is committed to protecting your personal data and respecting your privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have under the General Data Protection Regulation (GDPR) and other applicable data protection laws.
        </p>

        <Section title="1. Who We Are">
          <p>
            Resilium is operated by Resilium Ltd., a company registered in the European Union. We act as the <strong>data controller</strong> for the personal data you provide when using this service.
          </p>
          <p>
            If you have any questions about this policy or your data, you can reach our Data Protection Officer (DPO) at:{" "}
            <a href={`mailto:${DPO_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {DPO_EMAIL}
            </a>
          </p>
        </Section>

        <Section title="2. Data We Collect">
          <p>When you complete the Resilium resilience assessment, we collect the following information:</p>
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
          </ul>
          <p>
            We do not collect your name, email address, government ID, precise address, or financial account details as part of the assessment. We may collect technical data such as browser type, device type, and IP address for security and performance purposes.
          </p>
        </Section>

        <Section title="3. How We Use Your Data">
          <p>We process your data for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>To provide the service:</strong> Generating your personalised resilience report and action plan.</li>
            <li><strong>To improve the platform:</strong> Analysing aggregated, anonymised usage patterns to improve accuracy of our models and recommendations.</li>
            <li><strong>For security and fraud prevention:</strong> Detecting and preventing misuse of the platform.</li>
          </ul>
          <p>We do not use your data for advertising or sell it to third parties.</p>
        </Section>

        <Section title="4. Legal Basis for Processing">
          <p>We rely on the following legal bases under Article 6 GDPR:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Performance of a contract (Art. 6(1)(b)):</strong> Processing is necessary to generate your resilience report as requested.</li>
            <li><strong>Legitimate interests (Art. 6(1)(f)):</strong> We have a legitimate interest in maintaining platform security and improving our services, provided this does not override your rights.</li>
            <li><strong>Consent (Art. 6(1)(a)):</strong> Where we process health-related information (e.g., health status), we rely on your explicit consent provided by voluntarily completing the assessment.</li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>
            Your assessment data is stored for <strong>12 months</strong> from the date of submission, after which it is automatically and permanently deleted. Anonymised and aggregated statistics derived from your data may be retained indefinitely for research and improvement purposes.
          </p>
          <p>
            You may request deletion of your data at any time — see the "Your Rights" section below.
          </p>
        </Section>

        <Section title="6. Third-Party Sharing">
          <p>
            We do not sell, rent, or share your personal data with third parties for their own marketing or commercial purposes.
          </p>
          <p>We may share data with carefully vetted sub-processors who help us operate the service, including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Cloud infrastructure providers</strong> (hosting and database services)</li>
            <li><strong>AI model providers</strong> used to generate report content (data is transmitted securely and not used to train third-party models)</li>
          </ul>
          <p>
            All sub-processors are bound by data processing agreements and must comply with GDPR requirements. We may also disclose data if required by law or to protect the rights and safety of users or the public.
          </p>
        </Section>

        <Section title="7. International Transfers">
          <p>
            If any of our sub-processors are located outside the European Economic Area (EEA), we ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission, to protect your data during transfer.
          </p>
        </Section>

        <Section title="8. Your Rights Under GDPR">
          <p>As a data subject, you have the following rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right of access (Art. 15):</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Right to rectification (Art. 16):</strong> You can ask us to correct inaccurate or incomplete data.</li>
            <li><strong>Right to erasure (Art. 17):</strong> You can request that we delete your personal data ("right to be forgotten").</li>
            <li><strong>Right to data portability (Art. 20):</strong> You can request your data in a structured, machine-readable format.</li>
            <li><strong>Right to object (Art. 21):</strong> You can object to processing based on legitimate interests.</li>
            <li><strong>Right to restrict processing (Art. 18):</strong> You can ask us to pause processing of your data in certain circumstances.</li>
            <li><strong>Right to withdraw consent:</strong> Where processing is based on consent, you may withdraw it at any time without affecting the lawfulness of prior processing.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${DPO_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {DPO_EMAIL}
            </a>
            . We will respond within 30 days. You also have the right to lodge a complaint with your national data protection supervisory authority.
          </p>
        </Section>

        <Section title="9. Cookies and Tracking">
          <p>
            Resilium uses only essential cookies required for the platform to function (e.g., session management). We do not use tracking or advertising cookies. No third-party analytics scripts are embedded that would track you across websites.
          </p>
        </Section>

        <Section title="10. Data Security">
          <p>
            We implement appropriate technical and organisational measures to protect your data, including encryption in transit (TLS), access controls, and regular security reviews. In the unlikely event of a data breach that poses a risk to your rights and freedoms, we will notify you and the relevant supervisory authority as required by GDPR.
          </p>
        </Section>

        <Section title="11. Children's Privacy">
          <p>
            Resilium is not directed at children under the age of 16. We do not knowingly collect personal data from minors. If you believe a minor has provided us with their data, please contact us immediately at{" "}
            <a href={`mailto:${DPO_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {DPO_EMAIL}
            </a>
            .
          </p>
        </Section>

        <Section title="12. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this page periodically. Continued use of the service after changes constitutes your acceptance of the updated policy.
          </p>
        </Section>

        <div className="pt-4 border-t border-border/60">
          <p className="text-sm text-muted-foreground">
            Questions? Contact our DPO at{" "}
            <a href={`mailto:${DPO_EMAIL}`} className="text-primary underline underline-offset-4 hover:text-primary/80">
              {DPO_EMAIL}
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

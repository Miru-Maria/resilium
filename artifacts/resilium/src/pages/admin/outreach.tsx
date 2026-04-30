import React, { useState, useMemo } from "react";
import AdminLayout from "./layout";
import { Mail, Send, CheckCircle, XCircle, AlertCircle, Loader2, Building2, User, Pencil } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

type Recipient = { name: string | null; email: string; domain: string; isBusinessDomain: boolean };
type SendResult = { email: string; status: "sent" | "failed"; error?: string };

const FREE_DOMAINS = new Set([
  "gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com","proton.me",
  "protonmail.com","me.com","aol.com","live.com","msn.com","ymail.com",
  "mail.com","gmx.com","zoho.com","pm.me","fastmail.com","hey.com",
  "inbox.com","tutanota.com","rocketmail.com","att.net","verizon.net",
]);

function parseRecipients(raw: string): Recipient[] {
  const lines = raw.split("\n").map(l => l.trim()).filter(Boolean);
  const out: Recipient[] = [];
  for (const line of lines) {
    // Formats: "Name, email", "email", "Name <email>", "email, Name"
    let name: string | null = null;
    let email = "";

    const angleBracket = line.match(/^(.+?)\s*<([^>]+)>/);
    if (angleBracket) {
      name = angleBracket[1].trim() || null;
      email = angleBracket[2].trim().toLowerCase();
    } else if (line.includes(",")) {
      const parts = line.split(",").map(p => p.trim());
      const emailPart = parts.find(p => p.includes("@"));
      const namePart = parts.find(p => !p.includes("@"));
      email = emailPart?.toLowerCase() ?? "";
      name = namePart ?? null;
    } else if (line.includes("@")) {
      email = line.toLowerCase();
    }

    if (!email || !email.includes("@")) continue;
    // Skip duplicates
    if (out.some(r => r.email === email)) continue;

    const domain = email.split("@")[1] ?? "";
    const isBusinessDomain = !!domain && !FREE_DOMAINS.has(domain);
    // Clean up name: remove quotes, extra spaces
    if (name) name = name.replace(/['"]/g, "").trim() || null;
    // Extract first name only
    if (name && name.includes(" ")) name = name.split(" ")[0];
    out.push({ name, email, domain, isBusinessDomain });
  }
  return out;
}

const DEFAULT_SUBJECT = "One question from the founder of Resilium";
const DEFAULT_BODY = `Hi [Name],

You signed up for Resilium yesterday — thank you for being there on day one.

I'm Miruna, the person who built it. I wanted to reach out personally while everything is still fresh.

One question: What made you sign up?

You don't have to answer. But if something about the idea resonated — or if you had a concern — I read every reply. It genuinely helps me understand what I'm building for.

If you haven't taken the assessment yet, it takes about 10 minutes. You'll get a real, prioritized action plan — not a quiz result, but a ranked set of actions based on exactly where your gaps are.

→ https://resilium-platform.com

Thank you for being here.

— Miruna
Resilium`;

export default function AdminOutreachPage() {
  const [raw, setRaw] = useState("");
  const [emailSubject, setEmailSubject] = useState(DEFAULT_SUBJECT);
  const [emailBody, setEmailBody] = useState(DEFAULT_BODY);
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recipients = useMemo(() => parseRecipients(raw), [raw]);
  const businessEmails = recipients.filter(r => r.isBusinessDomain);
  const freeEmails = recipients.filter(r => !r.isBusinessDomain);

  const domainGroups = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of businessEmails) {
      map[r.domain] = (map[r.domain] ?? 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [businessEmails]);

  async function handleSend() {
    if (!confirmed || recipients.length === 0) return;
    setSending(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`${BASE}/api/admin/send-founder-outreach`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: recipients.map(r => ({ name: r.name, email: r.email })),
          customSubject: emailSubject.trim() || DEFAULT_SUBJECT,
          customBody: emailBody.trim() || DEFAULT_BODY,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? `Server error ${res.status}`);
        return;
      }
      const data = await res.json();
      setResults(data.results ?? []);
    } catch (err) {
      setError(String(err));
    } finally {
      setSending(false);
      setConfirmed(false);
    }
  }

  const sent = results?.filter(r => r.status === "sent").length ?? 0;
  const failed = results?.filter(r => r.status === "failed").length ?? 0;

  return (
    <AdminLayout>
      <div className="p-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#EAD9BE" }}>Founder Outreach</h1>
          </div>
          <p className="text-sm" style={{ color: "#8A7A6A" }}>
            Send the T+24h personal founder email to launch day signups. Paste the Clerk export below, review, then send.
          </p>
        </div>

        {/* Editable email content */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Email Content</span>
            <Pencil className="w-3 h-3 text-primary" />
            <span className="text-xs" style={{ color: "#8A7A6A" }}>— edit freely, use [Name] where the first name should go</span>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "#8A7A6A" }}>Subject line</label>
            <input
              type="text"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ color: "#EAD9BE" }}
            />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1" style={{ color: "#8A7A6A" }}>Body</label>
            <textarea
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              className="w-full h-72 px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary leading-relaxed"
              style={{ color: "#EAD9BE" }}
            />
          </div>
          <button
            className="text-xs underline underline-offset-2"
            style={{ color: "#8A7A6A" }}
            onClick={() => { setEmailSubject(DEFAULT_SUBJECT); setEmailBody(DEFAULT_BODY); }}
          >
            Reset to default
          </button>
        </div>

        {/* Paste input */}
        <div className="mb-6">
          <label className="text-xs font-bold uppercase tracking-widest text-primary block mb-2">
            Paste Recipients
          </label>
          <p className="text-xs mb-3" style={{ color: "#8A7A6A" }}>
            One per line. Accepted formats: <code className="bg-white/10 px-1 rounded text-primary">email@domain.com</code>, <code className="bg-white/10 px-1 rounded text-primary">First Last, email@domain.com</code>, or <code className="bg-white/10 px-1 rounded text-primary">Name &lt;email@domain.com&gt;</code>
          </p>
          <textarea
            className="w-full h-48 px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 font-mono resize-y focus:outline-none focus:ring-2 focus:ring-primary"
            style={{ color: "#EAD9BE" }}
            placeholder={"John Smith, john@company.com\njane@gmail.com\nAlex <alex@startup.io>"}
            value={raw}
            onChange={e => { setRaw(e.target.value); setResults(null); setConfirmed(false); }}
          />
        </div>

        {/* Parsed recipients analysis */}
        {recipients.length > 0 && !results && (
          <div className="mb-6 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold" style={{ color: "#EAD9BE" }}>{recipients.length}</p>
                <p className="text-[11px] mt-1" style={{ color: "#8A7A6A" }}>Total recipients</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  <p className="text-2xl font-bold text-primary">{businessEmails.length}</p>
                </div>
                <p className="text-[11px]" style={{ color: "#8A7A6A" }}>Business domains</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <User className="w-3.5 h-3.5" style={{ color: "#8A7A6A" }} />
                  <p className="text-2xl font-bold" style={{ color: "#8A7A6A" }}>{freeEmails.length}</p>
                </div>
                <p className="text-[11px]" style={{ color: "#8A7A6A" }}>Free email providers</p>
              </div>
            </div>

            {/* Business domain breakdown — high signal */}
            {domainGroups.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">High-Signal Business Domains</p>
                <p className="text-xs mb-3" style={{ color: "#8A7A6A" }}>These users have company or professional email addresses — worth a personal follow-up if any are well-known companies.</p>
                <div className="flex flex-wrap gap-2">
                  {domainGroups.map(([domain, count]) => (
                    <span key={domain} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-medium">
                      {domain}
                      {count > 1 && <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{count}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recipient list preview */}
            <div className="rounded-xl border border-white/10 overflow-hidden">
              <div className="bg-white/5 px-4 py-2.5 border-b border-white/10">
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8A7A6A" }}>Parsed List</p>
              </div>
              <div className="divide-y divide-white/5 max-h-60 overflow-y-auto">
                {recipients.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.isBusinessDomain ? "bg-primary" : "bg-white/20"}`} />
                    <span className="text-sm flex-1 truncate" style={{ color: "#EAD9BE" }}>
                      {r.name && <span className="font-medium">{r.name} </span>}
                      <span style={{ color: "#8A7A6A" }}>{r.email}</span>
                    </span>
                    {r.isBusinessDomain && (
                      <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">business</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm + send */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm" style={{ color: "#EAD9BE" }}>
                  I confirm I want to send the founder outreach email to <strong className="text-primary">{recipients.length} recipients</strong>. Each person will receive exactly one email. This cannot be undone.
                </span>
              </label>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              disabled={!confirmed || sending}
              onClick={handleSend}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-40"
              style={{ background: "#E08040", color: "#0D1225" }}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending… this may take a moment
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to {recipients.length} {recipients.length === 1 ? "person" : "people"}
                </>
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-400">{sent}</p>
                <p className="text-xs text-green-300 mt-0.5">Sent successfully</p>
              </div>
              <div className={`rounded-xl p-4 text-center border ${failed > 0 ? "bg-red-900/20 border-red-500/30" : "bg-white/5 border-white/10"}`}>
                <XCircle className={`w-6 h-6 mx-auto mb-1 ${failed > 0 ? "text-red-400" : "text-white/20"}`} />
                <p className={`text-2xl font-bold ${failed > 0 ? "text-red-400" : "text-white/30"}`}>{failed}</p>
                <p className={`text-xs mt-0.5 ${failed > 0 ? "text-red-300" : "text-white/30"}`}>Failed</p>
              </div>
            </div>

            {failed > 0 && (
              <div className="rounded-xl border border-red-500/20 overflow-hidden">
                <div className="bg-red-900/10 px-4 py-2.5 border-b border-red-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400">Failed Sends</p>
                </div>
                <div className="divide-y divide-white/5">
                  {results.filter(r => r.status === "failed").map((r, i) => (
                    <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                      <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      <span className="text-sm text-red-300 flex-1">{r.email}</span>
                      {r.error && <span className="text-xs text-red-500 truncate max-w-[200px]">{r.error}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setRaw(""); setResults(null); setConfirmed(false); }}
              className="w-full py-2.5 rounded-xl border border-white/10 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: "#EAD9BE" }}
            >
              Send another batch
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

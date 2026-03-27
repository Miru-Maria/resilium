import React, { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutDashboard, Smartphone, Shield, LogOut, FlaskConical, Users, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResilientIcon } from "@/components/resilient-icon";

interface AdminLayoutProps {
  children: React.ReactNode;
  activeSection?: "dashboard" | "mobile" | "gdpr" | "consent" | "ux-testing" | "users" | "announcements";
}

export function getAdminToken(): string | null {
  return localStorage.getItem("admin_token");
}

export function adminAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function AdminLayout({ children, activeSection }: AdminLayoutProps) {
  const [, navigate] = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate("/admin/login");
      setChecking(false);
      return;
    }
    fetch("/api/admin/session", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setAuthed(true);
        } else {
          localStorage.removeItem("admin_token");
          navigate("/admin/login");
        }
      })
      .catch(() => navigate("/admin/login"))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogout() {
    localStorage.removeItem("admin_token");
    await fetch("/api/admin/logout", { method: "POST" });
    navigate("/admin/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authed) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
    { href: "/admin/users", label: "Users", icon: Users, key: "users" },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone, key: "announcements" },
    { href: "/admin/mobile", label: "Mobile", icon: Smartphone, key: "mobile" },
    { href: "/admin/gdpr", label: "GDPR", icon: Shield, key: "gdpr" },
    { href: "/admin/consent-log", label: "Consent Log", icon: Shield, key: "consent" },
    { href: "/admin/ux-testing", label: "AI UX Tester", icon: FlaskConical, key: "ux-testing" },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-56 min-h-screen bg-background border-r flex flex-col">
        <div className="p-4 border-b flex items-center gap-2 cursor-pointer" onClick={() => navigate("/admin/dashboard")}>
          <ResilientIcon className="w-7 h-7" />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-sm tracking-tight">Resilium</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Admin</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <Link key={item.key} href={item.href}>
              <span
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors",
                  activeSection === item.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

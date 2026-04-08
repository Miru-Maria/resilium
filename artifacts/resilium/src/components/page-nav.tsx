import React from "react";
import { Link } from "wouter";
import { useAuth, useClerk } from "@clerk/react";
import { ResilientIcon } from "@/components/resilient-icon";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface PageNavProps {
  cta?: React.ReactNode;
}

export function PageNav({ cta }: PageNavProps) {
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();

  return (
    <header className="w-full px-6 py-5 flex items-center justify-between border-b border-border/40">
      <Link href="/">
        <span className="flex items-center gap-2 cursor-pointer">
          <ResilientIcon className="w-7 h-7" />
          <span className="font-display font-bold text-xl tracking-tight text-primary">Resilium</span>
        </span>
      </Link>
      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5">
              <User className="w-3.5 h-3.5" />
              My Profile
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => openSignIn({})}
          >
            Sign In
          </Button>
        )}
        {cta}
      </div>
    </header>
  );
}

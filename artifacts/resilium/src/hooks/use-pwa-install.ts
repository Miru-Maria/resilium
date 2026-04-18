import { useEffect, useState, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface UsePwaInstallResult {
  isInstallable: boolean;
  triggerInstall: () => Promise<void>;
  dismiss: () => void;
}

export function usePwaInstall(): UsePwaInstallResult {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("pwa_install_dismissed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    setPromptEvent(null);
    if (outcome === "dismissed") {
      setDismissed(true);
      try {
        sessionStorage.setItem("pwa_install_dismissed", "1");
      } catch {
        // ignore
      }
    }
  }, [promptEvent]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      sessionStorage.setItem("pwa_install_dismissed", "1");
    } catch {
      // ignore
    }
  }, []);

  return {
    isInstallable: !!promptEvent && !dismissed,
    triggerInstall,
    dismiss,
  };
}

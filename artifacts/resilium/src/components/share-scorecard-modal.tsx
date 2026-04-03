import React, { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";
import { Download, Copy, X, Loader2, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScorecardImage } from "@/components/scorecard-image";
import { useToast } from "@/hooks/use-toast";

interface ScoreObj {
  overall: number;
  financial: number;
  health: number;
  skills: number;
  mobility: number;
  psychological: number;
  resources: number;
}

interface MentalResilienceProfile {
  pathway: "growth" | "compensation";
  composite: number;
}

interface ShareScorecardModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: ScoreObj;
  overallLabel: string;
  mentalResilienceProfile?: MentalResilienceProfile;
}

export function ShareScorecardModal({
  isOpen,
  onClose,
  score,
  overallLabel,
  mentalResilienceProfile,
}: ShareScorecardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateImage = useCallback(async (): Promise<string | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 1,
        skipAutoScale: true,
        cacheBust: true,
      });
      return dataUrl;
    } catch (err) {
      toast({
        title: "Image generation failed",
        description: "Could not generate scorecard. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGenerating(false);
    }
  }, [toast]);

  const handleDownload = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "resilium-scorecard.png";
    a.click();
    toast({ title: "Downloaded!", description: "Your scorecard image has been saved." });
  }, [generateImage, toast]);

  const handleCopy = useCallback(async () => {
    const dataUrl = await generateImage();
    if (!dataUrl) return;
    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      toast({ title: "Copied!", description: "Scorecard image copied to clipboard." });
    } catch {
      toast({
        title: "Copy failed",
        description: "Your browser may not support copying images. Try downloading instead.",
        variant: "destructive",
      });
    }
  }, [generateImage, toast]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-3xl shadow-2xl max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg">Share Your Score</h2>
            <p className="text-muted-foreground text-sm">Download or copy your branded scorecard</p>
          </div>
        </div>

        {/* Preview (scaled down) */}
        <div
          className="relative w-full rounded-2xl overflow-hidden mb-5"
          style={{ aspectRatio: "1 / 1" }}
        >
          <div
            style={{
              transform: "scale(0.3704)",
              transformOrigin: "top left",
              width: 1080,
              height: 1080,
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "none",
            }}
          >
            <ScorecardImage
              ref={cardRef}
              score={score}
              overallLabel={overallLabel}
              mentalResilienceProfile={mentalResilienceProfile}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 rounded-full gap-2"
            onClick={handleDownload}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {generating ? "Generating…" : "Download PNG"}
          </Button>
          <Button
            variant="outline"
            className="flex-1 rounded-full gap-2"
            onClick={handleCopy}
            disabled={generating}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy Image"}
          </Button>
        </div>
      </div>
    </div>
  );
}

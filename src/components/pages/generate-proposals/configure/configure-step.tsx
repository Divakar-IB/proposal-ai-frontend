"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Sparkles,
  Settings2,
  Brain,
  Database,
  Minus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Button, Card } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { GenerationMode } from "@/types";

interface ConfigureStepProps {
  proposalId: string;
}

interface ModeOption {
  id: GenerationMode;
  label: string;
  description: string;
  icon: LucideIcon;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    id: "llm_only",
    label: "AI Only",
    description: "Generate directly from the uploaded RFP using AI reasoning alone.",
    icon: Brain,
  },
  {
    id: "knowledge_augmented",
    label: "AI + Knowledge Base",
    description: "Enrich the proposal with your company's past work, case studies, and tech docs.",
    icon: Database,
  },
];

const PAGE_PRESETS = [5, 10, 15, 20];

const ConfigureStep = ({ proposalId }: ConfigureStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  const [mode, setMode] = useState<GenerationMode>("llm_only");
  const [pageCount, setPageCount] = useState(10);
  const syncedRef = useRef(false);

  const { data: stateData, isLoading } = useQuery({
    queryKey: ["proposal-state", proposalId],
    queryFn: () => proposalService.getProposalState(proposalId),
    staleTime: 30_000,
    retry: 1,
  });

  useEffect(() => {
    if (stateData?.generation_config && !syncedRef.current) {
      syncedRef.current = true;
      setMode(stateData.generation_config.generation_mode);
      setPageCount(stateData.generation_config.page_count);
    }
  }, [stateData]);

  const adjustPage = (delta: number) => {
    setPageCount((prev) => Math.min(50, Math.max(1, prev + delta)));
  };

  const handleGenerate = () => {
    markStepComplete(2);
    router.push(`/all-proposals/generate-proposals/${proposalId}/generate`);
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto py-8 px-8 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-3 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-muted/20 animate-pulse" />
          ))}
        </div>
        <div className="h-10 w-64 bg-muted rounded animate-pulse" />
      </Card>
    );
  }

  return (
    <Card className="max-w-6xl mx-auto py-8 px-8 flex flex-col gap-8">
      <StepHeader
        icon={Settings2}
        title="Configure generation"
        description="Choose how the proposal should be generated and how detailed it should be"
        step={2}
      />

      {/* Generation mode */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Generation mode</p>
        <div className="grid grid-cols-2 gap-3">
          {MODE_OPTIONS.map((opt) => {
            const OptIcon = opt.icon;
            const selected = mode === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMode(opt.id)}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-5 text-left transition-colors",
                  selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                    selected ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <OptIcon className={cn("w-5 h-5", selected ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex flex-col gap-1">
                  <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
                    {opt.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page count */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Number of pages</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-0 rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => adjustPage(-1)}
              disabled={pageCount <= 1}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="w-12 h-9 flex items-center justify-center border-x border-border">
              <span className="text-sm font-semibold text-foreground tabular-nums">{pageCount}</span>
            </div>
            <button
              type="button"
              onClick={() => adjustPage(1)}
              disabled={pageCount >= 50}
              className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:bg-muted/50 disabled:opacity-40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {PAGE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPageCount(p)}
                className={cn(
                  "h-9 px-4 rounded-lg border text-sm font-medium transition-colors",
                  pageCount === p
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">pages · max 50</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(`/all-proposals/generate-proposals/new`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button type="button" onClick={handleGenerate}>
          <Sparkles className="w-4 h-4" />
          Generate proposal
        </Button>
      </div>
    </Card>
  );
};

export default ConfigureStep;

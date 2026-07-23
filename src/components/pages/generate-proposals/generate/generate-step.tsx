"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, ChevronRight, ArrowLeft, ChevronDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Markdown } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";

interface GenerateStepProps {
  proposalId: string;
}

type SectionStatus = "queued" | "generating" | "done";

interface SectionState {
  name: string;
  status: SectionStatus;
  content: string;
}

type GenerateMode = "loading" | "streaming" | "done" | "failed";

const GenerateStep = ({ proposalId }: GenerateStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  const [streamSections, setStreamSections] = useState<SectionState[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isStreamDone, setIsStreamDone] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const toggleExpanded = (name: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const { data: stateData, isLoading: isLoadingState } = useQuery({
    queryKey: ["proposal-state", proposalId],
    queryFn: () => proposalService.getProposalState(proposalId),
    staleTime: 0,
    retry: 1,
  });

  const genStatus = stateData?.generation?.status;

  const mode: GenerateMode = isLoadingState
    ? "loading"
    : genStatus === "done"
    ? "done"
    : genStatus === "failed"
    ? "failed"
    : "streaming";

  const { data: sectionsResponse, isLoading: isLoadingSections } = useQuery({
    queryKey: ["proposal-sections", proposalId],
    queryFn: () => proposalService.getProposalSections(proposalId),
    enabled: mode === "done",
    staleTime: Infinity,
  });

  const displaySections = useMemo<SectionState[]>(() => {
    if (mode === "done" && sectionsResponse) {
      return [...sectionsResponse.sections]
        .sort((a, b) => a.order - b.order)
        .map((s) => ({ name: s.title, status: "done" as const, content: s.content }));
    }
    return streamSections;
  }, [mode, sectionsResponse, streamSections]);

  const isDone = mode === "done" || isStreamDone;

  useEffect(() => {
    if (mode === "done") markStepComplete(3);
  }, [mode, markStepComplete]);

  const generationConfig = stateData?.generation_config ?? null;

  useEffect(() => {
    if (mode !== "streaming") return;
    if (!generationConfig) return;

    const controller = new AbortController();
    abortRef.current = controller;

    proposalService.generateStream(
      {
        proposal_id: proposalId,
        page_count: generationConfig.page_count,
        generation_mode: generationConfig.generation_mode,
      },
      {
        onSectionStart: (name) => {
          setStreamSections((prev) => [...prev, { name, status: "generating", content: "" }]);
          setExpandedSections((prev) => new Set([...prev, name]));
        },
        onSectionChunk: (name, content) => {
          setStreamSections((prev) =>
            prev.map((s) => s.name === name ? { ...s, content: s.content + content } : s)
          );
        },
        onSectionDone: (name) => {
          setStreamSections((prev) =>
            prev.map((s) => s.name === name ? { ...s, status: "done" } : s)
          );
          setExpandedSections((prev) => {
            const next = new Set(prev);
            next.delete(name);
            return next;
          });
        },
        onDone: () => {
          setIsStreamDone(true);
          markStepComplete(3);
        },
        onError: (error) => {
          toast.error("Generation failed. Please go back and try again.");
          console.error(error);
        },
      },
      controller.signal,
    );

    return () => controller.abort();
  }, [mode, proposalId, generationConfig, markStepComplete]);

  const doneCount = displaySections.filter((s) => s.status === "done").length;
  const totalCount = displaySections.length;
  const pct = isDone && totalCount === 0
    ? 100
    : totalCount > 0
    ? Math.round((doneCount / totalCount) * 100)
    : 0;

  const headerTitle =
    mode === "done" ? "Proposal generated"
    : mode === "failed" ? "Generation failed"
    : "Generating your proposal";

  const headerDescription =
    mode === "done"
      ? "All sections have been generated successfully"
      : mode === "failed"
      ? "An error occurred during generation"
      : "AI is drafting your proposal sections — this may take a moment";

  const showSections = mode === "streaming" || mode === "done";
  const showProgress = showSections;
  const showSectionSkeleton =
    displaySections.length === 0 && (mode === "streaming" || (mode === "done" && isLoadingSections));

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={Sparkles}
        title={headerTitle}
        description={headerDescription}
        step={3}
      />

      {mode === "failed" && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            Proposal generation failed. Please go back to configure and try again.
          </p>
        </div>
      )}

      {showProgress && (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isDone
                ? "All sections complete"
                : totalCount === 0
                ? "Starting generation…"
                : `${doneCount} of ${totalCount} sections complete`}
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">{pct}%</span>
          </div>
        </div>
      )}

      {showSections && (
        <div className="flex flex-col gap-3">
          {showSectionSkeleton &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border px-5 py-4">
                <span className="w-2 h-2 rounded-full bg-border shrink-0" />
                <div
                  className="h-3 bg-muted rounded animate-pulse"
                  style={{ width: `${50 + (i % 3) * 15}%` }}
                />
              </div>
            ))}

          {displaySections.map((section) => {
            const isExpanded = expandedSections.has(section.name);
            const isGenerating = section.status === "generating";
            const isDoneSection = section.status === "done";

            return (
              <div
                key={section.name}
                className={cn(
                  "rounded-xl border transition-colors duration-300",
                  isGenerating
                    ? "border-primary/30 bg-primary/2.5"
                    : isDoneSection
                    ? "border-border bg-background"
                    : "border-border bg-muted/20"
                )}
              >
                <button
                  type="button"
                  disabled={!isDoneSection}
                  onClick={() => isDoneSection && toggleExpanded(section.name)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-5 py-4 text-left",
                    isDoneSection && "cursor-pointer"
                  )}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0 transition-colors duration-300",
                      isDoneSection
                        ? "bg-green-500"
                        : isGenerating
                        ? "bg-primary animate-pulse"
                        : "bg-border"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-semibold flex-1 min-w-0 text-left",
                      section.status === "queued" ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {section.name}
                  </span>
                  <span
                    className={cn(
                      "text-[11px] font-medium shrink-0",
                      isDoneSection
                        ? "text-green-600"
                        : isGenerating
                        ? "text-primary"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {isDoneSection ? "Complete" : isGenerating ? "Generating…" : "Queued"}
                  </span>
                  {isDoneSection && (
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </button>

                {section.content && (
                  <div
                    className={cn(
                      "grid transition-all duration-300",
                      isExpanded || isGenerating ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div
                        className={cn(
                          "mx-5 mb-4 rounded-lg px-3 py-2.5",
                          isDoneSection ? "bg-muted/50" : "bg-primary/5"
                        )}
                      >
                        <Markdown className="[&>p]:text-xs [&>ul]:text-xs [&>ol]:text-xs [&>h1]:text-xs [&>h2]:text-xs [&>h3]:text-xs [&>strong]:text-xs">
                          {section.content}
                        </Markdown>
                        {isGenerating && (
                          <span className="inline-block w-0.5 h-3 bg-primary align-middle ml-0.5 animate-pulse" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => {
            abortRef.current?.abort();
            router.push(`/all-proposals/generate-proposals/${proposalId}/configure`);
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          disabled={!isDone}
          onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/review`)}
        >
          Review draft
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default GenerateStep;

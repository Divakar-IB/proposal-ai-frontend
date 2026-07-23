"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, ChevronRight, ArrowLeft, ChevronDown } from "lucide-react";
import { Button, Card, Markdown } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";

interface ReviewStepProps {
  proposalId: string;
}

const wordCount = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

const ReviewStep = ({ proposalId }: ReviewStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposals", proposalId, "detail"],
    queryFn: () => proposalService.getDetail(proposalId),
    enabled: !!proposalId,
  });

  const sections = proposal?.sections ?? [];
  const allExpanded = sections.length > 0 && expandedIds.size === sections.length;

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(sections.map((s) => s.id)));
    }
  };

  const toggleSection = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalWords = sections.reduce((sum, s) => sum + wordCount(s.content), 0);

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={FileText}
        title="Review proposal"
        description="Read through the generated sections before exporting"
        step={4}
      />

      {/* Summary bar */}
      {!isLoading && sections.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-border px-5 py-3.5">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">{sections.length}</span>
              <span className="text-xs text-muted-foreground">Sections</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-primary">{totalWords.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">Words</span>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={toggleAll}>
            {allExpanded ? "Collapse all" : "Expand all"}
          </Button>
        </div>
      )}

      {/* Section list */}
      <div className="flex flex-col gap-3">
        {/* Skeleton */}
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border px-5 py-4 flex items-center gap-3">
              <div
                className="h-3 bg-muted rounded animate-pulse"
                style={{ width: `${45 + (i % 3) * 20}%` }}
              />
            </div>
          ))}

        {sections.map((section) => {
          const isExpanded = expandedIds.has(section.id);
          const words = wordCount(section.content);

          return (
            <div key={section.id} className="rounded-xl border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
              >
                <span className="text-sm font-semibold text-foreground flex-1 min-w-0 truncate">
                  {section.title}
                </span>
                {words > 0 && (
                  <span className="text-xs text-muted-foreground shrink-0">
                    {words.toLocaleString()} words
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300",
                  isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-border px-5 py-4">
                    <Markdown>{section.content}</Markdown>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/generate`)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={() => {
            markStepComplete(4);
            router.push(`/all-proposals/generate-proposals/${proposalId}/export`);
          }}
        >
          Proceed to export
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ReviewStep;

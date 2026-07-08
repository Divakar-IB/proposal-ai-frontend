"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  PenLine,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  AlertTriangle,
  Info,
  FileText,
  RefreshCw,
  Save,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Textarea, Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ProposalSection } from "@/types";

interface ReviewStepProps {
  proposalId: string;
}

type QualityGrade = "excellent" | "good" | "verify" | "flagged";

interface ReviewSection extends ProposalSection {
  quality: QualityGrade;
}

const deriveQuality = (section: ProposalSection): QualityGrade => {
  const name = section.name.toLowerCase();
  if (name.includes("pricing") || name.includes("commercial")) return "flagged";
  if (name.includes("team") || name.includes("organi")) return "verify";
  if ((section.word_count ?? 0) >= 300) return "excellent";
  return "good";
};

const QUALITY_CONFIG: Record<QualityGrade, { label: string; dotClass: string; badgeClass: string }> = {
  excellent: {
    label: "Excellent",
    dotClass: "bg-green-500",
    badgeClass: "bg-green-500/10 text-green-600",
  },
  good: {
    label: "Good",
    dotClass: "bg-green-500",
    badgeClass: "bg-green-500/10 text-green-600",
  },
  verify: {
    label: "Verify",
    dotClass: "bg-blue-500",
    badgeClass: "bg-amber-500/10 text-amber-600",
  },
  flagged: {
    label: "Flagged",
    dotClass: "bg-orange-500",
    badgeClass: "bg-orange-500/10 text-orange-600",
  },
};

const FLAG_CONFIG: Record<"verify" | "flagged", {
  icon: React.ReactNode;
  labelSuffix: string;
  description: string;
  action: string;
  classes: string;
  btnClasses: string;
}> = {
  flagged: {
    icon: <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />,
    labelSuffix: "— needs your input",
    description: "No matching pricing templates in KB. Add cost estimates or a rate card to complete this section.",
    action: "Add pricing",
    classes: "bg-orange-500/5 border-orange-500/20",
    btnClasses: "border-orange-500/30 text-orange-600 hover:bg-orange-500/10",
  },
  verify: {
    icon: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    labelSuffix: "— verify before sending",
    description: "Team credentials sourced from a proposal dated 8 months ago. Confirm roles and certifications are still current.",
    action: "Verify",
    classes: "bg-blue-500/5 border-blue-500/20",
    btnClasses: "border-blue-500/30 text-blue-600 hover:bg-blue-500/10",
  },
};

interface StatCardProps {
  value: string | number;
  label: string;
  valueClass?: string;
}

const StatCard = ({ value, label, valueClass }: StatCardProps) => (
  <div className="flex-1 flex flex-col items-center gap-1 px-4 py-3">
    <span className={cn("text-2xl font-bold", valueClass ?? "text-foreground")}>{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </div>
);

const ReviewStep = ({ proposalId }: ReviewStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  // null = unset (defaults to first section); "" = all collapsed; id = specific section open
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Only tracks user-made edits; falls back to section.content from the query
  const [userEdits, setUserEdits] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState<Record<string, string>>({});
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const { data: rawSections = [] } = useQuery({
    queryKey: ["proposals", proposalId, "sections"],
    queryFn: () => proposalService.getSections(proposalId),
    enabled: !!proposalId,
  });

  const effectiveExpandedId = expandedId === null
    ? (rawSections[0]?.id ?? "")
    : expandedId;

  const sections: ReviewSection[] = rawSections.map((s) => ({
    ...s,
    quality: deriveQuality(s),
  }));

  const { mutate: saveContent, isPending: isSaving } = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      proposalService.updateSection(id, content),
    onSuccess: () => toast.success("Section saved"),
    onError: () => toast.error("Failed to save"),
  });

  const { mutate: regenerateSection } = useMutation({
    mutationFn: ({ section_id, instruction }: { section_id: string; instruction: string }) =>
      proposalService.regenerateSection({ section_id, instruction }),
    onSuccess: (updated) => {
      setUserEdits((prev) => ({ ...prev, [updated.id]: updated.content ?? "" }));
      setInstructions((prev) => ({ ...prev, [updated.id]: "" }));
      setRegeneratingId(null);
      toast.success("Section regenerated");
    },
    onError: () => {
      setRegeneratingId(null);
      toast.error("Regeneration failed");
    },
  });

  const handleRegenerate = (sectionId: string) => {
    setRegeneratingId(sectionId);
    regenerateSection({
      section_id: sectionId,
      instruction: instructions[sectionId] ?? "",
    });
  };

  const flaggedSections = sections.filter(
    (s) => s.quality === "flagged" || s.quality === "verify"
  );
  const totalWords = sections.reduce((a, s) => a + (s.word_count ?? 0), 0);
  const totalKbSources = new Set(sections.flatMap((s) => s.kb_source_ids)).size;

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={PenLine}
        title="Review & refine proposal"
        description={`${sections.length} sections generated · ${flaggedSections.length} need your attention`}
        step={4}
      />

      {/* Stats row */}
      <div className="flex rounded-xl border border-border overflow-hidden divide-x divide-border">
        <StatCard value={sections.length} label="Sections" />
        <StatCard value={totalKbSources} label="KB Sources" valueClass="text-primary" />
        <StatCard value={flaggedSections.length} label="Flags" valueClass="text-orange-500" />
        <StatCard value={totalWords.toLocaleString()} label="Words" valueClass="text-primary" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="gap-0">
        <TabsList variant="line" className="border-b border-border w-full justify-start rounded-none bg-transparent gap-0 pb-0">
          <TabsTrigger value="all">All sections</TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedSections.length})
          </TabsTrigger>
          <TabsTrigger value="sources">KB Sources</TabsTrigger>
        </TabsList>

        {/* All sections + Flagged share the same section list */}
        {(["all", "flagged"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="flex flex-col gap-4 mt-4">
            {/* Flag banners */}
            {(tab === "all" ? flaggedSections : flaggedSections).map((section) => {
              const cfg = FLAG_CONFIG[section.quality as "verify" | "flagged"];
              if (!cfg) return null;
              return (
                <div
                  key={section.id}
                  className={cn("flex items-start justify-between gap-4 rounded-xl border px-4 py-3.5", cfg.classes)}
                >
                  <div className="flex items-start gap-2.5">
                    {cfg.icon}
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {section.name}{" "}
                        <span className={section.quality === "flagged" ? "text-orange-600" : "text-blue-600"}>
                          {cfg.labelSuffix}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {cfg.description}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn("shrink-0 text-xs", cfg.btnClasses)}
                  >
                    {cfg.action}
                  </Button>
                </div>
              );
            })}

            {/* Section accordion */}
            <div className="flex flex-col gap-2">
              {(tab === "flagged" ? flaggedSections : sections).map((section) => {
                const isExpanded = effectiveExpandedId === section.id;
                const quality = QUALITY_CONFIG[section.quality];
                const content = userEdits[section.id] ?? section.content ?? "";
                const isRegen = regeneratingId === section.id;

                return (
                  <div
                    key={section.id}
                    className="rounded-xl border border-border overflow-hidden"
                  >
                    {/* Header row */}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? "" : section.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
                    >
                      <span className={cn("w-2 h-2 rounded-full shrink-0", quality.dotClass)} />
                      <span className="flex-1 text-sm font-semibold text-foreground">
                        {section.name}
                      </span>
                      <span className="text-xs text-muted-foreground mr-2">
                        {section.word_count ?? 0} words
                      </span>
                      <span className={cn("text-[11px] font-semibold px-2.5 py-0.5 rounded-full mr-1", quality.badgeClass)}>
                        {quality.label}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                      )}
                    </button>

                    {/* Expanded body */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {/* Editable content */}
                        <Textarea
                          value={content}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            setUserEdits((prev) => ({ ...prev, [section.id]: e.target.value }))
                          }
                          rows={8}
                          className="rounded-none border-0 border-b border-border resize-none text-sm leading-relaxed focus-visible:ring-0 focus-visible:ring-offset-0"
                        />

                        {/* KB Sources */}
                        {section.kb_source_ids.length > 0 && (
                          <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-wrap">
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              Sources
                            </span>
                            {section.kb_source_ids.map((srcId) => (
                              <span
                                key={srcId}
                                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 border border-border rounded-md px-2 py-1"
                              >
                                <FileText className="w-3 h-3 shrink-0" />
                                {srcId}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Toolbar */}
                        <div className="flex items-center gap-2 px-4 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => saveContent({ id: section.id, content })}
                            loading={isSaving}
                          >
                            <Save className="w-3 h-3" />
                            Save
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs"
                            onClick={() => handleRegenerate(section.id)}
                            loading={isRegen}
                          >
                            <RefreshCw className="w-3 h-3" />
                            Regenerate
                          </Button>
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <input
                              type="text"
                              value={instructions[section.id] ?? ""}
                              onChange={(e) =>
                                setInstructions((prev) => ({ ...prev, [section.id]: e.target.value }))
                              }
                              onKeyDown={(e) => e.key === "Enter" && handleRegenerate(section.id)}
                              placeholder={`Instruction e.g. "make more concise" or "add ROI metrics"`}
                              className="flex-1 text-xs bg-transparent border border-border rounded-lg px-3 py-1.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 min-w-0"
                            />
                            <Button
                              size="sm"
                              className="gap-1.5 text-xs shrink-0"
                              variant="outline"
                              onClick={() => handleRegenerate(section.id)}
                              disabled={!instructions[section.id]?.trim()}
                              loading={isRegen}
                            >
                              <Sparkles className="w-3 h-3" />
                              Apply
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        ))}

        {/* KB Sources tab */}
        <TabsContent value="sources" className="mt-4">
          <div className="flex flex-col gap-2">
            {sections.map((section) =>
              section.kb_source_ids.length > 0 ? (
                <div key={section.id} className="rounded-xl border border-border px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={cn("w-2 h-2 rounded-full", QUALITY_CONFIG[section.quality].dotClass)} />
                    <p className="text-sm font-semibold text-foreground">{section.name}</p>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {section.kb_source_ids.length} sources
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {section.kb_source_ids.map((srcId) => (
                      <span
                        key={srcId}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 border border-border rounded-md px-2.5 py-1.5"
                      >
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {srcId}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/generate`)}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
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

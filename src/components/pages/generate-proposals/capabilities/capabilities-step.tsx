"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Sparkles,
  Tags,
  Cloud,
  Shield,
  Database,
  GitBranch,
  Cpu,
  Code2,
  Bot,
  Globe,
  Package,
  BarChart2,
  Tag,
  FileText,
  BookOpen,
  Archive,
  Scroll,
  AlignLeft,
  AlignJustify,
  LayoutGrid,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ProposalFocus } from "@/types";

interface CapabilitiesStepProps {
  proposalId: string;
}

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  cloud: Cloud,
  security: Shield,
  database: Database,
  devops: GitBranch,
  architecture: Cpu,
  backend: Code2,
  ai: Bot,
  frontend: Globe,
  delivery: Package,
  management: BarChart2,
};

const getTagIcon = (category: string): LucideIcon => {
  const key = category.toLowerCase().split(/[\s_-]/)[0];
  return CATEGORY_ICON_MAP[key] ?? Tag;
};

interface DocType {
  id: string;
  label: string;
  icon: LucideIcon;
}

const DOCUMENT_TYPES: DocType[] = [
  { id: "case_studies", label: "Case Studies", icon: FileText },
  { id: "tech_docs", label: "Tech Docs", icon: BookOpen },
  { id: "past_proposals", label: "Past Proposals", icon: Archive },
  { id: "whitepapers", label: "Whitepapers", icon: Scroll },
];

interface ComplianceFramework {
  id: string;
  label: string;
}

const COMPLIANCE_FRAMEWORKS: ComplianceFramework[] = [
  { id: "soc2", label: "SOC 2" },
  { id: "iso27001", label: "ISO 27001" },
  { id: "gdpr", label: "GDPR" },
  { id: "pci_dss", label: "PCI DSS" },
];

interface FocusOption {
  id: ProposalFocus;
  label: string;
  description: string;
  icon: LucideIcon;
}

const FOCUS_OPTIONS: FocusOption[] = [
  { id: "concise", label: "Concise", description: "2–3 pages · key points only", icon: AlignLeft },
  { id: "standard", label: "Standard", description: "5–8 pages · balanced detail", icon: AlignJustify },
  { id: "detailed", label: "Detailed", description: "10–15 pages · full technical depth", icon: LayoutGrid },
  { id: "executive", label: "Executive", description: "Slide-deck narrative · C-suite audience", icon: Monitor },
];

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

const CapabilitiesStep = ({ proposalId }: CapabilitiesStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  // null = unset, falls back to all tags selected (AI pre-selection)
  const [manualTagSelection, setManualTagSelection] = useState<string[] | null>(null);
  const [selectedDocTypes, setSelectedDocTypes] = useState<string[]>(["case_studies", "tech_docs", "past_proposals"]);
  const [selectedCompliance, setSelectedCompliance] = useState<string[]>(["soc2", "iso27001"]);
  const [focus, setFocus] = useState<ProposalFocus>("standard");

  const { data: proposal } = useQuery({
    queryKey: ["proposals", proposalId],
    queryFn: () => proposalService.getById(proposalId),
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["capability-tags"],
    queryFn: () => proposalService.getCapabilityTags(),
  });

  const selectedTagIds = manualTagSelection ?? tags.map((t) => t.id);

  const { mutate: save, isPending } = useMutation({
    mutationFn: () =>
      proposalService.tagCapabilities({
        proposal_id: proposalId,
        tag_ids: selectedTagIds,
        compliance_frameworks: selectedCompliance,
        focus,
      }),
    onSuccess: () => {
      markStepComplete(2);
      router.push(`/all-proposals/generate-proposals/${proposalId}/generate`);
    },
    onError: () => toast.error("Failed to save capabilities. Please try again."),
  });

  const toggleTag = (id: string) => {
    setManualTagSelection(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((t) => t !== id)
        : [...selectedTagIds, id]
    );
  };

  const toggleDocType = (id: string) => {
    setSelectedDocTypes((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const toggleCompliance = (id: string) => {
    setSelectedCompliance((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const summaryFields = [
    { label: "Client", value: proposal?.client_name ?? "—" },
    { label: "Project type", value: proposal?.project_name ?? "—" },
    { label: "Deadline", value: "—" },
    { label: "Budget range", value: "—" },
    { label: "Pages parsed", value: "—" },
    { label: "KB matches", value: tags.length > 0 ? `${tags.length} relevant docs` : "—", highlight: tags.length > 0 },
  ];

  return (
    <Card className="max-w-6xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={Tags}
        title="Tag relevant capabilities"
        description="AI extracted context from your RFP — confirm what to include"
        step={2}
      />

      {/* AI analysis banner */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3.5">
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-sm text-foreground">
          Proposal AI analysed your RFP and detected{" "}
          <span className="font-semibold text-primary">{tags.length} capability areas</span>{" "}
          with matches in your Knowledge Base.
        </p>
      </div>

      {/* Project summary */}
      <div className="grid grid-cols-3 rounded-xl border border-border overflow-hidden">
        {summaryFields.map((field, i) => (
          <div
            key={field.label}
            className={cn(
              "px-5 py-4 flex flex-col gap-1",
              i < 3 && "border-b border-border",
              i % 3 !== 2 && "border-r border-border"
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {field.label}
            </span>
            <span className={cn("text-sm font-medium", field.highlight ? "text-primary" : "text-foreground")}>
              {field.value}
            </span>
          </div>
        ))}
      </div>

      {/* Capability areas */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">Capability areas</p>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {selectedTagIds.length} of {tags.length} selected
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            Click to toggle · AI-detected areas are pre-selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.length === 0
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 rounded-full bg-muted animate-pulse"
                  style={{ width: 80 + (i % 3) * 24 }}
                />
              ))
            : tags.map((tag) => {
                const TagIcon = getTagIcon(tag.category);
                const selected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-foreground border-border hover:border-primary/40 hover:bg-muted/50"
                    )}
                  >
                    <TagIcon className="w-3 h-3 shrink-0" />
                    {tag.name}
                  </button>
                );
              })}
        </div>
      </div>

      <SectionDivider label="Knowledge scope" />

      {/* Document types + Compliance frameworks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Document types</p>
            <span className="text-xs text-muted-foreground">
              {selectedDocTypes.length} of {DOCUMENT_TYPES.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {DOCUMENT_TYPES.map((dt) => {
              const DtIcon = dt.icon;
              const active = selectedDocTypes.includes(dt.id);
              return (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => toggleDocType(dt.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active
                      ? "bg-primary/10 text-primary border-primary/25"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-border/70"
                  )}
                >
                  <DtIcon className="w-3 h-3 shrink-0" />
                  {dt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Compliance frameworks</p>
            <span className="text-xs text-muted-foreground">
              {selectedCompliance.length} of {COMPLIANCE_FRAMEWORKS.length} active
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {COMPLIANCE_FRAMEWORKS.map((cf) => {
              const active = selectedCompliance.includes(cf.id);
              return (
                <button
                  key={cf.id}
                  type="button"
                  onClick={() => toggleCompliance(cf.id)}
                  className={cn(
                    "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    active
                      ? "bg-primary/10 text-primary border-primary/25"
                      : "bg-muted/30 text-muted-foreground border-border hover:border-border/70"
                  )}
                >
                  {cf.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <SectionDivider label="Proposal focus" />

      {/* Focus selector */}
      <div className="grid grid-cols-4 gap-3">
        {FOCUS_OPTIONS.map((opt) => {
          const OptIcon = opt.icon;
          const selected = focus === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFocus(opt.id)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors",
                selected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                  : "border-border bg-background hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center",
                  selected ? "bg-primary/10" : "bg-muted"
                )}
              >
                <OptIcon className={cn("w-4 h-4", selected ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
                  {opt.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
              </div>
            </button>
          );
        })}
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
        <Button type="button" onClick={() => save()} loading={isPending}>
          <Sparkles className="w-4 h-4" />
          Generate proposal
        </Button>
      </div>
    </Card>
  );
};

export default CapabilitiesStep;

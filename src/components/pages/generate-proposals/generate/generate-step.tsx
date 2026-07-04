"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  GripVertical,
  Trash2,
  RotateCcw,
  Plus,
  Layers,
  FileText,
  Clock,
  Database,
  Sparkles,
  Loader2,
  Pause,
  ChevronRight,
  PenLine,
  RefreshCw,
  LayoutList,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ProposalSection } from "@/types";

interface GenerateStepProps {
  proposalId: string;
}

interface PlanSection extends ProposalSection {
  required: boolean;
  removed: boolean;
}

type GenStatus = "queued" | "generating" | "done" | "error";

interface SectionProgress {
  status: GenStatus;
  preview?: string;
}

const SECTION_PREVIEWS = [
  "High-impact summary covering scope, approach, and business value for the client's cloud migration initiative.",
  "Phased lift-shift-optimise model with zero-downtime blue-green deployment and DMS for core data replication.",
  "End-to-end compliance posture aligned to SOC 2 Type II, ISO 27001 with automated evidence pipelines.",
  "Multi-tier VPC architecture with cross-region failover, auto-scaling groups, and centralised logging.",
  "CI/CD pipeline strategy using GitOps, Terraform for IaC, and containerised workloads across environments.",
  "InnoBoon's cloud delivery team composition, certifications, and engagement governance model.",
  "Commercial breakdown per milestone with fixed-price phases and T&M allowances for scope changes.",
];

const isRequiredSection = (name: string) =>
  name.toLowerCase().includes("executive") || name.toLowerCase().includes("summary");

const toLocalSections = (sections: ProposalSection[]): PlanSection[] =>
  sections.map((s) => ({
    ...s,
    required: isRequiredSection(s.name),
    removed: false,
  }));

const calcStats = (sections: PlanSection[]) => {
  const active = sections.filter((s) => !s.removed);
  const words = active.reduce((acc, s) => acc + (s.word_count || 200), 0);
  const kbDocs = active.reduce((acc, s) => acc + s.kb_source_ids.length, 0);
  const estSec = Math.round(words / 40);
  return { count: active.length, words, kbDocs, estSec };
};

interface StatBadgeProps {
  icon: React.ReactNode;
  value: string;
}

const StatBadge = ({ icon, value }: StatBadgeProps) => (
  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
    {icon}
    <span>{value}</span>
  </div>
);

const Divider = () => <div className="w-px h-3.5 bg-border" />;

const GenerateStep = ({ proposalId }: GenerateStepProps) => {
  const router = useRouter();
  const { markStepComplete } = useProposalWizardStore();

  const [phase, setPhase] = useState<"configure" | "generating">("configure");
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState<PlanSection[]>([]);
  const [orderedIds, setOrderedIds] = useState<string[] | null>(null);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [showAddInput, setShowAddInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [genProgress, setGenProgress] = useState<Record<string, SectionProgress>>({});
  const [completedCount, setCompletedCount] = useState(0);

  const { data: serverSections = [] } = useQuery({
    queryKey: ["proposals", proposalId, "sections"],
    queryFn: () => proposalService.getSections(proposalId),
    select: toLocalSections,
    enabled: !!proposalId,
  });

  const activeSections = useMemo(() => {
    const all = [...serverSections, ...customSections];
    const allActive = all.filter((s) => !removedIds.includes(s.id));
    if (!orderedIds) return allActive;
    const map = new Map(allActive.map((s) => [s.id, s]));
    return orderedIds.map((id) => map.get(id)).filter((s): s is PlanSection => !!s);
  }, [serverSections, customSections, removedIds, orderedIds]);

  const removedSections = useMemo(
    () => serverSections.filter((s) => removedIds.includes(s.id)),
    [serverSections, removedIds]
  );

  const { mutate: startGeneration } = useMutation({
    mutationFn: () =>
      proposalService.generate({
        proposal_id: proposalId,
        sections: activeSections.map((s) => s.id),
      }),
    onError: () => toast.error("Failed to start generation. Please try again."),
  });

  useEffect(() => {
    if (phase !== "generating") return;

    let idx = 0;
    const tick = () => {
      if (idx >= activeSections.length) return;
      const id = activeSections[idx].id;

      setGenProgress((prev) => ({ ...prev, [id]: { status: "generating" } }));

      setTimeout(() => {
        setGenProgress((prev) => ({
          ...prev,
          [id]: { status: "done", preview: SECTION_PREVIEWS[idx % SECTION_PREVIEWS.length] },
        }));
        setCompletedCount((c) => c + 1);
        idx++;
        if (idx < activeSections.length) setTimeout(tick, 800);
        else {
          markStepComplete(3);
        }
      }, 2200);
    };

    const start = setTimeout(tick, 600);
    return () => clearTimeout(start);
  }, [phase]);

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      setDraggedIdx(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (index !== dragOverIdx) setDragOverIdx(index);
    },
    [dragOverIdx]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>, dropIdx: number) => {
      e.preventDefault();
      if (draggedIdx === null || draggedIdx === dropIdx) return;
      const ids = activeSections.map((s) => s.id);
      const [draggedId] = ids.splice(draggedIdx, 1);
      ids.splice(dropIdx, 0, draggedId);
      setOrderedIds(ids);
      setDraggedIdx(null);
      setDragOverIdx(null);
    },
    [draggedIdx, activeSections]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  }, []);

  const removeSection = (id: string) => {
    setRemovedIds((prev) => [...prev, id]);
  };

  const restoreSection = (id: string) => {
    setRemovedIds((prev) => prev.filter((rid) => rid !== id));
    setOrderedIds((prev) => (prev ? [...prev, id] : null));
  };

  const addCustomSection = () => {
    if (!customName.trim()) return;
    const id = `custom-${Date.now()}`;
    const newSection: PlanSection = {
      id,
      proposal_id: proposalId,
      name: customName.trim(),
      content: null,
      order: activeSections.length + 1,
      status: "pending",
      word_count: 200,
      kb_source_ids: [],
      required: false,
      removed: false,
    };
    setCustomSections((prev) => [...prev, newSection]);
    setOrderedIds((prev) => (prev ? [...prev, id] : null));
    setCustomName("");
    setShowAddInput(false);
  };

  const handleStartGenerating = () => {
    const initial: Record<string, SectionProgress> = {};
    activeSections.forEach((s) => { initial[s.id] = { status: "queued" }; });
    setGenProgress(initial);
    setCompletedCount(0);
    startGeneration();
    setPhase("generating");
  };

  const stats = calcStats(activeSections);
  const overallPct = activeSections.length > 0
    ? Math.round((completedCount / activeSections.length) * 100)
    : 0;
  const kbTotal = activeSections.reduce((a, s) => a + s.kb_source_ids.length, 0);

  if (phase === "generating") {
    return (
      <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
        <StepHeader
          icon={Sparkles}
          title="Generating proposal sections"
          description={`Meridian Financial Services · Cloud Migration RFP`}
          step={3}
        />

        {/* Status banner */}
        <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3">
          <Loader2 className="w-4 h-4 text-primary shrink-0 animate-spin" />
          <p className="text-sm text-foreground">
            Retrieving{" "}
            <span className="font-semibold text-primary">{kbTotal} relevant documents</span>{" "}
            and drafting sections…
          </p>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {completedCount} of {activeSections.length} sections complete
            </span>
            <span className="text-xs font-medium text-foreground tabular-nums">
              {overallPct}%
            </span>
          </div>
        </div>

        {/* Section list */}
        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {activeSections.map((section) => {
            const progress = genProgress[section.id] ?? { status: "queued" };
            return (
              <div key={section.id} className="px-5 py-4">
                {progress.status === "done" ? (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="text-sm font-semibold text-foreground">{section.name}</span>
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                          Done
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5">
                          <RefreshCw className="w-3 h-3" /> Redo
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 text-xs gap-1 px-2.5">
                          <PenLine className="w-3 h-3" /> Edit
                        </Button>
                      </div>
                    </div>
                    {progress.preview && (
                      <p className="text-sm text-muted-foreground leading-relaxed pl-4">
                        {progress.preview}
                      </p>
                    )}
                  </div>
                ) : progress.status === "generating" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />
                      <span className="text-sm font-semibold text-primary">{section.name}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        Generating…
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5 pl-4">
                      <div className="h-2.5 bg-muted rounded-full animate-pulse w-3/4" />
                      <div className="h-2.5 bg-muted rounded-full animate-pulse w-full" />
                      <div className="h-2.5 bg-muted rounded-full animate-pulse w-1/2" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-border shrink-0" />
                    <span className="text-sm text-muted-foreground">{section.name}</span>
                    <span className="text-[11px] text-muted-foreground">Queued</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <Button variant="outline" type="button" onClick={() => setPhase("configure")}>
            <Pause className="w-4 h-4" />
            Pause
          </Button>
          <Button
            type="button"
            disabled={completedCount < activeSections.length}
            onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/review`)}
          >
            Review draft
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={LayoutList}
        title="Configure proposal sections"
        description="AI planned sections from your RFP — remove or reorder before generating"
        step={3}
      />

      {/* Stats bar */}
      <div className="flex items-center gap-3 rounded-xl bg-muted/40 border border-border px-4 py-3">
        <StatBadge
          icon={<Layers className="w-3.5 h-3.5" />}
          value={`${stats.count} sections`}
        />
        <Divider />
        <StatBadge
          icon={<FileText className="w-3.5 h-3.5" />}
          value={`~${stats.words.toLocaleString()} words total`}
        />
        <Divider />
        <StatBadge
          icon={<Database className="w-3.5 h-3.5" />}
          value={`${stats.kbDocs} KB docs as context`}
        />
        <div className="flex-1" />
        <StatBadge
          icon={<Clock className="w-3.5 h-3.5" />}
          value={`Est. ~${stats.estSec}s generation time`}
        />
      </div>

      {/* Active sections */}
      <div className="flex flex-col gap-2">
        {activeSections.map((section, index) => (
          <div
            key={section.id}
            draggable={!section.required}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3.5 transition-all",
              draggedIdx === index && "opacity-40",
              dragOverIdx === index && draggedIdx !== index && "border-primary border-dashed bg-primary/5"
            )}
          >
            {/* Drag handle */}
            <GripVertical
              className={cn(
                "w-4 h-4 shrink-0",
                section.required ? "text-transparent" : "text-muted-foreground/40 cursor-grab active:cursor-grabbing"
              )}
            />

            {/* Number badge */}
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {index + 1}
            </div>

            {/* Section info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{section.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <StatBadge
                  icon={<FileText className="w-3 h-3" />}
                  value={`~${section.word_count || 200} words`}
                />
                <StatBadge
                  icon={<Clock className="w-3 h-3" />}
                  value={`~${Math.round((section.word_count || 200) / 40)}s`}
                />
                {section.kb_source_ids.length > 0 && (
                  <StatBadge
                    icon={<Database className="w-3 h-3" />}
                    value={`${section.kb_source_ids.length} KB docs`}
                  />
                )}
              </div>
            </div>

            {/* Required badge or delete */}
            {section.required ? (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600">
                Required
              </span>
            ) : (
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}

        {/* Removed sections */}
        {removedSections.map((section) => (
          <div
            key={section.id}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 opacity-50"
          >
            <GripVertical className="w-4 h-4 text-transparent shrink-0" />
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground shrink-0">
              –
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">{section.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <StatBadge
                  icon={<FileText className="w-3 h-3" />}
                  value={`~${section.word_count || 200} words`}
                />
                <StatBadge
                  icon={<Clock className="w-3 h-3" />}
                  value={`~${Math.round((section.word_count || 200) / 40)}s`}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => restoreSection(section.id)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shrink-0 opacity-100"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Add custom section */}
        {showAddInput ? (
          <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
            <Input
              autoFocus
              placeholder="Section name…"
              value={customName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomName(e.target.value)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === "Enter") addCustomSection();
                if (e.key === "Escape") { setShowAddInput(false); setCustomName(""); }
              }}
              className="flex-1 h-8 text-sm"
            />
            <Button size="sm" onClick={addCustomSection} disabled={!customName.trim()}>
              Add
            </Button>
            <button
              type="button"
              onClick={() => { setShowAddInput(false); setCustomName(""); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddInput(true)}
            className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add custom section
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/capabilities`)}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </Button>
        <Button
          type="button"
          disabled={activeSections.length === 0}
          onClick={handleStartGenerating}
        >
          <Sparkles className="w-4 h-4" />
          Start generating
        </Button>
      </div>
    </Card>
  );
};

export default GenerateStep;

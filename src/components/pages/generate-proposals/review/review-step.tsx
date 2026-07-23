"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, ChevronRight, ArrowLeft, ChevronDown, GripVertical, Trash2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Button, Card, Markdown } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ProposalDetailSection } from "@/types";

interface ReviewStepProps {
  proposalId: string;
}

const wordCount = (text: string) =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

interface SortableSectionProps {
  section: ProposalDetailSection;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

const SortableSection = ({ section, isExpanded, onToggle, onDelete }: SortableSectionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const words = wordCount(section.content);

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
      }}
      className={cn(
        "rounded-xl border border-border overflow-hidden bg-background",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-1 pr-3 hover:bg-muted/30 transition-colors">
        {/* Drag handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none shrink-0"
          tabIndex={-1}
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={onToggle}
          className="flex-1 flex items-center gap-3 py-4 text-left min-w-0"
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

        {/* Delete */}
        <button
          type="button"
          onClick={onDelete}
          className="p-1.5 ml-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

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
};

const ReviewStep = ({ proposalId }: ReviewStepProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { markStepComplete } = useProposalWizardStore();

  // null = use server order; set on first user mutation (reorder / delete)
  const [localSections, setLocalSections] = useState<ProposalDetailSection[] | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const { data: proposal, isLoading } = useQuery({
    queryKey: ["proposal-sections", proposalId],
    queryFn: () => proposalService.getProposalSections(proposalId),
    enabled: !!proposalId,
  });

  const sections = useMemo(() => {
    if (localSections !== null) return localSections;
    return [...(proposal?.sections ?? [])].sort((a, b) => a.order - b.order);
  }, [localSections, proposal]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { mutate: saveAndProceed, isPending } = useMutation({
    mutationFn: () =>
      proposalService.updateProposalSections({
        proposal_id: proposalId,
        sections: sections.map((s, i) => ({ id: s.id, order: i })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposal-sections", proposalId] });
      markStepComplete(4);
      router.push(`/all-proposals/generate-proposals/${proposalId}/export`);
    },
    onError: () => toast.error("Failed to save changes. Please try again."),
  });

  const allExpanded = sections.length > 0 && expandedIds.size === sections.length;

  const toggleAll = () => {
    if (allExpanded) setExpandedIds(new Set());
    else setExpandedIds(new Set(sections.map((s) => s.id)));
  };

  const toggleSection = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const deleteSection = (id: number) => {
    setLocalSections(sections.filter((s) => s.id !== id));
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      setLocalSections(arrayMove(sections, oldIndex, newIndex));
    }
  };

  const totalWords = sections.reduce((sum, s) => sum + wordCount(s.content), 0);

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={FileText}
        title="Review proposal"
        description="Reorder or remove sections, then proceed to export"
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
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border px-5 py-4 flex items-center gap-3">
              <div
                className="h-3 bg-muted rounded animate-pulse"
                style={{ width: `${45 + (i % 3) * 20}%` }}
              />
            </div>
          ))}

        {!isLoading && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableSection
                  key={section.id}
                  section={section}
                  isExpanded={expandedIds.has(section.id)}
                  onToggle={() => toggleSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {!isLoading && sections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No sections remaining.</p>
        )}
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
          loading={isPending}
          disabled={sections.length === 0}
          onClick={() => saveAndProceed()}
        >
          Proceed to export
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ReviewStep;

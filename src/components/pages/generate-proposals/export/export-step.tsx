"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LayoutGrid, CheckCircle2, ArrowLeft, Check, Eye, X, Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ExportFormat, Template } from "@/types";

interface ExportStepProps {
  proposalId: string;
}

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  letter: string;
  letterBg: string;
  letterColor: string;
}

const FORMATS: FormatOption[] = [
  {
    id: "pdf",
    label: "PDF Document",
    description: "Best for sharing with clients",
    letter: "PDF",
    letterBg: "bg-red-50",
    letterColor: "text-red-500",
  },
  {
    id: "docx",
    label: "Word Document",
    description: "Editable format for further changes",
    letter: "DOC",
    letterBg: "bg-blue-50",
    letterColor: "text-blue-500",
  },
];

const IFRAME_W = 794;
const IFRAME_H = 1123;

// Preview modal: A4 at 80% scale
const PREVIEW_SCALE = 0.8;
const PREVIEW_W = Math.round(IFRAME_W * PREVIEW_SCALE);
const PREVIEW_H = Math.round(IFRAME_H * PREVIEW_SCALE);

const ExportStep = ({ proposalId }: ExportStepProps) => {
  const router = useRouter();
  const { markStepComplete, reset } = useProposalWizardStore();

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);

  // Measure the grid to compute thumbnail scale dynamically
  const gridRef = useRef<HTMLDivElement>(null);
  const [thumbScale, setThumbScale] = useState(0.24);
  const thumbH = Math.round(IFRAME_H * thumbScale);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const update = () => {
      // 4 cols, 3 gaps of 12px (gap-3)
      const colW = (el.clientWidth - 36) / 4;
      setThumbScale(colW / IFRAME_W);
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const { data: templates = [], isLoading: loadingTemplates } = useQuery({
    queryKey: ["templates"],
    queryFn: () => proposalService.getTemplates(),
    staleTime: Infinity,
  });

  const { data: proposal } = useQuery({
    queryKey: ["proposals", proposalId, "detail"],
    queryFn: () => proposalService.getDetail(proposalId),
    enabled: !!proposalId,
  });

  const effectiveTemplateId = selectedTemplateId ?? templates[0]?.id ?? null;

  const { mutate: doExport } = useMutation({
    mutationFn: (format: ExportFormat) =>
      proposalService.exportProposal({
        proposal_id: proposalId,
        template_id: effectiveTemplateId!,
        format,
      }),
    onSuccess: () => {
      markStepComplete(5);
      setDownloadingFormat(null);
      toast.success("Download started");
    },
    onError: () => {
      setDownloadingFormat(null);
      toast.error("Export failed. Please try again.");
    },
  });

  const handleDownload = (format: ExportFormat) => {
    if (!effectiveTemplateId) {
      toast.error("Please select a template first.");
      return;
    }
    setDownloadingFormat(format);
    doExport(format);
  };

  const handleDone = () => {
    markStepComplete(5);
    reset();
    router.push("/all-proposals");
  };

  return (
    <>
      <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
        <StepHeader
          icon={LayoutGrid}
          title="Choose a template"
          description="Pick a layout for your proposal, then download in your preferred format"
          step={5}
        />

        {/* Success banner */}
        {proposal && (
          <div className="flex items-center gap-2.5 rounded-xl bg-green-500/8 border border-green-500/20 px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700 dark:text-green-400">
              <span className="font-semibold">Proposal ready</span>
              {" — "}{proposal.client_name} · {proposal.title}
            </p>
          </div>
        )}

        {/* Template picker */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Template</p>

          {loadingTemplates && (
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border overflow-hidden">
                  <div className="bg-muted/30 animate-pulse" style={{ height: thumbH }} />
                  <div className="px-3 py-2.5 border-t border-border flex flex-col gap-1.5">
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-muted rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingTemplates && (
            <div ref={gridRef} className="grid grid-cols-4 gap-3">
              {templates.map((template) => {
                const isSelected = effectiveTemplateId === template.id;
                return (
                  <div
                    key={template.id}
                    className={cn(
                      "flex flex-col rounded-xl border-2 overflow-hidden transition-all",
                      isSelected ? "border-primary shadow-sm" : "border-border hover:border-primary/40"
                    )}
                  >
                    {/* Thumbnail */}
                    <div
                      className="relative overflow-hidden w-full bg-white cursor-pointer"
                      style={{ height: thumbH }}
                      onClick={() => setSelectedTemplateId(template.id)}
                    >
                      <iframe
                        src={template.preview_url}
                        sandbox="allow-same-origin"
                        title={`${template.name} thumbnail`}
                        className="absolute top-0 left-0 pointer-events-none border-0"
                        style={{
                          width: IFRAME_W + 24,
                          height: IFRAME_H,
                          transformOrigin: "top left",
                          transform: `scale(${thumbScale})`,
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Label + actions */}
                    <div className="px-3 py-2.5 border-t border-border bg-background flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{template.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{template.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(template)}
                        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Download */}
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-foreground">Download as</p>
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
            {FORMATS.map((fmt) => (
              <div key={fmt.id} className="flex items-center gap-4 px-5 py-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", fmt.letterBg)}>
                  <span className={cn("text-[10px] font-bold", fmt.letterColor)}>{fmt.letter}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{fmt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fmt.description}</p>
                </div>
                <Button
                  size="sm"
                  className="shrink-0"
                  loading={downloadingFormat === fmt.id}
                  disabled={!effectiveTemplateId || (downloadingFormat !== null && downloadingFormat !== fmt.id)}
                  onClick={() => handleDownload(fmt.id)}
                >
                  Download
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/review`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button type="button" onClick={handleDone}>
            <Check className="w-4 h-4" />
            Done — back to proposals
          </Button>
        </div>
      </Card>

      {/* Download blocking dialog */}
      {downloadingFormat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 bg-background rounded-2xl border border-border shadow-2xl px-8 py-8 flex flex-col items-center gap-4 w-80">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileDown className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <p className="text-sm font-semibold text-foreground">Generating your document</p>
              <p className="text-xs text-muted-foreground">
                Preparing your {downloadingFormat.toUpperCase()} file — this may take a moment
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Please wait…
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          />

          {/* Panel */}
          <div
            className="relative z-10 bg-background rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            style={{ width: PREVIEW_W + 48 }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <p className="text-sm font-semibold text-foreground">{previewTemplate.name}</p>
                <p className="text-xs text-muted-foreground">{previewTemplate.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedTemplateId(previewTemplate.id);
                    setPreviewTemplate(null);
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Select
                </Button>
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* iframe area — fixed-size clip, no scroll needed */}
            <div className="p-6 flex justify-center">
              <div
                className="relative overflow-hidden shrink-0"
                style={{ width: PREVIEW_W, height: PREVIEW_H }}
              >
                <iframe
                  src={previewTemplate.preview_url}
                  sandbox="allow-same-origin"
                  title={`${previewTemplate.name} full preview`}
                  className="absolute top-0 left-0 border-0 overflow-hidden"
                  style={{
                    width: IFRAME_W,
                    height: IFRAME_H,
                    transformOrigin: "top left",
                    transform: `scale(${PREVIEW_SCALE})`,
                    overflow: "hidden",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportStep;

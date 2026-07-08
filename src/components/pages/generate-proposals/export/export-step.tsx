"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  LayoutGrid,
  CheckCircle2,
  Eye,
  Send,
  ChevronRight,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button, Card, Input } from "@/components/ui";
import { StepHeader } from "@/components/pages/generate-proposals";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";
import type { ExportFormat, ExportProposalResponse } from "@/types";

interface ExportStepProps {
  proposalId: string;
}

interface Template {
  id: string;
  name: string;
  subtitle: string;
  popular?: boolean;
}

const TEMPLATES: Template[] = [
  { id: "modern_blue", name: "Modern Blue", subtitle: "Popular", popular: true },
  { id: "minimal_clean", name: "Minimal Clean", subtitle: "Classic" },
  { id: "corporate", name: "Corporate", subtitle: "Formal" },
  { id: "branded", name: "Branded", subtitle: "Bold" },
  { id: "executive", name: "Executive", subtitle: "Premium" },
];

interface FormatOption {
  id: ExportFormat;
  label: string;
  description: string;
  iconBg: string;
  iconColor: string;
  letter: string;
}

const FORMATS: FormatOption[] = [
  {
    id: "pdf",
    label: "PDF Document",
    description: "Best for clients · Branded cover page",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    letter: "PDF",
  },
  {
    id: "docx",
    label: "Word Document (.docx)",
    description: "Editable format for further changes",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    letter: "DOC",
  },
  {
    id: "pptx",
    label: "Presentation (.pptx)",
    description: "Executive summary slide deck",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    letter: "PPT",
  },
];

const TemplateThumbnail = ({ templateId }: { templateId: string }) => {
  if (templateId === "modern_blue") {
    return (
      <div className="w-full aspect-[3/4] bg-blue-700 rounded-md overflow-hidden p-3 flex flex-col">
        <div className="text-[5px] font-bold text-blue-200 tracking-widest uppercase mb-2">
          InnoBoon Technologies
        </div>
        <div className="text-[8px] font-bold text-white leading-snug">
          Cloud Infrastructure<br />Migration Proposal
        </div>
        <div className="text-[5px] text-blue-300 mt-1">Meridian Financial Services</div>
        <div className="flex-1" />
        <div className="flex flex-col gap-1">
          {[85, 95, 75, 90, 65].map((w, i) => (
            <div key={i} className="h-[2px] bg-blue-500/50 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (templateId === "minimal_clean") {
    return (
      <div className="w-full aspect-[3/4] bg-white border border-border/60 rounded-md overflow-hidden p-3 flex flex-col gap-1.5">
        <div className="text-[5px] text-muted-foreground uppercase tracking-widest">InnoBoon Technologies</div>
        <div className="text-[7px] font-semibold text-foreground leading-snug">
          Cloud Infrastructure Migration Proposal
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex flex-col gap-1 flex-1">
          {[90, 80, 95, 70, 85, 60, 75].map((w, i) => (
            <div key={i} className="h-[2px] bg-muted-foreground/20 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (templateId === "corporate") {
    return (
      <div className="w-full aspect-[3/4] bg-slate-800 rounded-md overflow-hidden p-3 flex flex-col">
        <div className="w-8 h-0.5 bg-orange-400 mb-2" />
        <div className="text-[5px] text-slate-400 uppercase tracking-widest mb-1">InnoBoon Technologies</div>
        <div className="text-[8px] font-bold text-white leading-snug">
          Cloud Infrastructure<br />Migration Proposal
        </div>
        <div className="text-[5px] text-slate-400 mt-1">Meridian Financial Services</div>
        <div className="flex-1" />
        <div className="flex flex-col gap-1">
          {[80, 90, 70].map((w, i) => (
            <div key={i} className="h-[2px] bg-slate-600 rounded-full" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (templateId === "branded") {
    return (
      <div className="w-full aspect-[3/4] bg-white border border-border/60 rounded-md overflow-hidden flex">
        <div className="flex-1 p-3 flex flex-col gap-1">
          <div className="text-[5px] text-muted-foreground uppercase tracking-widest">InnoBoon</div>
          <div className="text-[6px] font-bold text-foreground leading-snug mt-1">
            Cloud Infrastructure<br />Migration
          </div>
          <div className="flex flex-col gap-1 mt-2">
            {[85, 70, 90, 65, 80].map((w, i) => (
              <div key={i} className="h-[2px] bg-muted-foreground/20 rounded-full" style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="w-5 bg-blue-700 flex flex-col items-center justify-end pb-2">
          <div className="text-[4px] text-blue-200 writing-mode-vertical rotate-180">Cloud Infrastructure</div>
        </div>
      </div>
    );
  }
  // Executive
  return (
    <div className="w-full aspect-[3/4] bg-gray-950 rounded-md overflow-hidden p-3 flex flex-col">
      <div className="w-6 h-px bg-primary mb-3" />
      <div className="text-[5px] text-gray-500 uppercase tracking-widest mb-2">Proposal</div>
      <div className="text-[8px] font-bold text-white leading-snug">
        Cloud Infrastructure<br />Migration
      </div>
      <div className="text-[5px] text-gray-500 mt-1">Cloud Financial</div>
      <div className="flex-1" />
      <div className="w-4 h-px bg-primary" />
    </div>
  );
};

const ExportStep = ({ proposalId }: ExportStepProps) => {
  const router = useRouter();
  const { markStepComplete, reset } = useProposalWizardStore();

  const [selectedTemplate, setSelectedTemplate] = useState("modern_blue");
  const [email, setEmail] = useState("");
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { data: proposal } = useQuery({
    queryKey: ["proposals", proposalId],
    queryFn: () => proposalService.getById(proposalId),
    enabled: !!proposalId,
  });

  const { mutate: doExport } = useMutation<ExportProposalResponse, Error, ExportFormat>({
    mutationFn: (format) =>
      proposalService.exportProposal({
        proposal_id: proposalId,
        template_id: selectedTemplate,
        format,
      }),
    onSuccess: (response) => {
      markStepComplete(5);
      window.open(response.download_url, "_blank");
      setDownloadingFormat(null);
      toast.success("Download started");
    },
    onError: () => {
      setDownloadingFormat(null);
      toast.error("Export failed. Please try again.");
    },
  });

  const handleDownload = (format: ExportFormat) => {
    setDownloadingFormat(format);
    doExport(format);
  };

  const handleSendEmail = () => {
    if (!email.trim()) return;
    setIsSending(true);
    doExport("pdf");
    setTimeout(() => {
      setIsSending(false);
      toast.success(`Proposal sent to ${email}`);
    }, 1500);
  };

  const handleDone = () => {
    markStepComplete(5);
    reset();
    router.push("/all-proposals");
  };

  return (
    <Card className="max-w-5xl mx-auto py-8 px-8 flex flex-col gap-6">
      <StepHeader
        icon={LayoutGrid}
        title="Choose a proposal template"
        description="Preview your generated content in any layout — then download"
        step={5}
      />

      {/* Success banner */}
      <div className="flex items-center gap-2.5 rounded-xl bg-green-500/8 border border-green-500/20 px-4 py-3">
        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-sm text-green-700 dark:text-green-400">
          <span className="font-semibold">Proposal generated</span>
          {proposal && (
            <> — {proposal.client_name} · {proposal.project_name}</>
          )}
        </p>
      </div>

      {/* Template picker */}
      <div className="grid grid-cols-5 gap-3">
        {TEMPLATES.map((template) => {
          const isSelected = selectedTemplate === template.id;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplate(template.id)}
              className={cn(
                "flex flex-col rounded-xl border-2 overflow-hidden transition-all text-center",
                isSelected
                  ? "border-primary shadow-sm"
                  : "border-border hover:border-primary/40"
              )}
            >
              {/* Popular badge */}
              {template.popular && (
                <div className="bg-primary px-2 py-0.5">
                  <span className="text-[10px] font-bold text-primary-foreground tracking-wide uppercase">
                    Popular
                  </span>
                </div>
              )}

              {/* Thumbnail */}
              <div className="p-2">
                <TemplateThumbnail templateId={template.id} />
              </div>

              {/* Label */}
              <div className="px-2 pb-2.5 flex flex-col gap-0.5">
                <p className="text-xs font-semibold text-foreground">{template.name}</p>
                <p className="text-[11px] text-muted-foreground">{template.subtitle}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toast.info("Preview coming soon"); }}
                  className="mt-1.5 flex items-center justify-center gap-1 text-[11px] text-muted-foreground border border-border rounded-md py-1 hover:border-primary/40 hover:text-foreground transition-colors"
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </button>
          );
        })}
      </div>

      {/* Download as */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-foreground">Download as</p>

        <div className="flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
          {FORMATS.map((fmt) => (
            <div key={fmt.id} className="flex items-center gap-4 px-5 py-4">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", fmt.iconBg)}>
                <span className={cn("text-[10px] font-bold", fmt.iconColor)}>{fmt.letter}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{fmt.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{fmt.description}</p>
              </div>
              <Button
                onClick={() => handleDownload(fmt.id)}
                loading={downloadingFormat === fmt.id}
                size="sm"
                className="shrink-0"
              >
                Download
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Send directly */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Send directly
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="client@company.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") handleSendEmail();
            }}
            className="flex-1"
          />
          <Button
            onClick={handleSendEmail}
            loading={isSending}
            disabled={!email.trim()}
            className="gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            Send via email
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button
          variant="outline"
          type="button"
          onClick={() => router.push(`/all-proposals/generate-proposals/${proposalId}/review`)}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </Button>
        <Button type="button" onClick={handleDone} className="gap-2">
          <Check className="w-4 h-4" />
          Done — back to proposals
        </Button>
      </div>
    </Card>
  );
};

export default ExportStep;

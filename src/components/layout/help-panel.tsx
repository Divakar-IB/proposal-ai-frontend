"use client";

import { useState } from "react";
import {
  HelpCircle,
  X,
  Upload,
  Tag,
  Sparkles,
  Eye,
  Download,
  BookOpen,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui";

const STEPS = [
  { icon: Upload, label: "Upload RFP", desc: "Upload your client's RFP document and fill in project details." },
  { icon: Tag, label: "Tag capabilities", desc: "Confirm AI-suggested capability tags and pick a proposal focus." },
  { icon: Sparkles, label: "Generate", desc: "Review planned sections, then trigger live AI generation." },
  { icon: Eye, label: "Review & refine", desc: "Edit sections inline or regenerate with natural language instructions." },
  { icon: Download, label: "Export", desc: "Choose a visual template and download as PDF or DOCX." },
];

const TIPS = [
  { label: "Focus levels", desc: "Concise = 3–5 pages, Standard = 8–10, Detailed = 15+, Executive = 1-page summary." },
  { label: "Regenerate a section", desc: "Open any section in Review, type an instruction, and hit Regenerate." },
  { label: "DOCX exports", desc: "Template layout applies to PDF only — DOCX uses a plain structured format." },
  { label: "Knowledge Base", desc: "Upload internal docs to KB before generating — the AI pulls relevant context automatically." },
];

export const HelpPanel = () => {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <button
          className="fixed bottom-6 right-6 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shadow-lg hover:opacity-90 transition-opacity z-50"
          aria-label="Open help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="w-96">
        {/* Header */}
        <DrawerHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 text-primary" />
            </div>
            <DrawerTitle>Help & Guide</DrawerTitle>
          </div>
          <DrawerClose asChild>
            <button
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close help"
            >
              <X className="w-4 h-4" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-7">

          {/* Proposal workflow */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Proposal Workflow
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {STEPS.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <step.icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-2" />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-semibold text-foreground leading-none mb-1">{step.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Knowledge Base */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Knowledge Base
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3.5 flex gap-3">
              <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload your company documents, case studies, and compliance materials to the Knowledge Base.
                During generation the AI retrieves the most relevant chunks and uses them as context —
                making every proposal on-brand and accurate.
              </p>
            </div>
          </section>

          {/* Tips */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tips
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {TIPS.map((tip) => (
                <div key={tip.label} className="flex gap-3 rounded-xl border border-border px-4 py-3">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-0.5">{tip.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Proposal AI · InnoBoon Technologies ·{" "}
            <a
              href="mailto:adhiththiyan.s@innoboon.com"
              className="text-primary hover:underline"
            >
              Get support
            </a>
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

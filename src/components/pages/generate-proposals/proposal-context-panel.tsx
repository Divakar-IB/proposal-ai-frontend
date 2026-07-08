"use client";

import { useQuery } from "@tanstack/react-query";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import { cn } from "@/lib/utils";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="flex flex-col gap-3">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
      {title}
    </p>
    {children}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center">
    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
      <span className="text-lg">📄</span>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">
      Upload your RFP to see AI-extracted requirements and knowledge matches here.
    </p>
  </div>
);

const ProposalContextPanel = () => {
  const { proposalId } = useProposalWizardStore();

  const { data: proposal } = useQuery({
    queryKey: ["proposals", proposalId],
    queryFn: () => proposalService.getById(proposalId!),
    enabled: !!proposalId,
  });

  return (
    <aside className="w-125 shrink-0 border-l border-border bg-white flex flex-col h-full overflow-y-auto">
      <div className="px-5 py-4 border-b border-border shrink-0">
        <p className="text-base font-semibold text-foreground">AI Context</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Extracted from your RFP
        </p>
      </div>

      {!proposalId ? (
        <EmptyState />
      ) : (
        <div className="px-5 py-5 flex flex-col gap-6">
          {/* Placeholder sections — replace with real data from proposal analysis API */}
          <Section title="Client Requirements">
            <ul className="flex flex-col gap-2">
              {["—", "—", "—"].map((_, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <div className="h-3 bg-muted rounded w-full animate-pulse" />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Capability Tags">
            <div className="flex flex-wrap gap-1.5">
              {[60, 48, 72, 56, 64].map((w, i) => (
                <div
                  key={i}
                  className="h-6 rounded-full bg-muted animate-pulse"
                  style={{ width: w }}
                />
              ))}
            </div>
          </Section>

          <Section title="Knowledge Match">
            <div className="flex flex-col gap-2.5">
              {[94, 88, 76, 71].map((pct, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                    {pct}%
                  </span>
                  <div className="h-3 w-12 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Sources Retrieved">
            <div className="flex flex-col gap-2">
              {(
                [
                  ["Case studies", null],
                  ["Tech docs", null],
                  ["Past proposals", null],
                ] as const
              ).map(([label]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <div className="h-3 w-14 bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </Section>
        </div>
      )}
    </aside>
  );
};

export default ProposalContextPanel;

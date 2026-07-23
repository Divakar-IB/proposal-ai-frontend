"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "@/components/ui";
import { proposalService } from "@/services";
import { useProposalWizardStore } from "@/store";
import type { KnowledgeMatch } from "@/types";

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section = ({ title, children }: SectionProps) => (
  <div className="flex flex-col gap-3">
    <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
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
  const { isUploading } = useProposalWizardStore();

  const pathname = usePathname();
  const segments = pathname.split("/");
  const gpIndex = segments.indexOf("generate-proposals");
  const proposalId =
    gpIndex >= 0 && segments[gpIndex + 1] && segments[gpIndex + 1] !== "new"
      ? segments[gpIndex + 1]
      : null;

  const { data: stateData } = useQuery({
    queryKey: ["proposal-state", proposalId],
    queryFn: () => proposalService.getProposalState(proposalId!),
    enabled: !!proposalId,
    staleTime: 30_000,
  });

  const summary = stateData?.summary?.summary ?? null;
  const knowledgeMatches = stateData?.summary?.knowledge_matches ?? [];
  const capabilityTags = stateData?.summary?.capability_tags ?? [];

  return (
    <aside className="w-125 shrink-0 border-l border-border bg-white flex flex-col h-full overflow-y-auto">
      <div className="px-5 py-4 border-b border-border shrink-0">
        <p className="text-base font-semibold text-foreground">AI Context</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Extracted from your RFP
        </p>
      </div>

      {isUploading ? (
        <div className="px-5 py-5 flex flex-col gap-6">
          <Section title="Summary">
            <div className="flex flex-col gap-3">
              {[100, 92, 84, 70, 88, 60, 75, 34, 67, 34, 89, 100, 92, 84, 70, 88, 60, 75, 34, 67, 34, 89].map((w, i) => (
                <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </Section>
          <Section title="Knowledge Match">
            <div className="flex flex-col gap-3">
              {[80, 60].map((w, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="h-3 bg-muted rounded animate-pulse w-28" />
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary/20 animate-pulse" style={{ width: `${w}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ) : !proposalId ? (
        <EmptyState />
      ) : (
        <div className="px-5 py-5 flex flex-col gap-6">
          <Section title="Summary">
            {summary ? (
              <Markdown>{summary}</Markdown>
            ) : (
              <div className="flex flex-col gap-2">
                {[100, 90, 75].map((w, i) => (
                  <div key={i} className="h-3 bg-muted rounded animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            )}
          </Section>

          {knowledgeMatches.length > 0 && (
            <Section title="Knowledge Match">
              <div className="flex flex-col gap-3">
                {knowledgeMatches.map((match: KnowledgeMatch) => (
                  <div key={match.document_id} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium text-foreground truncate">
                        {match.title}
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground shrink-0">
                        {match.match_percent}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{ width: `${match.match_percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {capabilityTags.length > 0 && (
            <Section title="Capability Tags">
              <div className="flex flex-wrap gap-1.5">
                {capabilityTags.map((tag) => (
                  <span
                    key={tag.name}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/8 border border-primary/15 text-[11px] font-medium text-primary"
                  >
                    {tag.name}
                    <span className="text-primary/60 font-normal">
                      {Math.round(tag.confidence * 100)}%
                    </span>
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>
      )}
    </aside>
  );
};

export default ProposalContextPanel;

"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProposalWizardStore } from "@/store/use-proposal-wizard-store";

interface Step {
  number: number;
  label: string;
  subtitle: string;
  segment: string;
}

const STEPS: Step[] = [
  { number: 1, label: "Upload requirements", subtitle: "RFP document", segment: "new" },
  { number: 2, label: "Configure generation", subtitle: "Mode & depth", segment: "configure" },
  { number: 3, label: "Generate proposal", subtitle: "AI drafting", segment: "generate" },
  { number: 4, label: "Review & refine", subtitle: "Review & edit", segment: "review" },
  { number: 5, label: "Export & submit", subtitle: "PDF · DOCX", segment: "export" },
];

const getActiveStep = (pathname: string): number => {
  const last = pathname.split("/").at(-1);
  if (last === "configure") return 2;
  if (last === "generate") return 3;
  if (last === "review") return 4;
  if (last === "export") return 5;
  return 1;
};

const getStepHref = (step: Step, proposalId: string | null): string => {
  if (step.number === 1) return "/all-proposals/generate-proposals/new";
  if (!proposalId) return "#";
  return `/all-proposals/generate-proposals/${proposalId}/${step.segment}`;
};

interface ProposalStepsSidebarProps {
  isCollapsed: boolean;
}

const ProposalStepsSidebar = ({ isCollapsed }: ProposalStepsSidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { proposalId, completedSteps } = useProposalWizardStore();
  const activeStep = getActiveStep(pathname);

  return (
    <>
      {!isCollapsed && (
        <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Proposal steps
        </p>
      )}

      <div className={cn("flex flex-col", isCollapsed && "items-center")}>
        {STEPS.map((step, index) => {
          const isLast = index === STEPS.length - 1;
          const isActive = step.number === activeStep;
          const isCompleted = completedSteps.includes(step.number);
          const isClickable = isCompleted || isActive;
          const href = getStepHref(step, proposalId);

          const circle = (
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border transition-colors",
                isActive || isCompleted
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border text-muted-foreground bg-background"
              )}
            >
              {isCompleted && !isActive ? (
                <Check className="w-3 h-3" />
              ) : (
                step.number
              )}
            </div>
          );

          const connector = !isLast && (
            <div
              className={cn(
                "w-px flex-1 mt-1",
                isCompleted ? "bg-primary/40" : "bg-border"
              )}
            />
          );

          if (isCollapsed) {
            return (
              <div key={step.number} className="flex flex-col items-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && router.push(href)}
                  title={step.label}
                  className={cn(
                    "transition-opacity",
                    !isClickable && "opacity-40"
                  )}
                >
                  {circle}
                </button>
                {!isLast && (
                  <div
                    className={cn(
                      "w-px h-5 my-0.5",
                      isCompleted ? "bg-primary/40" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          }

          return (
            <div key={step.number} className="flex gap-2.5 pr-2 pl-3">
              {/* Left: circle + connector line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="mt-2.5">{circle}</div>
                {connector}
              </div>

              {/* Right: clickable text row */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && router.push(href)}
                className={cn(
                  "flex-1 text-left rounded-md px-2 py-2 mb-1 transition-colors min-w-0",
                  isActive && "bg-primary/10",
                  !isActive && isClickable && "hover:bg-muted cursor-pointer",
                  !isClickable && "opacity-50 cursor-default"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium leading-tight truncate",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {step.subtitle}
                </p>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ProposalStepsSidebar;

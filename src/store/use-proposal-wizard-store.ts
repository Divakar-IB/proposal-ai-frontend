import { create } from "zustand";

interface ProposalWizardState {
  proposalId: string | null;
  completedSteps: number[];
  setProposalId: (id: string) => void;
  markStepComplete: (step: number) => void;
  reset: () => void;
}

export const useProposalWizardStore = create<ProposalWizardState>((set) => ({
  proposalId: null,
  completedSteps: [],

  setProposalId: (id) => set({ proposalId: id }),
  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: Array.from(new Set([...state.completedSteps, step])),
    })),
  reset: () => set({ proposalId: null, completedSteps: [] }),
}));

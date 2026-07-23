import { create } from "zustand";

interface ProposalWizardState {
  proposalId: string | null;
  completedSteps: number[];
  isUploading: boolean;
  setProposalId: (id: string) => void;
  markStepComplete: (step: number) => void;
  setUploading: (value: boolean) => void;
  reset: () => void;
}

export const useProposalWizardStore = create<ProposalWizardState>((set) => ({
  proposalId: null,
  completedSteps: [],
  isUploading: false,

  setProposalId: (id) => set({ proposalId: id }),
  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: Array.from(new Set([...state.completedSteps, step])),
    })),
  setUploading: (value) => set({ isUploading: value }),
  reset: () => set({ proposalId: null, completedSteps: [], isUploading: false }),
}));

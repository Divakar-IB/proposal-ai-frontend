import { create } from "zustand";
import type { KnowledgeMatch, GenerationMode } from "@/types";

export interface GenerationConfig {
  pageCount: number;
  generationMode: GenerationMode;
}

interface ProposalWizardState {
  proposalId: string | null;
  completedSteps: number[];
  summary: string | null;
  knowledgeMatches: KnowledgeMatch[];
  isUploading: boolean;
  generationConfig: GenerationConfig | null;
  setProposalId: (id: string) => void;
  markStepComplete: (step: number) => void;
  setUploadResult: (summary: string | null, knowledgeMatches: KnowledgeMatch[]) => void;
  setUploading: (value: boolean) => void;
  setGenerationConfig: (config: GenerationConfig) => void;
  reset: () => void;
}

export const useProposalWizardStore = create<ProposalWizardState>((set) => ({
  proposalId: null,
  completedSteps: [],
  summary: null,
  knowledgeMatches: [],
  isUploading: false,
  generationConfig: null,

  setProposalId: (id) => set({ proposalId: id }),
  markStepComplete: (step) =>
    set((state) => ({
      completedSteps: Array.from(new Set([...state.completedSteps, step])),
    })),
  setUploadResult: (summary, knowledgeMatches) => set({ summary, knowledgeMatches }),
  setUploading: (value) => set({ isUploading: value }),
  setGenerationConfig: (config) => set({ generationConfig: config }),
  reset: () => set({
    proposalId: null,
    completedSteps: [],
    summary: null,
    knowledgeMatches: [],
    isUploading: false,
    generationConfig: null,
  }),
}));

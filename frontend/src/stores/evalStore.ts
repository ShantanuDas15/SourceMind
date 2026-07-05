import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { evaluate } from '../api/eval';

export interface EvalResult {
  faithfulness: number;
  answer_relevancy: number;
  isEvaluating: boolean;
  error?: string;
}

interface EvalState {
  evaluations: Record<string, EvalResult>;
  isDashboardOpen: boolean;
  setDashboardOpen: (isOpen: boolean) => void;
  evaluateMessage: (messageId: string, question: string, answer: string, sessionId: string, contexts?: string[]) => Promise<void>;
  clearEvaluation: (messageId: string) => void;
}

export const useEvalStore = create<EvalState>()(
  persist(
    (set, get) => ({
      evaluations: {},
      isDashboardOpen: false,
      setDashboardOpen: (isOpen) => set({ isDashboardOpen: isOpen }),

      evaluateMessage: async (messageId, question, answer, sessionId, contexts) => {
        // Prevent overlapping evaluations
        const current = get().evaluations[messageId];
        if (current?.isEvaluating) return;

        set((state) => ({
          evaluations: {
            ...state.evaluations,
            [messageId]: { faithfulness: 0, answer_relevancy: 0, isEvaluating: true },
          },
        }));

        try {
          const result = await evaluate(question, answer, sessionId, contexts);
          set((state) => ({
            evaluations: {
              ...state.evaluations,
              [messageId]: {
                faithfulness: result.faithfulness,
                answer_relevancy: result.answer_relevancy,
                isEvaluating: false,
              },
            },
          }));
        } catch (error: any) {
          set((state) => ({
            evaluations: {
              ...state.evaluations,
              [messageId]: {
                faithfulness: 0,
                answer_relevancy: 0,
                isEvaluating: false,
                error: error.message || 'Evaluation failed',
              },
            },
          }));
        }
      },

      clearEvaluation: (messageId) => {
        set((state) => {
          const newEvals = { ...state.evaluations };
          delete newEvals[messageId];
          return { evaluations: newEvals };
        });
      },
    }),
    {
      name: 'sm-evaluations',
    }
  )
);

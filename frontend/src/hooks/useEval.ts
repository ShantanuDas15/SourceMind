import { useEvalStore } from '../stores/evalStore';

export function useEval() {
  const store = useEvalStore();
  
  return {
    evaluations: store.evaluations,
    isDashboardOpen: store.isDashboardOpen,
    setDashboardOpen: store.setDashboardOpen,
    evaluateMessage: store.evaluateMessage,
    clearEvaluation: store.clearEvaluation,
  };
}

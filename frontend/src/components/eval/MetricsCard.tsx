import { BarChart3, CheckCircle2, AlertCircle, Loader2, Play } from 'lucide-react';
import { useEvalStore } from '../../stores/evalStore';

interface MetricsCardProps {
  messageId: string;
  question: string;
  answer: string;
  sessionId: string;
  contexts?: string[];
}

const getScoreColor = (score: number) => {
  if (score >= 0.8) return 'bg-emerald-500 text-emerald-700 dark:text-emerald-400';
  if (score >= 0.5) return 'bg-amber-500 text-amber-700 dark:text-amber-400';
  return 'bg-red-500 text-red-700 dark:text-red-400';
};

export function MetricsCard({ messageId, question, answer, sessionId, contexts }: MetricsCardProps) {
  const { evaluations, evaluateMessage } = useEvalStore();
  const evaluation = evaluations[messageId];

  const handleEvaluate = () => {
    evaluateMessage(messageId, question, answer, sessionId, contexts);
  };

  if (!evaluation) {
    return (
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleEvaluate}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full"
        >
          <Play className="w-3.5 h-3.5" />
          Evaluate RAG Performance
        </button>
      </div>
    );
  }

  if (evaluation.isEvaluating) {
    return (
      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800 animate-pulse">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
          Analyzing with Ragas (Llama 3)...
        </div>
      </div>
    );
  }

  if (evaluation.error) {
    return (
      <div className="mt-4 flex justify-end">
        <div className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-full border border-red-100 dark:border-red-900/30">
          <AlertCircle className="w-3.5 h-3.5" />
          {evaluation.error}
        </div>
      </div>
    );
  }

  const fColor = getScoreColor(evaluation.faithfulness);
  const rColor = getScoreColor(evaluation.answer_relevancy);

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-slate-800/60 w-full max-w-sm ml-auto shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <BarChart3 className="w-4 h-4 text-blue-500" />
        <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Ragas Evaluation
        </h4>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto" />
      </div>

      <div className="space-y-4">
        {/* Faithfulness */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Faithfulness</span>
            <span className={`text-xs font-bold ${fColor.split(' ')[1]} ${fColor.split(' ')[2]}`}>
              {(evaluation.faithfulness * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${fColor.split(' ')[0]}`}
              style={{ width: `${Math.max(evaluation.faithfulness * 100, 2)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Hallucination check against source context
          </p>
        </div>

        {/* Answer Relevancy */}
        <div>
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Answer Relevancy</span>
            <span className={`text-xs font-bold ${rColor.split(' ')[1]} ${rColor.split(' ')[2]}`}>
              {(evaluation.answer_relevancy * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${rColor.split(' ')[0]}`}
              style={{ width: `${Math.max(evaluation.answer_relevancy * 100, 2)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            Directness and relevance to the query
          </p>
        </div>
      </div>
    </div>
  );
}

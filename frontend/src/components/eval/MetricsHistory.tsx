import { useEvalStore } from '../../stores/evalStore';
import { useChatStore } from '../../stores/chatStore';

export function MetricsHistory() {
  const evaluations = useEvalStore(state => state.evaluations);
  const messagesBySession = useChatStore(state => state.messagesBySession);

  // # ponytail: simple linear search to join evaluations with messages across sessions
  const history = Object.entries(evaluations).map(([messageId, evalResult]) => {
    let question = "Unknown Question";
    let timestamp = 0;
    
    for (const [, messages] of Object.entries(messagesBySession)) {
      const idx = messages.findIndex(m => m.id === messageId);
      if (idx !== -1) {
        timestamp = messages[idx].timestamp;
        if (idx > 0) {
          question = messages[idx - 1].content;
        }
        break;
      }
    }

    return {
      messageId,
      question,
      timestamp,
      evalResult
    };
  }).filter(h => h.timestamp > 0).sort((a, b) => b.timestamp - a.timestamp);

  if (history.length === 0) {
    return <div className="text-sm text-slate-500 dark:text-slate-400 p-8 text-center">No evaluations run yet. Evaluate a response to see it here.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Time</th>
            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Question Preview</th>
            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Faithfulness</th>
            <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-400">Relevancy</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {history.map((row) => (
            <tr key={row.messageId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200 max-w-sm truncate" title={row.question}>
                {row.question}
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.evalResult.faithfulness >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {(row.evalResult.faithfulness * 100).toFixed(0)}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.evalResult.answer_relevancy >= 0.8 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  {(row.evalResult.answer_relevancy * 100).toFixed(0)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

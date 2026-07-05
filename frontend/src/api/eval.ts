// ponytail: native fetch, no axios boilerplate
export const evaluate = async (question: string, answer: string, sessionId: string, contexts?: string[]) => {
  const res = await fetch('/api/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, answer, session_id: sessionId, contexts })
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
};

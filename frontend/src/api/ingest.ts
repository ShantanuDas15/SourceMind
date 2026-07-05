// ponytail: native fetch, no axios or unnecessary abstraction
const handleResponse = async (res: Response) => {
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export const ingestUrl = async (url: string, sessionId: string) => 
  handleResponse(await fetch(`/api/ingest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url, session_id: sessionId }) }));

export const ingestPdf = async (file: File, sessionId: string) => {
  const data = new FormData();
  data.append('file', file);
  return handleResponse(await fetch(`/api/ingest/pdf?session_id=${encodeURIComponent(sessionId)}`, { method: 'POST', body: data }));
};

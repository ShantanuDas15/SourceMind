// ponytail: native fetch for sources CRUD
const base = '/api/sources';

export const getSources = async (sessionId: string) => 
  (await fetch(`${base}/${sessionId}`)).json();

export const saveSources = async (sessionId: string, sources: any[]) => 
  (await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, sources })
  })).json();

export const clearSources = async (sessionId: string) => 
  (await fetch(`${base}/${sessionId}`, { method: 'DELETE' })).json();

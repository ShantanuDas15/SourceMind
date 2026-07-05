// ponytail: native fetch for chat history CRUD
const base = '/api/query';

export const getHistory = async (sessionId: string) => 
  (await fetch(`${base}/${sessionId}`)).json();

export const saveHistory = async (sessionId: string, messages: any[]) => 
  (await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, messages })
  })).json();

export const clearHistory = async (sessionId: string) => 
  (await fetch(`${base}/${sessionId}`, { method: 'DELETE' })).json();

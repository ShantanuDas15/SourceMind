// ponytail: native fetch generator, no boilerplate
export async function* startStream(url: string, body: any, signal?: AbortSignal) {
  const res = await fetch(url, { 
    method: 'POST', 
    headers: { 'Content-Type': 'application/json', 'Accept': 'text/event-stream' }, 
    body: JSON.stringify(body),
    signal
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      if (line.startsWith('data: ') && !line.includes('[DONE]')) {
        try { yield JSON.parse(line.slice(6).trim()); } catch {}
      }
    }
  }
}

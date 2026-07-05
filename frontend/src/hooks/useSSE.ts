// ponytail: minimal hook wrapper around startStream
import { useState } from 'react';
import { startStream } from '../api/stream';

export function useSSE() {
  const [isStreaming, setIsStreaming] = useState(false);
  const stream = async (url: string, body: any, onData: (d: any) => void) => {
    setIsStreaming(true);
    try {
      for await (const chunk of startStream(url, body)) onData(chunk);
    } finally {
      setIsStreaming(false);
    }
  };
  return { stream, isStreaming };
}

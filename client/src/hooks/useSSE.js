import { useState, useRef, useCallback } from 'react';

// Hook for consuming server-sent streaming responses from the AI endpoints.
// Uses the Fetch API (not EventSource) because EventSource only supports GET
// and our AI chat endpoint requires a POST body.
//
// Usage:
//   const { content, sources, loading, stream } = useSSE();
//   await stream('/api/ai/chat', { question, courseId });
export function useSSE() {
  const [content, setContent] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const stream = useCallback(async (url, body) => {
    // Abort any in-flight stream before starting a new one
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setContent('');
    setSources([]);
    setLoading(true);

    const token = localStorage.getItem('token');
    const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    // Read chunks until the stream closes or [DONE] sentinel is received
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      // Parse SSE lines: "data: {...}" or "data: [DONE]"
      for (const line of text.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') { setLoading(false); return; }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.chunk) setContent((prev) => prev + parsed.chunk);
          if (parsed.sources) setSources(parsed.sources);
        } catch {
          // Non-JSON delta — append raw text
          setContent((prev) => prev + payload);
        }
      }
    }
    setLoading(false);
  }, []);

  const reset = useCallback(() => {
    setContent('');
    setSources([]);
    setLoading(false);
  }, []);

  return { content, sources, loading, stream, reset };
}

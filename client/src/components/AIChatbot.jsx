import { useState, useRef, useEffect, useCallback } from 'react';

// Detects courseId from /courses/:id or /courses/:id/* URLs
function useCourseIdFromPath() {
  const [courseId, setCourseId] = useState(() => {
    const m = window.location.pathname.match(/^\/courses\/([^/]+)/);
    return m ? m[1] : null;
  });

  useEffect(() => {
    const update = () => {
      const m = window.location.pathname.match(/^\/courses\/([^/]+)/);
      setCourseId(m ? m[1] : null);
    };
    window.addEventListener('popstate', update);
    // React Router pushes via history.pushState — intercept it
    const origPush = history.pushState.bind(history);
    history.pushState = (...args) => { origPush(...args); update(); };
    const origReplace = history.replaceState.bind(history);
    history.replaceState = (...args) => { origReplace(...args); update(); };
    return () => {
      window.removeEventListener('popstate', update);
      history.pushState = origPush;
      history.replaceState = origReplace;
    };
  }, []);

  return courseId;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState('');
  const [streaming, setStreaming] = useState(false);
  const [courseName, setCourseName] = useState(null);
  const courseId = useCourseIdFromPath();
  const bottomRef  = useRef(null);
  const textareaRef = useRef(null);
  const abortRef   = useRef(null);

  // Fetch course title whenever courseId changes
  useEffect(() => {
    if (!courseId) { setCourseName(null); return; }
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    fetch(`${base}/courses/${courseId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setCourseName(data?.course?.title ?? data?.title ?? null))
      .catch(() => setCourseName(null));
  }, [courseId]);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streaming]);

  // Auto-grow textarea (max 4 rows)
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineH = parseInt(getComputedStyle(ta).lineHeight, 10) || 20;
    ta.style.height = Math.min(ta.scrollHeight, lineH * 4) + 'px';
  }, [input]);

  const send = useCallback(async () => {
    const query = input.trim();
    if (!query || streaming) return;

    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: query },
      { role: 'assistant', content: '', sources: [] },
    ]);
    setInput('');
    setStreaming(true);

    const token = localStorage.getItem('token');
    const base  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${base}/ai/content-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ query, courseId, history }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Request failed');

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const updateLast = (updater) =>
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = updater(next[next.length - 1]);
          return next;
        });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') break;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.chunk !== undefined) {
              updateLast((msg) => ({ ...msg, content: msg.content + parsed.chunk }));
            } else if (parsed.sources) {
              updateLast((msg) => ({ ...msg, sources: parsed.sources }));
            }
          } catch { /* ignore malformed line */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: 'Sorry, something went wrong. Please try again.' };
          return next;
        });
      }
    } finally {
      setStreaming(false);
    }
  }, [input, streaming, messages, courseId]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating bubble button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110"
        aria-label="Toggle AI chatbot"
      >
        {isOpen ? '×' : '💬'}
        {/* Unread dot */}
        {!isOpen && messages.length > 0 && (
          <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Slide-in panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-96 bg-white shadow-xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm">EduFlow AI Assistant</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 rounded-full px-2 py-0.5 font-medium">
              Powered by Claude
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="Close chatbot"
          >
            ×
          </button>
        </div>

        {/* Subheader */}
        <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100 text-xs text-indigo-700">
          {courseId && courseName
            ? `Answering from: ${courseName}`
            : courseId
            ? 'Answering from: this course'
            : 'Ask about any enrolled course'}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[85%] bg-indigo-600 text-white text-sm px-4 py-2.5 rounded-l-xl rounded-tr-xl leading-relaxed">
                  {msg.content}
                </div>
              ) : (
                <>
                  <div className="max-w-[85%] bg-white border border-slate-200 border-l-4 border-l-indigo-500 text-slate-800 text-sm px-4 py-2.5 rounded-r-xl rounded-tl-xl leading-relaxed whitespace-pre-wrap shadow-sm">
                    {msg.content}
                    {/* Cursor blink while streaming last assistant message */}
                    {streaming && i === messages.length - 1 && (
                      <span className="inline-block w-0.5 h-3.5 bg-indigo-500 ml-0.5 animate-pulse align-middle" />
                    )}
                  </div>
                  {/* Citation pills */}
                  {msg.sources?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-[85%]">
                      {msg.sources.map((s, si) => (
                        <span
                          key={si}
                          className="text-xs bg-indigo-100 text-slate-500 rounded px-2 py-0.5"
                        >
                          [Lesson: {s.lessonTitle}]
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* Typing indicator — only show when streaming hasn't started yet */}
          {streaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex items-start">
              <div className="bg-slate-100 rounded-r-xl rounded-tl-xl px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a question about this course..."
            rows={1}
            disabled={streaming}
            className="flex-1 resize-none bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors disabled:opacity-50 overflow-y-auto"
            style={{ maxHeight: '96px' }}
          />
          <button
            onClick={send}
            disabled={streaming || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors shrink-0"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

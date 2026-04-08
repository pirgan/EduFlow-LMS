import { useState, useRef, useEffect } from 'react';
import api from '../api/axios.js';

// Floating AI chatbot — persists across all pages (mounted outside <Routes> in App.jsx).
// UI: indigo bubble (bottom-right) → slide-in right panel (w-96, full height).
// Sources returned by the RAG endpoint are shown as citation pills below AI messages.
export default function AIChatbot({ courseId }) {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! Ask me anything about the course content.' },
  ]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { question: q, courseId });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.sources },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl transition-transform hover:scale-110"
        aria-label="Open AI tutor"
      >
        {open ? '✕' : '🤖'}
      </button>

      {/* Slide-in chat panel */}
      <div
        className={`fixed top-0 right-0 z-40 h-full w-96 bg-white shadow-2xl border-l border-[#EEF0F2] flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#EEF0F2] bg-indigo-600 text-white">
          <span className="text-xl">🤖</span>
          <div>
            <p className="font-semibold text-sm">AI Tutor</p>
            <p className="text-xs opacity-75">Powered by Claude</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-[#F7F8FA] text-[#1A1A1A] rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
              {/* Source citation pills */}
              {msg.sources?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1 max-w-[85%]">
                  {msg.sources.map((s, si) => (
                    <span key={si} className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5 border border-indigo-100">
                      {s.source} — {s.section}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div className="flex items-start">
              <div className="bg-[#F7F8FA] rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-2 h-2 bg-[#888] rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="p-3 border-t border-[#EEF0F2] flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about the course…"
            rows={1}
            className="flex-1 resize-none bg-[#F7F8FA] border border-[#EEF0F2] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-colors"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl px-4 text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}

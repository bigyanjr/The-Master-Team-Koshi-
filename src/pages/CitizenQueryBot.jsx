import { useState, useRef, useEffect } from 'react';
import { MUNICIPALITY_DEMO } from '../config/branding';
import { Link } from 'react-router-dom';
import { Bot, Send, User, Sparkles, Shield, Zap, Globe } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { SUGGESTED_QUESTIONS } from '../utils/citizenQueryEngine';
import { respondAsWardMitra } from '../ai/wardMitraResponder';
import { WARD_MITRA_INTRO, WARD_MITRA_NAME } from '../ai/wardMitraConfig';

function ChatMessage({ role, content, timestamp }) {
  const isBot = role === 'bot';
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`shrink-0 h-9 w-9 rounded-xl flex items-center justify-center shadow-sm ${
        isBot
          ? 'bg-gradient-to-br from-brand-600 to-brand-800 text-white'
          : 'bg-slate-200 text-slate-600'
      }`}>
        {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className={`max-w-[88%] sm:max-w-[78%] ${isBot ? '' : 'text-right'}`}>
        <div className={`inline-block text-left rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
          isBot
            ? 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-sm'
            : 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-sm'
        }`}>
          {content}
        </div>
        {timestamp && (
          <p className={`text-[10px] text-slate-400 mt-1 ${isBot ? '' : 'text-right'}`}>{timestamp}</p>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white flex items-center justify-center shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="text-xs text-slate-400 ml-2">{WARD_MITRA_NAME} is thinking…</span>
        </div>
      </div>
    </div>
  );
}

export default function CitizenQueryBot() {
  const { publicProjects, wards } = useData();
  const { profile } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `${WARD_MITRA_INTRO}\n\nTry English or Roman Nepali:\n• "Where did ward budget go?"\n• "Ward budget kaha kharcha bhayo?"\n• "Show high risk projects"`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const submitQuestion = (question) => {
    const q = question.trim();
    if (!q || typing) return;

    const time = new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: q, timestamp: time }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const { answer } = respondAsWardMitra({
        question: q,
        userProfile: profile,
        projects: publicProjects,
        wards,
      });
      setMessages((prev) => [...prev, { role: 'bot', content: answer, timestamp: time }]);
      setTyping(false);
    }, 650);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] dashboard-bg">
      <div className="page-container py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-slate-200/90 text-slate-600 text-[11px] font-semibold mb-5">
            <Sparkles className="h-3.5 w-3.5 text-brand-700" />
            AI-Powered · Local Data · Instant Answers
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Ask {WARD_MITRA_NAME}
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed">
            Your Itahari civic assistant — answers from public project records on {MUNICIPALITY_DEMO}.
          </p>
        </div>

        {/* Chat container */}
        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden card-shadow-md max-w-4xl mx-auto">
          <div className="px-5 py-4 bg-brand-900 text-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{WARD_MITRA_NAME}</p>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  WardWatch Itahari · {publicProjects.length} published project{publicProjects.length !== 1 ? 's' : ''} indexed
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-brand-200 bg-white/10 px-3 py-1.5 rounded-full">
              <Globe className="h-3.5 w-3.5" />
              EN + Roman Nepali
            </div>
          </div>

          {/* Messages */}
          <div className="h-[min(52vh,480px)] overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30">
            {messages.map((msg, i) => (
              <ChatMessage key={`${msg.role}-${i}`} {...msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div className="border-t border-slate-100 bg-white p-4 sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Try a demo question
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submitQuestion(q)}
                  disabled={typing}
                  className="text-xs px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800 transition-all disabled:opacity-50 font-medium"
                >
                  {q}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitQuestion(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about ward budget, delays, risk, contractors…"
                disabled={typing}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-300 transition-colors disabled:opacity-60"
              />
              <Button type="submit" icon={Send} disabled={typing || !input.trim()} className="shrink-0">
                {typing ? '…' : 'Send'}
              </Button>
            </form>

            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-100">
              <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Answers are generated from public project data.</strong> They are informational summaries — not legal findings or accusations.{' '}
                <Link to="/dashboard" className="underline font-medium hover:text-blue-900">View dashboard →</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

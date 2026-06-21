import { useState, useRef, useEffect } from 'react';
import { MUNICIPALITY_NAME } from '../config/branding';
import { Link } from 'react-router-dom';
import { Bot, Send, User, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { SUGGESTED_QUESTIONS } from '../utils/citizenQueryEngine';
import { respondAsWardMitra } from '../ai/wardMitraResponder';
import { WARD_MITRA_INTRO, WARD_MITRA_NAME } from '../ai/wardMitraConfig';
import { useLanguage } from '../context/LanguageContext';

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
            ? 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200'
            : 'bg-gradient-to-br from-brand-600 to-brand-700 text-white rounded-tr-sm'
        }`}>
          {content}
        </div>
        {timestamp && (
          <p className={`text-xs text-slate-400 mt-1 dark:text-slate-500 ${isBot ? '' : 'text-right'}`}>{timestamp}</p>
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
      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-2 w-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          <span className="text-xs text-slate-400 ml-2 dark:text-slate-500">{WARD_MITRA_NAME} is thinking…</span>
        </div>
      </div>
    </div>
  );
}

export default function CitizenQueryBot() {
  const { publicProjects, wards, getWardBudgetSummary } = useData();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: `${WARD_MITRA_INTRO}\n\nTry English or Roman Nepali:\n• "Where did ward budget go?"\n• "Ward budget kaha kharcha bhayo?"\n• "Which projects are delayed?"`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const submitQuestion = async (question) => {
    const q = question.trim();
    if (!q || typing) return;

    const time = new Date().toLocaleTimeString('en-NP', { hour: '2-digit', minute: '2-digit' });
    setMessages((prev) => [...prev, { role: 'user', content: q, timestamp: time }]);
    setInput('');
    setTyping(true);

    try {
      const { answer } = await respondAsWardMitra({
        question: q,
        userProfile: profile,
        projects: publicProjects,
        wards,
        getWardBudgetSummary,
      });
      setMessages((prev) => [...prev, { role: 'bot', content: answer, timestamp: time }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'bot',
        content: 'Sorry, something went wrong answering that. Please try again.',
        timestamp: time,
      }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] dashboard-bg">
      <div className="page-container py-8 sm:py-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-50">
            Ask {WARD_MITRA_NAME}
          </h1>
          <p className="text-slate-500 mt-3 max-w-xl mx-auto leading-relaxed text-base dark:text-slate-400">
            Your civic assistant for {MUNICIPALITY_NAME} — answers from published ward records only.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden card-shadow-md max-w-4xl mx-auto dark:bg-slate-900 dark:border-slate-800">
          <div className="px-5 py-4 bg-brand-900 text-white flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">{WARD_MITRA_NAME}</p>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {publicProjects.length} published project{publicProjects.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <div className="h-[min(52vh,480px)] overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/30 dark:bg-slate-950/40">
            {messages.map((msg, i) => (
              <ChatMessage key={`${msg.role}-${i}`} {...msg} />
            ))}
            {typing && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-slate-100 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-600 mb-3 dark:text-slate-300">{t('ask.tryAsking')}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => submitQuestion(q)}
                  disabled={typing}
                  className="text-sm px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-200 hover:text-brand-800 transition-all disabled:opacity-50 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:border-emerald-800 dark:hover:text-emerald-300"
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
                placeholder={t('ask.inputPlaceholder')}
                disabled={typing}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 text-base bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-300 transition-colors disabled:opacity-60 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:bg-slate-800 dark:placeholder:text-slate-500"
              />
              <Button type="submit" icon={Send} size="md" disabled={typing || !input.trim()} className="shrink-0">
                {typing ? '…' : t('ask.send')}
              </Button>
            </form>

            <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-50/80 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/60">
              <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5 dark:text-blue-400" />
              <p className="text-xs text-blue-800 leading-relaxed dark:text-blue-300">
                Answers come from public ward records — not legal advice.{' '}
                <Link to="/dashboard" className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200">{t('ask.viewSpendingLink')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

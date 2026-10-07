import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import type { ChatMessage } from '../types';
import { Bot, Send, User, X, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>(() => {
    return localStorage.getItem('@taskman:chatSession') || crypto.randomUUID();
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('@taskman:chatSession', sessionId);
    loadHistory(sessionId);
  }, [sessionId]);

  const loadHistory = async (session: string) => {
    try {
      const history = await aiService.getChatHistory(session);
      setMessages(history);
    } catch {
      // History might be empty for a new session
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');

    // Optimistic user message
    const tempUserMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'USER',
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await aiService.chat(sessionId, userText);
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'ASSISTANT',
        content: response.message,
        createdAt: response.timestamp,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'ASSISTANT',
        content: 'Desculpe, ocorreu um erro ao consultar o assistente de IA. Verifique sua conexão e tente novamente.',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = () => {
    const newSession = crypto.randomUUID();
    setSessionId(newSession);
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Assistente IA Taskman
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Contextualizado com suas tarefas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewSession}
            title="Nova Conversa"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">Como posso ajudar hoje?</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Pergunte sobre suas tarefas pendentes, atrasos ou peça sugestões de priorização para o seu dia.
            </p>
            <div className="mt-4 flex flex-col gap-2 max-w-xs mx-auto">
              <button
                onClick={() => setInput('Quais tarefas de alta prioridade eu tenho?')}
                className="text-xs text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors"
              >
                ⚡ "Quais tarefas de alta prioridade eu tenho?"
              </button>
              <button
                onClick={() => setInput('Existe alguma tarefa com prazo vencido?')}
                className="text-xs text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition-colors"
              >
                ⏰ "Existe alguma tarefa com prazo vencido?"
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'USER' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs ${
                msg.role === 'USER'
                  ? 'bg-blue-600 text-white'
                  : 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
              }`}
            >
              {msg.role === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'USER'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-tl-none shadow-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-600/30 text-purple-300 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800 text-slate-400 border border-slate-700/60 rounded-2xl rounded-tl-none p-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              <span>Pensando e consultando suas tarefas...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Envie uma mensagem para a IA..."
          disabled={loading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3.5 text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-xl disabled:opacity-40 transition-colors shadow-lg shadow-purple-600/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

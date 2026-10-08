import React, { useEffect, useRef, useState } from 'react';
import { aiService } from '../services/aiService';
import type { ChatMessage } from '../types';
import { Bot, Send, User, X, Loader2, Sparkles, RefreshCw, CheckCircle2, Calendar } from 'lucide-react';

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
    aiService.getChatHistory(sessionId)
      .then((history) => {
        setMessages(history);
      })
      .catch(() => {
        // History might be empty for a new session
      });
  }, [sessionId]);

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
        createdTasks: response.createdTasks,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (response.createdTasks && response.createdTasks.length > 0) {
        window.dispatchEvent(
          new CustomEvent('taskman:task-created', { detail: response.createdTasks })
        );
      }
    } catch {
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
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Assistente IA Taskman
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-500">Contextualizado com suas tarefas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleNewSession}
            title="Nova Conversa"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto mb-3">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">Como posso ajudar hoje?</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Pergunte sobre suas tarefas pendentes, atrasos ou peça sugestões de priorização para o seu dia.
            </p>
            <div className="mt-4 flex flex-col gap-2 max-w-xs mx-auto">
              <button
                onClick={() => setInput("Crie uma tarefa 'Revisar documentação da API' para amanhã com prioridade alta")}
                className="text-xs text-left p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 transition-colors cursor-pointer"
              >
                ✨ "Crie uma tarefa 'Revisar documentação da API' para amanhã com prioridade alta"
              </button>
              <button
                onClick={() => setInput('Quais tarefas de alta prioridade eu tenho?')}
                className="text-xs text-left p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 text-slate-700 border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer"
              >
                ⚡ "Quais tarefas de alta prioridade eu tenho?"
              </button>
              <button
                onClick={() => setInput('Existe alguma tarefa com prazo vencido?')}
                className="text-xs text-left p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 text-slate-700 border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer"
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
                  ? 'bg-orange-600 text-white'
                  : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}
            >
              {msg.role === 'USER' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'USER'
                  ? 'bg-orange-600 text-white rounded-tr-none shadow-xs'
                  : 'bg-slate-100 text-slate-800 border border-slate-200/80 rounded-tl-none shadow-xs'
              }`}
            >
              <div>{msg.content}</div>

              {msg.createdTasks && msg.createdTasks.length > 0 && (
                <div className="mt-3 space-y-2 pt-2 border-t border-slate-200/60">
                  {msg.createdTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 bg-white rounded-xl border border-purple-200/80 shadow-xs flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                          <CheckCircle2 className="w-3 h-3 text-purple-600" />
                          Tarefa Criada
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            t.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : t.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {t.priority === 'HIGH' ? 'Alta' : t.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{t.title}</p>
                      {t.dueDate && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Prazo: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl rounded-tl-none p-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>Pensando e consultando suas tarefas...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Envie uma mensagem para a IA..."
          disabled={loading}
          className="flex-1 bg-white border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white p-2.5 rounded-xl disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import type { TaskCreatePayload, TaskPriority, TaskResponse, TaskStatus } from '../types';
import { aiService } from '../services/aiService';
import { X, Sparkles, Loader2, Check } from 'lucide-react';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskCreatePayload & { status?: TaskStatus }) => Promise<void>;
  initialData?: TaskResponse | null;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Improvement State
  const [improving, setImproving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ title: string; description: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPriority(initialData.priority);
      setStatus(initialData.status);
      setDueDate(initialData.dueDate ? initialData.dueDate.slice(0, 16) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate('');
    }
    setAiSuggestion(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSubmitting(true);
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        status,
        dueDate: dueDate ? dueDate : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleImproveWithAi = async () => {
    if (!title.trim() || improving) return;

    try {
      setImproving(true);
      const result = await aiService.improveTask({ title, description });
      setAiSuggestion(result);
    } catch (err) {
      console.error('Falha ao aprimorar tarefa com IA:', err);
    } finally {
      setImproving(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setTitle(aiSuggestion.title);
    setDescription(aiSuggestion.description);
    setAiSuggestion(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <h2 className="text-lg font-bold text-white">
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-sm space-y-2">
              <div className="flex items-center justify-between text-purple-300 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Sugestão da IA
                </span>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Aplicar
                </button>
              </div>
              <p className="text-xs text-white font-medium">Título: {aiSuggestion.title}</p>
              <p className="text-xs text-slate-300 whitespace-pre-line">{aiSuggestion.description}</p>
            </div>
          )}

          {/* Title with AI button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Título da Tarefa *</label>
              <button
                type="button"
                onClick={handleImproveWithAi}
                disabled={improving || !title.trim()}
                className="text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
              >
                {improving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Aprimorando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Aprimorar com IA
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex.: Desenvolver integração com gateway de pagamento"
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Descrição detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Adicione escopo, regras de negócio ou contexto adicional..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            {initialData && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="TODO">A Fazer</option>
                  <option value="IN_PROGRESS">Em Andamento</option>
                  <option value="DONE">Concluída</option>
                </select>
              </div>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Prazo de Entrega</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

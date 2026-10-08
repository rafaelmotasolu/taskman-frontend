import React, { useState } from 'react';
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
  if (!isOpen) return null;

  return (
    <TaskFormDialog
      key={initialData ? initialData.id : 'new-task'}
      onClose={onClose}
      onSubmit={onSubmit}
      initialData={initialData}
    />
  );
};

const TaskFormDialog: React.FC<Omit<TaskFormModalProps, 'isOpen'>> = ({
  onClose,
  onSubmit,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority || 'MEDIUM');
  const [status, setStatus] = useState<TaskStatus>(initialData?.status || 'TODO');
  const [dueDate, setDueDate] = useState(initialData?.dueDate ? initialData.dueDate.slice(0, 16) : '');
  const [submitting, setSubmitting] = useState(false);

  // AI Improvement State
  const [improving, setImproving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{ title: string; description: string } | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* AI Suggestion Box */}
          {aiSuggestion && (
            <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-sm space-y-2">
              <div className="flex items-center justify-between text-purple-700 font-medium">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Sugestão da IA
                </span>
                <button
                  type="button"
                  onClick={handleApplyAiSuggestion}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Aplicar
                </button>
              </div>
              <p className="text-xs text-slate-900 font-semibold">Título: {aiSuggestion.title}</p>
              <p className="text-xs text-slate-600 whitespace-pre-line">{aiSuggestion.description}</p>
            </div>
          )}

          {/* Title with AI button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Título da Tarefa *</label>
              <button
                type="button"
                onClick={handleImproveWithAi}
                disabled={improving || !title.trim()}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Descrição detalhada</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Adicione escopo, regras de negócio ou contexto adicional..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="LOW">Baixa</option>
                <option value="MEDIUM">Média</option>
                <option value="HIGH">Alta</option>
              </select>
            </div>

            {initialData && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prazo de Entrega</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors border border-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : initialData ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

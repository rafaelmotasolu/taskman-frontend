import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmCompletionModalProps {
  isOpen: boolean;
  taskTitle: string;
  pendingCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmCompletionModal: React.FC<ConfirmCompletionModalProps> = ({
  isOpen,
  taskTitle,
  pendingCount,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Subtarefas Pendentes</h3>
              <p className="text-xs text-slate-500">Confirmação de conclusão em cascata</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3">
          <p className="text-sm font-semibold text-slate-800">
            Deseja concluir essa tarefa e todas as subtarefas relacionadas?
          </p>
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800 truncate">Tarefa: {taskTitle}</p>
            {pendingCount !== undefined && pendingCount > 0 && (
              <p className="text-amber-700 font-medium">
                Existem {pendingCount} subtarefa(s) ainda pendente(s). Ao confirmar, a tarefa principal e todas as suas etapas serão marcadas como concluídas.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            Concluir Todas
          </button>
        </div>
      </div>
    </div>
  );
};


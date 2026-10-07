import React, { useState } from 'react';
import type { TaskAnalysisResponse, TaskPriority } from '../types';
import { X, Sparkles, Clock, Layers, Flame, CheckCircle2, Check, Loader2 } from 'lucide-react';

interface TaskAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: TaskAnalysisResponse | null;
  taskTitle: string;
  currentPriority?: TaskPriority;
  onApplyPriority?: (priority: TaskPriority) => Promise<void>;
}

export const TaskAnalysisModal: React.FC<TaskAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  taskTitle,
  currentPriority,
  onApplyPriority,
}) => {
  const [applying, setApplying] = useState(false);

  if (!isOpen || !analysis) return null;

  const handleApply = async () => {
    if (!onApplyPriority) return;
    try {
      setApplying(true);
      await onApplyPriority(analysis.priority as TaskPriority);
      onClose();
    } finally {
      setApplying(false);
    }
  };

  const isDifferentPriority = currentPriority && analysis.priority !== currentPriority;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Análise Técnica com IA</h2>
              <p className="text-xs text-slate-500 truncate max-w-xs">{taskTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-3 gap-3">
            {/* Priority */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center text-rose-600 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">Prioridade</span>
              <span className="text-sm font-bold text-slate-900">{analysis.priority}</span>
            </div>

            {/* Complexity */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center text-amber-600 mb-1">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">Complexidade</span>
              <span className="text-sm font-bold text-slate-900">{analysis.complexity}</span>
            </div>

            {/* Estimated Hours */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <div className="flex items-center justify-center text-orange-600 mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 block">Estimativa</span>
              <span className="text-sm font-bold text-slate-900">{analysis.estimatedHours} horas</span>
            </div>
          </div>

          {/* Rationale / Reason */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
              Justificativa Técnica
            </h4>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 leading-relaxed">
              {analysis.reason}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors border border-slate-200"
          >
            Fechar
          </button>

          {isDifferentPriority && onApplyPriority && (
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-sm"
            >
              {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Adotar Prioridade {analysis.priority}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

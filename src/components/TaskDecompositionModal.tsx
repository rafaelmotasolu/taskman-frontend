import React, { useState } from 'react';
import type { SubtaskItem } from '../types';
import { X, Sparkles, Check, Loader2 } from 'lucide-react';

interface TaskDecompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtasks: SubtaskItem[];
  taskTitle: string;
  onApply: (selectedSubtasks: SubtaskItem[]) => Promise<void>;
}

export const TaskDecompositionModal: React.FC<TaskDecompositionModalProps> = ({
  isOpen,
  onClose,
  subtasks,
  taskTitle,
  onApply,
}) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>(() =>
    subtasks.map((_, i) => i)
  );
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const toggleIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleApply = async () => {
    const toApply = subtasks.filter((_, i) => selectedIndices.includes(i));
    if (toApply.length === 0) return;

    try {
      setSaving(true);
      await onApply(toApply);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Decomposição em Subtarefas</h2>
              <p className="text-xs text-slate-400 truncate max-w-xs">{taskTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-400 mb-2">
            Selecione as etapas que deseja incorporar à tarefa principal:
          </p>

          {subtasks.map((item, index) => {
            const isSelected = selectedIndices.includes(index);
            return (
              <div
                key={index}
                onClick={() => toggleIndex(index)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-purple-600/10 border-purple-500/40 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'border-slate-700 bg-slate-900'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {selectedIndices.length} de {subtasks.length} selecionadas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={saving || selectedIndices.length === 0}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Incorporar Etapas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

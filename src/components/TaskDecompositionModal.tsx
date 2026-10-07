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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Decomposição em Subtarefas</h2>
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

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <p className="text-xs text-slate-500 mb-2">
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
                    ? 'bg-purple-50/70 border-purple-300 text-slate-900 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedIndices.length} de {subtasks.length} selecionadas
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-sm font-medium transition-colors border border-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={saving || selectedIndices.length === 0}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Incorporar Etapas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

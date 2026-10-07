import React, { useState } from 'react';
import type { SubtaskItem, TaskAnalysisResponse, TaskResponse, TaskStatus } from '../types';
import { taskService } from '../services/taskService';
import { aiService } from '../services/aiService';
import { TaskAnalysisModal } from './TaskAnalysisModal';
import { TaskDecompositionModal } from './TaskDecompositionModal';
import {
  X,
  Calendar,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Edit,
  Loader2,
  Check,
  Flame,
  Layers,
} from 'lucide-react';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: TaskResponse | null;
  onRefresh: () => void;
  onEdit: (task: TaskResponse) => void;
  onDelete: (id: string) => Promise<void>;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  isOpen,
  onClose,
  task,
  onRefresh,
  onEdit,
  onDelete,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [addingSubtask, setAddingSubtask] = useState(false);

  // AI states
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TaskAnalysisResponse | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  const [decomposing, setDecomposing] = useState(false);
  const [decompositionItems, setDecompositionItems] = useState<SubtaskItem[]>([]);
  const [isDecomposeModalOpen, setIsDecomposeModalOpen] = useState(false);

  if (!isOpen || !task) return null;

  const handleToggleSubtask = async (subtaskId: string, currentStatus: TaskStatus) => {
    try {
      const nextStatus: TaskStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
      await taskService.updateStatus(subtaskId, nextStatus);
      onRefresh();
    } catch (err) {
      console.error('Erro ao atualizar status da subtarefa:', err);
    }
  };

  const handleAddManualSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || addingSubtask) return;

    try {
      setAddingSubtask(true);
      await taskService.createSubtask(task.id, {
        title: newSubtaskTitle.trim(),
        priority: task.priority,
      });
      setNewSubtaskTitle('');
      onRefresh();
    } catch (err) {
      console.error('Erro ao adicionar subtarefa:', err);
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleAnalyze = async () => {
    try {
      setAnalyzing(true);
      const res = await aiService.analyzeTask(task.id);
      setAnalysisResult(res);
      setIsAnalysisModalOpen(true);
    } catch (err) {
      console.error('Erro na análise da tarefa:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDecompose = async () => {
    try {
      setDecomposing(true);
      const res = await aiService.decomposeTask(task.id);
      setDecompositionItems(res.subtasks);
      setIsDecomposeModalOpen(true);
    } catch (err) {
      console.error('Erro ao decompor tarefa:', err);
    } finally {
      setDecomposing(false);
    }
  };

  const handleApplyDecomposition = async (selected: SubtaskItem[]) => {
    for (const item of selected) {
      await taskService.createSubtask(task.id, {
        title: item.title,
        description: item.description,
        priority: task.priority,
      });
    }
    onRefresh();
  };

  const completedSubtasks = task.subtasks.filter((s) => s.status === 'DONE').length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/40">
            <div className="space-y-1.5 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    task.status === 'DONE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {task.status === 'DONE' ? 'Concluída' : task.status === 'IN_PROGRESS' ? 'Em Progresso' : 'A Fazer'}
                </span>

                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    task.priority === 'HIGH'
                      ? 'text-rose-400'
                      : task.priority === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Prioridade {task.priority}
                </span>

                {task.dueDate && (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white break-words">{task.title}</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Description */}
            {task.description ? (
              <div className="space-y-1.5">
                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Descrição</h4>
                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/80">
                  {task.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Sem descrição informada.</p>
            )}

            {/* AI Action Buttons */}
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/30 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-purple-300">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Recursos Inteligentes do Taskman:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                  Análise Técnica
                </button>

                <button
                  type="button"
                  onClick={handleDecompose}
                  disabled={decomposing}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-40"
                >
                  {decomposing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Decompor em Etapas
                </button>
              </div>
            </div>

            {/* Subtasks / Etapas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-400" />
                  Etapas e Subtarefas ({completedSubtasks}/{totalSubtasks})
                </h4>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-semibold text-blue-400">{progressPercent}% concluído</span>
                )}
              </div>

              {totalSubtasks > 0 && (
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {task.subtasks.map((st) => {
                  const isDone = st.status === 'DONE';
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleToggleSubtask(st.id, st.status)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isDone
                          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                          : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                            isDone ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                          {st.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Subtask input */}
              <form onSubmit={handleAddManualSubtask} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Adicionar nova etapa manualmente..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <button
                  type="submit"
                  disabled={addingSubtask || !newSubtaskTitle.trim()}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {addingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              Excluir Tarefa
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      <TaskAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        analysis={analysisResult}
        taskTitle={task.title}
      />

      <TaskDecompositionModal
        isOpen={isDecomposeModalOpen}
        onClose={() => setIsDecomposeModalOpen(false)}
        subtasks={decompositionItems}
        taskTitle={task.title}
        onApply={handleApplyDecomposition}
      />
    </>
  );
};

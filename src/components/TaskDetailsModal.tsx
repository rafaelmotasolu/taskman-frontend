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
    try {
      await aiService.applyApprovedSubtasks(task.id, selected);
      onRefresh();
    } catch (err) {
      console.error('Erro ao incorporar etapas aprovadas pela IA:', err);
    }
  };

  const completedSubtasks = task.subtasks.filter((s) => s.status === 'DONE').length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
        <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50">
            <div className="space-y-1.5 min-w-0 pr-4">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    task.status === 'DONE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {task.status === 'DONE' ? 'Concluída' : task.status === 'IN_PROGRESS' ? 'Em Progresso' : 'A Fazer'}
                </span>

                <span
                  className={`text-xs font-semibold flex items-center gap-1 ${
                    task.priority === 'HIGH'
                      ? 'text-rose-600'
                      : task.priority === 'MEDIUM'
                      ? 'text-amber-600'
                      : 'text-slate-500'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  Prioridade {task.priority}
                </span>

                {task.dueDate && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 break-words">{task.title}</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Description */}
            {task.description ? (
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  {task.description}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sem descrição informada.</p>
            )}

            {/* AI Action Buttons */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-700">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Recursos Inteligentes do Taskman:</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-purple-100/60 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Layers className="w-3.5 h-3.5" />}
                  Análise Técnica
                </button>

                <button
                  type="button"
                  onClick={handleDecompose}
                  disabled={decomposing}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer disabled:opacity-40"
                >
                  {decomposing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  Decompor em Etapas
                </button>
              </div>
            </div>

            {/* Subtasks / Etapas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                  Etapas e Subtarefas ({completedSubtasks}/{totalSubtasks})
                </h4>
                {totalSubtasks > 0 && (
                  <span className="text-xs font-semibold text-orange-600">{progressPercent}% concluído</span>
                )}
              </div>

              {totalSubtasks > 0 && (
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-600 rounded-full transition-all duration-300"
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
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-colors flex-shrink-0 ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3 h-3" />}
                        </div>
                        <span className={`text-sm ${isDone ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}`}>
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
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={addingSubtask || !newSubtaskTitle.trim()}
                  className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {addingSubtask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Adicionar
                </button>
              </form>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => onDelete(task.id)}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
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
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Edit className="w-3.5 h-3.5" />
                Editar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
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
        currentPriority={task.priority}
        onApplyPriority={async (newPriority) => {
          await taskService.updateTask(task.id, {
            title: task.title,
            description: task.description || undefined,
            priority: newPriority,
            status: task.status,
            dueDate: task.dueDate || undefined,
          });
          onRefresh();
        }}
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

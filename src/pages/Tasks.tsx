import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { taskService } from '../services/taskService';
import type { TaskCreatePayload, TaskPriority, TaskResponse, TaskStatus, TaskSummary } from '../types';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Hourglass,
  Layers,
  LayoutGrid,
  List,
  Loader2,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | ''>('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);

  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [searchParams] = useSearchParams();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.listTasks({ size: 100, rootOnly: true });
      setTasks(res.content);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (id: string) => {
    try {
      const fullTask = await taskService.getTaskById(id);
      setSelectedTask(fullTask);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Erro ao obter detalhes da tarefa:', err);
    }
  };

  useEffect(() => {
    taskService.listTasks({ size: 100, rootOnly: true })
      .then((res) => {
        setTasks(res.content);
      })
      .catch((err) => {
        console.error('Erro ao carregar tarefas:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle URL query param e.g. /tasks?selected=<id>
  useEffect(() => {
    const selectedId = searchParams.get('selected');
    if (selectedId) {
      taskService.getTaskById(selectedId)
        .then((fullTask) => {
          setSelectedTask(fullTask);
          setIsDetailsModalOpen(true);
        })
        .catch((err) => {
          console.error('Erro ao obter detalhes da tarefa:', err);
        });
    }
  }, [searchParams]);

  const handleRefreshSelectedTask = async () => {
    if (selectedTask) {
      const updated = await taskService.getTaskById(selectedTask.id);
      setSelectedTask(updated);
    }
    loadTasks();
  };

  const handleCreateOrUpdateTask = async (data: TaskCreatePayload & { status?: TaskStatus }) => {
    if (editingTask) {
      await taskService.updateTask(editingTask.id, {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate,
      });
    } else {
      await taskService.createTask(data);
    }
    setEditingTask(null);
    loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa e todas as suas etapas?')) return;
    try {
      await taskService.deleteTask(id);
      setIsDetailsModalOpen(false);
      setSelectedTask(null);
      loadTasks();
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: TaskStatus) => {
    try {
      await taskService.updateStatus(id, newStatus);
      loadTasks();
    } catch (err) {
      console.error('Erro ao atualizar status da tarefa:', err);
    }
  };

  // Filter tasks locally
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = selectedPriority ? t.priority === selectedPriority : true;
    return matchesSearch && matchesPriority;
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'IN_PROGRESS');
  const doneTasks = filteredTasks.filter((t) => t.status === 'DONE');

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Gestão de Tarefas</h1>
          <p className="text-sm text-slate-500 mt-1">Organize seu fluxo de trabalho visualmente com apoio de IA</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex items-center gap-1 shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização Kanban"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              setEditingTask(null);
              setIsFormModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar tarefas por título..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value as TaskPriority | '')}
            className="w-full sm:w-44 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
          >
            <option value="">Todas as Prioridades</option>
            <option value="HIGH">Alta Prioridade</option>
            <option value="MEDIUM">Média Prioridade</option>
            <option value="LOW">Baixa Prioridade</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Column TODO */}
          <KanbanColumn
            title="A Fazer"
            icon={<Clock className="w-4 h-4 text-slate-500" />}
            count={todoTasks.length}
            tasks={todoTasks}
            onSelectTask={handleOpenDetails}
            onNextStatus={(id) => handleQuickStatusChange(id, 'IN_PROGRESS')}
          />

          {/* Column IN_PROGRESS */}
          <KanbanColumn
            title="Em Andamento"
            icon={<Hourglass className="w-4 h-4 text-amber-500" />}
            count={inProgressTasks.length}
            tasks={inProgressTasks}
            onSelectTask={handleOpenDetails}
            onPrevStatus={(id) => handleQuickStatusChange(id, 'TODO')}
            onNextStatus={(id) => handleQuickStatusChange(id, 'DONE')}
          />

          {/* Column DONE */}
          <KanbanColumn
            title="Concluída"
            icon={<CheckCircle2 className="w-4 h-4 text-emerald-500" />}
            count={doneTasks.length}
            tasks={doneTasks}
            onSelectTask={handleOpenDetails}
            onPrevStatus={(id) => handleQuickStatusChange(id, 'IN_PROGRESS')}
          />
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Prazo</th>
                  <th className="py-3 px-4">Etapas</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                      Nenhuma tarefa encontrada.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => handleOpenDetails(t.id)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-medium text-slate-900">{t.title}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.status === 'DONE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {t.status === 'DONE' ? 'Concluída' : t.status === 'IN_PROGRESS' ? 'Em Progresso' : 'A Fazer'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-medium ${
                            t.priority === 'HIGH'
                              ? 'text-rose-600 font-semibold'
                              : t.priority === 'MEDIUM'
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-500'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {t.subtaskCount > 0 ? `${t.completedSubtaskCount}/${t.subtaskCount}` : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(t.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <TaskFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateOrUpdateTask}
        initialData={editingTask}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onRefresh={handleRefreshSelectedTask}
        onEdit={(task) => {
          setEditingTask(task);
          setIsFormModalOpen(true);
        }}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};

interface KanbanColumnProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  tasks: TaskSummary[];
  onSelectTask: (id: string) => void;
  onPrevStatus?: (id: string) => void;
  onNextStatus?: (id: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  title,
  icon,
  count,
  tasks,
  onSelectTask,
  onPrevStatus,
  onNextStatus,
}) => {
  return (
    <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-4 flex flex-col min-h-[500px]">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600 shadow-xs">
          {count}
        </span>
      </div>

      {/* Column Cards */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-white/40">
            Nenhuma tarefa nesta coluna
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              className="bg-white border border-slate-200 hover:border-orange-400 p-4 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer group space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {task.title}
                </h4>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Priority */}
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 ${
                    task.priority === 'HIGH'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : task.priority === 'MEDIUM'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  {task.priority}
                </span>

                {/* Due Date */}
                {task.dueDate && (
                  <span className="text-slate-500 text-[11px] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </span>
                )}

                {/* Subtask count */}
                {task.subtaskCount > 0 && (
                  <span className="text-slate-500 text-[11px] flex items-center gap-1 ml-auto">
                    <Layers className="w-3 h-3 text-purple-600" />
                    {task.completedSubtaskCount}/{task.subtaskCount}
                  </span>
                )}
              </div>

              {/* Status Move Quick Controls */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div>
                  {onPrevStatus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrevStatus(task.id);
                      }}
                      title="Mover para status anterior"
                      className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  {onNextStatus && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNextStatus(task.id);
                      }}
                      title="Avançar status"
                      className="p-1 rounded-md hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

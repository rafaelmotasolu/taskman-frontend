import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLayout } from '../hooks/useLayout';
import { taskService } from '../services/taskService';
import { TaskFormModal } from '../components/TaskFormModal';
import { TaskDetailsModal } from '../components/TaskDetailsModal';
import type { TaskCreatePayload, TaskResponse, TaskStatus, TaskSummary } from '../types';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Hourglass,
  Layers,
  ListTodo,
  Loader2,
  Menu,
  MessageSquare,
  Plus,
  Sparkles,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { openSidebar, openChat } = useLayout();
  const navigate = useNavigate();

  const [focusTasks, setFocusTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadFocusTasks = async () => {
    try {
      const res = await taskService.listTasks({ page: 0, size: 4, rootOnly: true });
      setFocusTasks(res.content);
    } catch (err) {
      console.error('Erro ao carregar tarefas no Hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    taskService.listTasks({ page: 0, size: 4, rootOnly: true })
      .then((res) => {
        setFocusTasks(res.content);
      })
      .catch((err) => {
        console.error('Erro ao carregar tarefas no Hub:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    const handleTaskCreated = () => {
      loadFocusTasks();
    };
    window.addEventListener('taskman:task-created', handleTaskCreated);
    return () => {
      window.removeEventListener('taskman:task-created', handleTaskCreated);
    };
  }, []);

  const handleCreateTask = async (payload: TaskCreatePayload & { status?: TaskStatus }) => {
    const created = await taskService.createTask(payload);
    if (payload.status && payload.status !== 'TODO') {
      await taskService.updateStatus(created.id, payload.status);
    }
    loadFocusTasks();
  };

  const handleOpenTaskDetails = async (id: string) => {
    try {
      const task = await taskService.getTaskById(id);
      setSelectedTask(task);
      setIsDetailsModalOpen(true);
    } catch (err) {
      console.error('Erro ao abrir detalhes da tarefa:', err);
    }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Hub Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50/90 via-white to-amber-50/40 border border-orange-100 p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/80 text-orange-700 border border-orange-200/80 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hub de Produtividade & IA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Olá, {user?.name?.split(' ')[0] || 'Produtor'}!
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Bem-vindo ao centro de comando do <strong className="text-slate-900">Taskman</strong>. Escolha uma funcionalidade abaixo para organizar seu fluxo, decompor metas ou interagir com o assistente inteligente.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-all shadow-md shadow-orange-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nova Tarefa
            </button>

            <button
              onClick={openChat}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-sm transition-all shadow-xs cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              Conversar com a IA
            </button>

            <button
              onClick={openSidebar}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all cursor-pointer border border-slate-200 shadow-xs"
            >
              <Menu className="w-4 h-4 text-slate-500" />
              Painel de Detalhes
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-orange-100/60 blur-3xl pointer-events-none" />
      </div>

      {/* Main Functionality Hub Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Módulos e Funcionalidades
          </h2>
          <span className="text-xs text-slate-500">Acesso rápido a todos os recursos</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Module 1: Kanban Board */}
          <div
            onClick={() => navigate('/tasks')}
            className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-orange-400 hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 border border-orange-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ListTodo className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                Quadro Kanban
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Gestão visual de tarefas organizada nas colunas A Fazer, Em Andamento e Concluídas com filtros por prioridade.
              </p>
            </div>

            <div className="pt-5 flex items-center text-xs font-semibold text-orange-600 group-hover:translate-x-1 transition-transform">
              <span>Abrir Quadro</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Module 2: AI Decomposition */}
          <div
            onClick={() => navigate('/tasks')}
            className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                  Decomposição com IA
                </h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  Llama 3.2
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Quebre tarefas complexas em etapas práticas estruturadas. Aprove e incorpore apenas as subtarefas desejadas.
              </p>
            </div>

            <div className="pt-5 flex items-center text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>Explorar Etapas</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Module 3: AI Assistant */}
          <div
            onClick={openChat}
            className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                Assistente de Produtividade
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Converse em linguagem natural com a IA para consultar prazos, pendências do dia e recomendações ágeis.
              </p>
            </div>

            <div className="pt-5 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Iniciar Chat</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>

          {/* Module 4: Análise Técnica & Prioridades */}
          <div
            onClick={() => navigate('/tasks')}
            className="group relative p-6 rounded-2xl bg-white border border-slate-200 hover:border-rose-400 hover:shadow-md transition-all duration-300 shadow-xs cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                Análise Técnica
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Estime complexidade arquitetural, esforço em horas e obtenha sugestões de prioridade calculadas pelo agente.
              </p>
            </div>

            <div className="pt-5 flex items-center text-xs font-semibold text-rose-600 group-hover:translate-x-1 transition-transform">
              <span>Ver Análises</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Focus Section: Tarefas Ativas em Foco */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tarefas em Foco</h2>
            <p className="text-xs text-slate-500 mt-0.5">Prioridades imediatas para sua rotina</p>
          </div>

          <button
            onClick={() => navigate('/tasks')}
            className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            Ver todas no Kanban <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-orange-600" />
          </div>
        ) : focusTasks.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            Nenhuma tarefa pendente no momento. Clique em "+ Nova Tarefa" para começar!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {focusTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => handleOpenTaskDetails(t.id)}
                className="p-4 rounded-xl bg-slate-50/70 hover:bg-orange-50/30 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer flex items-start justify-between gap-3 group shadow-xs"
              >
                <div className="space-y-2 min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors truncate">
                    {t.title}
                  </h4>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 ${
                        t.status === 'DONE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {t.status === 'DONE' ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : t.status === 'IN_PROGRESS' ? (
                        <Hourglass className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )}
                      {t.status === 'DONE' ? 'Concluída' : t.status === 'IN_PROGRESS' ? 'Em Progresso' : 'A Fazer'}
                    </span>

                    <span
                      className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        t.priority === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : t.priority === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-sky-50 text-sky-700 border-sky-200'
                      }`}
                    >
                      Prioridade {t.priority === 'HIGH' ? 'Alta' : t.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                    </span>

                    {t.dueDate && (
                      <span className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(t.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-2 rounded-lg text-slate-400 group-hover:text-orange-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
        initialData={null}
      />

      {/* Details Modal */}
      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onRefresh={() => {
          if (selectedTask) {
            taskService.getTaskById(selectedTask.id).then(setSelectedTask);
          }
          loadFocusTasks();
        }}
        onEdit={() => {
          setIsDetailsModalOpen(false);
          navigate('/tasks');
        }}
        onDelete={async (id) => {
          await taskService.deleteTask(id);
          setIsDetailsModalOpen(false);
          loadFocusTasks();
        }}
      />
    </div>
  );
};

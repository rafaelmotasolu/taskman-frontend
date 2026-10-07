import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { taskService } from '../services/taskService';
import type { TaskDashboardMetrics, TaskSummary } from '../types';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Hourglass,
  ListTodo,
  Loader2,
  Plus,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<TaskDashboardMetrics | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [dashMetrics, tasksPage] = await Promise.all([
        taskService.getDashboard(),
        taskService.listTasks({ page: 0, size: 5, rootOnly: true }),
      ]);
      setMetrics(dashMetrics);
      setRecentTasks(tasksPage.content);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const completionRate =
    metrics && metrics.totalTasks > 0
      ? Math.round((metrics.doneTasks / metrics.totalTasks) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Painel de Controle</h1>
          <p className="text-sm text-slate-400 mt-1">Acompanhe seu fluxo de produtividade e metas em andamento</p>
        </div>

        <Link
          to="/tasks"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/20 w-fit"
        >
          <Plus className="w-4 h-4" />
          Gerenciar Tarefas
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Total</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.totalTasks ?? 0}</div>
        </div>

        {/* TODO */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">A Fazer</span>
            <div className="p-2 rounded-xl bg-slate-700/30 text-slate-300">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.todoTasks ?? 0}</div>
        </div>

        {/* IN_PROGRESS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Em Andamento</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.inProgressTasks ?? 0}</div>
        </div>

        {/* DONE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Concluídas</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.doneTasks ?? 0}</div>
        </div>

        {/* HIGH PRIORITY */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Alta Prioridade</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{metrics?.highPriorityTasks ?? 0}</div>
        </div>

        {/* OVERDUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Atrasadas</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white text-red-400">{metrics?.overdueTasks ?? 0}</div>
        </div>
      </div>

      {/* Progress & Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-white">Taxa de Conclusão Global</span>
          <span className="text-sm font-bold text-blue-400">{completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Recent / Upcoming Tasks Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Tarefas Recentes</h2>
          </div>
          <Link
            to="/tasks"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
          >
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Nenhuma tarefa cadastrada ainda. Comece criando sua primeira tarefa!
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentTasks.map((t) => (
              <div key={t.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{t.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        t.status === 'DONE'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'IN_PROGRESS'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {t.status === 'DONE' ? 'Concluída' : t.status === 'IN_PROGRESS' ? 'Em Progresso' : 'A Fazer'}
                    </span>

                    <span
                      className={`font-medium ${
                        t.priority === 'HIGH'
                          ? 'text-rose-400'
                          : t.priority === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {t.priority === 'HIGH' ? 'Alta' : t.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                    </span>

                    {t.dueDate && (
                      <span>Vence: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>
                    )}

                    {t.subtaskCount > 0 && (
                      <span className="text-slate-500">
                        {t.completedSubtaskCount}/{t.subtaskCount} etapas
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  to={`/tasks?selected=${t.id}`}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

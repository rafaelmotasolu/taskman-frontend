import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import type { TaskDashboardMetrics } from '../types';
import {
  X,
  ListTodo,
  LogOut,
  Sparkles,
  User as UserIcon,
  Activity,
  Cpu,
  Database,
  ExternalLink,
  Flame,
  AlertTriangle,
  Clock,
  Hourglass,
  CheckCircle2,
  ChevronRight,
  Server,
  Layers,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface SidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChat?: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  isOpen,
  onClose,
  onOpenChat,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<TaskDashboardMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMetrics();
    }
  }, [isOpen]);

  const loadMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const data = await taskService.getDashboard();
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao carregar métricas no painel lateral:', err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/login');
  };

  const completionRate =
    metrics && metrics.totalTasks > 0
      ? Math.round((metrics.doneTasks / metrics.totalTasks) * 100)
      : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <aside className="w-screen max-w-md bg-white border-r border-slate-200 text-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Painel de Detalhes</h2>
                <p className="text-xs text-slate-500">Opções avançadas e estatísticas</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* User Profile Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : <UserIcon className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-orange-50 text-orange-700 border border-orange-200 uppercase tracking-wide">
                {user?.role === 'ROLE_ADMIN' ? 'Administrador' : 'Membro'}
              </span>
            </div>

            {/* Detailed Metrics Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-orange-600" />
                  Métricas Detalhadas
                </h4>
                <button
                  onClick={loadMetrics}
                  disabled={loadingMetrics}
                  className="text-[11px] text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  {loadingMetrics && <Loader2 className="w-3 h-3 animate-spin" />}
                  Atualizar
                </button>
              </div>

              {/* Progress Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Taxa de Conclusão Global</span>
                  <span className="font-bold text-emerald-600">{completionRate}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-600 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              {/* Grid with full status counts */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Total */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <ListTodo className="w-3.5 h-3.5 text-orange-600" />
                    <span>Total Tarefas</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{metrics?.totalTasks ?? 0}</span>
                </div>

                {/* A Fazer */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>A Fazer</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{metrics?.todoTasks ?? 0}</span>
                </div>

                {/* Em Andamento */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                    <Hourglass className="w-3.5 h-3.5" />
                    <span className="text-slate-600">Em Progresso</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{metrics?.inProgressTasks ?? 0}</span>
                </div>

                {/* Concluídas */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-slate-600">Concluídas</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{metrics?.doneTasks ?? 0}</span>
                </div>

                {/* Alta Prioridade */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-slate-600">Alta Prioridade</span>
                  </div>
                  <span className="text-lg font-bold text-rose-600">{metrics?.highPriorityTasks ?? 0}</span>
                </div>

                {/* Atrasadas */}
                <div className={`p-3 rounded-xl border ${
                  metrics && metrics.overdueTasks > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span className="text-slate-600">Atrasadas</span>
                  </div>
                  <span className={`text-lg font-bold ${
                    metrics && metrics.overdueTasks > 0 ? 'text-rose-600' : 'text-slate-600'
                  }`}>
                    {metrics?.overdueTasks ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Filter Navigation */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Filtros Rápidos
              </h4>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/tasks');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs text-left cursor-pointer"
                >
                  <span className="font-medium text-slate-800">Ver Todas as Tarefas (Kanban)</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    navigate('/tasks');
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs text-left cursor-pointer"
                >
                  <span className="font-medium text-amber-700">Tarefas em Andamento</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>

                {metrics && metrics.highPriorityTasks > 0 && (
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/tasks');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors text-xs text-left cursor-pointer"
                  >
                    <span className="font-medium text-rose-700">Apenas Alta Prioridade ({metrics.highPriorityTasks})</span>
                    <ChevronRight className="w-4 h-4 text-rose-400" />
                  </button>
                )}

                {onOpenChat && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenChat();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors text-xs text-left cursor-pointer"
                  >
                    <span className="font-medium text-purple-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                      Conversar com Assistente IA
                    </span>
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </button>
                )}
              </div>
            </div>

            {/* System Infrastructure & AI Diagnostics */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-600" />
                Ambiente & Infraestrutura
              </h4>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-orange-600" />
                    Backend API
                  </span>
                  <span className="text-emerald-700 font-mono font-medium">Spring Boot 4 (Online)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Modelo IA Local
                  </span>
                  <span className="text-purple-700 font-mono font-medium">Ollama (Llama 3.2)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    Banco de Dados
                  </span>
                  <span className="text-slate-700 font-mono font-medium">PostgreSQL 16</span>
                </div>
              </div>

              {/* Swagger Docs Link */}
              <a
                href="/swagger-ui/index.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3 rounded-xl bg-orange-50/70 hover:bg-orange-100/70 border border-orange-200 text-orange-700 text-xs font-medium transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-orange-600" />
                  <span>Documentação Swagger / OpenAPI</span>
                </div>
                <ChevronRight className="w-4 h-4 text-orange-600" />
              </a>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-mono">Taskman v1.0.0</span>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Encerrar Sessão
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

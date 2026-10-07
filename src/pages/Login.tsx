import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Lock, Mail, Loader2, AlertCircle, Sparkles } from 'lucide-react';

interface PresetUser {
  label: string;
  role: string;
  email: string;
  password: string;
  badgeColor: string;
}

const PRESET_USERS: PresetUser[] = [
  {
    label: 'Administrador',
    role: 'Admin',
    email: 'admin@taskman.com',
    password: 'admin123',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    label: 'Lucas Silva',
    role: 'Desenvolvedor',
    email: 'dev@taskman.com',
    password: 'admin123',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    label: 'Mariana Costa',
    role: 'Gestora',
    email: 'gestor@taskman.com',
    password: 'admin123',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
];

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickCredentials = (preset: PresetUser) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 mb-4 border border-blue-200">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Taskman</h1>
          <p className="text-sm text-slate-500 mt-1">Acesse sua conta para gerenciar suas tarefas</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
          </button>
        </form>

        {/* Contas de teste para demonstração */}
        <div className="mt-7 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Contas de demonstração:
            </span>
            <span className="text-[11px] text-slate-400 font-mono">senha: admin123</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PRESET_USERS.map((preset) => (
              <button
                key={preset.email}
                type="button"
                onClick={() => fillQuickCredentials(preset)}
                className="flex flex-col items-center p-2 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 transition-all text-center group cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors truncate w-full">
                  {preset.label}
                </span>
                <span className={`text-[10px] mt-1 px-1.5 py-0.5 rounded border ${preset.badgeColor}`}>
                  {preset.role}
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600/20 text-blue-500 mb-4 border border-blue-500/30">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">AI Task Manager</h1>
          <p className="text-sm text-slate-400 mt-1">Acesse sua conta para gerenciar suas tarefas com IA</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">E-mail</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm cursor-pointer mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar na Plataforma'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Ainda não tem uma conta?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium hover:underline">
            Criar conta gratuita
          </Link>
        </p>
      </div>
    </div>
  );
};


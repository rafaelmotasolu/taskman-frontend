import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AiChatDrawer } from './AiChatDrawer';
import {
  CheckSquare,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <NavLink to="/dashboard" className="flex items-center gap-2.5 text-white font-bold text-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-500 border border-blue-500/30 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="tracking-tight">Taskman<span className="text-blue-500">.ai</span></span>
            </NavLink>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`
                }
              >
                <ListTodo className="w-4 h-4" />
                Tarefas
              </NavLink>
            </nav>
          </div>

          {/* Right actions: AI Chat Toggle + Profile + Logout */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-sm font-medium transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Assistente IA</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <UserIcon className="w-4 h-4 text-slate-400" />
              <span className="font-medium max-w-[120px] truncate">{user?.name}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sair"
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* AI Assistant Drawer */}
      <AiChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};


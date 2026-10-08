import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { LayoutContextType } from '../hooks/useLayout';
import { AiChatDrawer } from './AiChatDrawer';
import { SidebarDrawer } from './SidebarDrawer';
import {
  CheckSquare,
  Home,
  ListTodo,
  Menu,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const contextValue: LayoutContextType = {
    openSidebar: () => setIsSidebarOpen(true),
    openChat: () => setIsChatOpen(true),
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand & Hamburger Menu */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Hamburger Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              title="Abrir painel lateral de métricas e opções avançadas"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <NavLink to="/dashboard" className="flex items-center gap-2.5 text-slate-900 font-bold text-lg">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="tracking-tight font-bold">Taskman</span>
            </NavLink>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <Home className="w-4 h-4" />
                Hub
              </NavLink>

              <NavLink
                to="/tasks"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-50 text-orange-700 border border-orange-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`
                }
              >
                <ListTodo className="w-4 h-4" />
                Tarefas
              </NavLink>
            </nav>
          </div>

          {/* Right actions: AI Chat Toggle + Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-sm font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Assistente IA</span>
            </button>

            <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

            <button
              onClick={() => setIsSidebarOpen(true)}
              className="hidden sm:flex items-center gap-2 text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shadow-xs"
              title="Ver detalhes do perfil e métricas"
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span className="font-medium max-w-[120px] truncate">{user?.name}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet context={contextValue} />
      </main>

      {/* Hamburger Lateral Sidebar Drawer */}
      <SidebarDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenChat={() => {
          setIsSidebarOpen(false);
          setIsChatOpen(true);
        }}
      />

      {/* AI Assistant Drawer */}
      <AiChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
};

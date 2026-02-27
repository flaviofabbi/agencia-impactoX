import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  FileText, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pontos', icon: MapPin, label: 'Pontos' },
    { to: '/empreendimentos', icon: Building2, label: 'Empreendimentos' },
    { to: '/relatorios', icon: FileText, label: 'Relatórios' },
    ...(isAdmin ? [{ to: '/usuarios', icon: Users, label: 'Usuários' }] : []),
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 pb-20 md:pb-0 md:pl-64">
      {/* Sidebar Desktop */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 flex-col bg-slate-900 text-white md:flex">
        <div className="flex h-20 items-center border-b border-slate-800 px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <span className="font-bold text-white">GC</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Gestão Captação</span>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-600 text-white" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
              {profile?.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{profile?.nome}</p>
              <p className="truncate text-xs text-slate-400 capitalize">{profile?.nivel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut size={20} />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-around border-t border-slate-200 bg-white px-2 py-3 md:hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 text-[10px] font-medium transition-colors",
                isActive ? "text-indigo-600" : "text-slate-400"
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-[10px] font-medium text-slate-400"
        >
          <LogOut size={20} />
          Sair
        </button>
      </nav>

      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};

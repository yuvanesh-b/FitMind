import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Dumbbell,
  Library,
  TrendingUp,
  Utensils,
  Apple,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Trainer', path: '/ai-trainer', icon: MessageSquare, badge: 'Agent' },
    { label: 'Workouts', path: '/workouts', icon: Dumbbell },
    { label: 'Exercises', path: '/exercises', icon: Library },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Nutrition', path: '/nutrition', icon: Utensils },
    { label: 'Nutrition Foods', path: '/nutrition-foods', icon: Apple },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-[252px] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] h-screen p-3.5 sm:p-4 justify-between select-none flex-shrink-0 overflow-y-auto transition-colors duration-200">
      <div>
        {/* Existing Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#865BC4] flex items-center justify-center text-white shadow-md shadow-[#865BC4]/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-[var(--text-primary)] tracking-wide">FitMind</h1>
            <p className="text-xs text-[#865BC4] font-bold tracking-wider uppercase">INTELLIGENT COACH</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? 'bg-[#865BC4] text-white font-bold shadow-md shadow-[#865BC4]/20'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#865BC4]/20 text-[#865BC4] border border-[#865BC4]/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User & Settings Footer */}
      <div className="pt-4 border-t border-[var(--border-subtle)] space-y-1">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
              isActive
                ? 'bg-[var(--bg-card)] text-[var(--text-primary)] font-bold border border-[#865BC4]/40'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            }`
          }
        >
          <div className="w-8 h-8 rounded-lg bg-[#865BC4] flex items-center justify-center text-white shrink-0 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="truncate">
            <p className="font-bold text-[var(--text-primary)] text-sm truncate">{user?.name || 'User Profile'}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[#865BC4]/15 border border-transparent hover:border-[#865BC4]/30 transition-all"
        >
          <LogOut className="w-5 h-5 text-[#865BC4]" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Dumbbell, TrendingUp, User } from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const items = [
    { label: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Workouts', path: '/workouts', icon: Dumbbell },
    { label: 'AI Coach', path: '/ai-trainer', icon: MessageSquare, isHighlight: true },
    { label: 'Progress', path: '/progress', icon: TrendingUp },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--bg-surface)]/95 backdrop-blur-lg border-t border-[var(--border-subtle)] z-40 px-2 flex items-center justify-around transition-colors duration-200">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-[#865BC4] font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            <div
              className={`p-1.5 rounded-lg ${
                item.isHighlight ? 'bg-[#865BC4] text-white shadow-md shadow-[#865BC4]/30' : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

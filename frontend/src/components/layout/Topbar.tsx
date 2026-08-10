import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { User as UserIcon, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  title?: string;
}

export const Topbar: React.FC<TopbarProps> = ({ title = 'Dashboard' }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="h-16 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 lg:px-8 flex items-center justify-between flex-shrink-0 z-30 transition-colors duration-200">
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)] tracking-tight">{title}</h1>
        <p className="text-xs text-[var(--text-secondary)] hidden sm:block">{currentDate}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Compact Light/Dark Theme Switcher Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--brand-primary)] border border-[var(--border-subtle)] transition-all shadow-sm flex items-center justify-center group active:scale-95"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-[#865BC4] group-hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Profile Shortcut */}
        <Link
          to="/profile"
          className="flex items-center gap-2.5 p-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] transition-all border border-[var(--border-subtle)]"
        >
          <div className="w-8 h-8 rounded-lg bg-[#865BC4] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)] hidden md:inline pr-2">{user?.name}</span>
        </Link>
      </div>
    </header>
  );
};

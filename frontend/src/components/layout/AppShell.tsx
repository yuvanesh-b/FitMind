import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNavigation } from './BottomNavigation';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, title }) => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-row transition-colors duration-200">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen overflow-hidden relative">
        <Topbar title={title} />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[var(--bg-main)]">
          {children}
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <BottomNavigation />
    </div>
  );
};
